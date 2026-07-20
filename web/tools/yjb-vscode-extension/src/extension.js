const vscode = require('vscode');
const crypto = require('crypto');

const VIEW_ID = 'yjb.dashboard';
const YANGJIBAO_SIGN_SECRET = 'YxmKSrQR4uoJ5lOoWIhcbd7SlUEh9OOc';

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const provider = new YjbDashboardProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(VIEW_ID, provider, {
      webviewOptions: {
        retainContextWhenHidden: true
      }
    }),
    vscode.commands.registerCommand('yjb.refresh', () => provider.refresh()),
    vscode.commands.registerCommand('yjb.showDiagnostics', () => provider.showDiagnostics()),
    vscode.commands.registerCommand('yjb.openSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', '养基宝');
    }),
    vscode.workspace.onDidChangeConfiguration(event => {
      if (
        event.affectsConfiguration('yjb.apiUrl') ||
        event.affectsConfiguration('yjb.useYangjibaoApi') ||
        event.affectsConfiguration('yjb.yangjibaoBaseUrl') ||
        event.affectsConfiguration('yjb.authToken') ||
        event.affectsConfiguration('yjb.autoRefreshSeconds')
      ) {
        provider.reloadConfiguration();
      }
    })
  );
}

function deactivate() {}

class YjbDashboardProvider {
  /**
   * @param {vscode.ExtensionContext} context
   */
  constructor(context) {
    this.context = context;
    this.view = undefined;
    this.refreshTimer = undefined;
    this.lastData = getDemoData();
    this.lastUpdatedAt = '';
    this.selectedAccountId = '';
    this.diagnostics = [];
  }

  /**
   * @param {vscode.WebviewView} webviewView
   */
  resolveWebviewView(webviewView) {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true
    };

    webviewView.webview.html = getHtml();
    webviewView.webview.onDidReceiveMessage(message => {
      if (!message || typeof message.command !== 'string') {
        return;
      }

      if (message.command === 'refresh') {
        this.refresh();
        return;
      }

      if (message.command === 'openSettings') {
        vscode.commands.executeCommand('yjb.openSettings');
        return;
      }

      if (message.command === 'showDiagnostics') {
        this.showDiagnostics();
        return;
      }

      if (message.command === 'switchTab') {
        this.postState({ activeTab: ['holding', 'watchlist', 'penetration'].includes(message.tab) ? message.tab : 'holding' });
        return;
      }

      if (message.command === 'switchAccount') {
        this.switchAccount(message.accountId);
        return;
      }

      if (message.command === 'searchFund') {
        this.searchFund(message.keyword);
        return;
      }

      if (message.command === 'addHolding') {
        this.addHolding(message.payload);
        return;
      }

      if (message.command === 'addWatch') {
        this.addWatch(message.fund);
        return;
      }

      if (message.command === 'removeWatch') {
        this.removeWatch(message.code);
      }
    });

    this.reloadConfiguration();
    this.postState({ data: this.lastData, loading: false, updatedAt: this.lastUpdatedAt });
    this.refresh();
  }

  reloadConfiguration() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }

    const intervalSeconds = getConfig().autoRefreshSeconds;
    if (intervalSeconds > 0) {
      this.refreshTimer = setInterval(() => this.refresh({ silent: true }), intervalSeconds * 1000);
    }

    this.refresh({ silent: true });
  }

  /**
   * @param {{ silent?: boolean }} options
   */
  async refresh(options = {}) {
    if (!this.view) {
      return;
    }

    this.postState({ loading: true, error: '' });

    try {
      const data = await fetchPortfolioData({ accountId: this.selectedAccountId });
      if (data.selectedAccount && data.selectedAccount.id) {
        this.selectedAccountId = data.selectedAccount.id;
      }
      data.watchlist = this.getWatchlist();
      this.addDiagnostic('refresh', {
        selectedAccountId: data.selectedAccount && data.selectedAccount.id,
        selectedAccountName: data.selectedAccount && data.selectedAccount.name,
        accountListCount: Array.isArray(data.accountList) ? data.accountList.length : 0,
        accountsCount: Array.isArray(data.accounts) ? data.accounts.length : 0,
        fundsCount: Array.isArray(data.funds) ? data.funds.length : 0,
        summaryAsset: data.summary && data.summary.asset
      });
      this.lastData = data;
      this.lastUpdatedAt = formatTime(new Date());
      this.postState({
        data,
        loading: false,
        error: '',
        updatedAt: this.lastUpdatedAt
      });

      if (!options.silent) {
        vscode.window.setStatusBarMessage(`养基宝已刷新 ${this.lastUpdatedAt}`, 2500);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.addDiagnostic('refresh-error', { message });
      this.postState({
        data: this.lastData,
        loading: false,
        error: message,
        updatedAt: this.lastUpdatedAt
      });

      if (!options.silent) {
        vscode.window.showWarningMessage(`养基宝刷新失败: ${message}`);
      }
    }
  }

  /**
   * @param {Record<string, unknown>} payload
   */
  postState(payload) {
    if (!this.view) {
      return;
    }
    this.view.webview.postMessage({ type: 'state', ...payload });
  }

  addDiagnostic(type, detail) {
    const config = getConfig();
    this.diagnostics.unshift({
      time: new Date().toLocaleTimeString('zh-CN'),
      type,
      detail,
      config: {
        useYangjibaoApi: config.useYangjibaoApi,
        baseUrl: config.yangjibaoBaseUrl,
        hasToken: Boolean(config.authToken)
      }
    });
    this.diagnostics = this.diagnostics.slice(0, 12);
  }

  showDiagnostics() {
    const data = this.lastData || {};
    const lines = [
      '养基宝诊断信息',
      '',
      `接口模式: ${getConfig().useYangjibaoApi ? '养基宝接口' : '示例/自定义接口'}`,
      `已配置 token: ${getConfig().authToken ? '是' : '否'}`,
      `当前账户: ${data.selectedAccount ? `${data.selectedAccount.name} (${data.selectedAccount.id})` : '-'}`,
      `账户页签数量: ${Array.isArray(data.accountList) ? data.accountList.length : 0}`,
      `账户汇总数量: ${Array.isArray(data.accounts) ? data.accounts.length : 0}`,
      `基金明细数量: ${Array.isArray(data.funds) ? data.funds.length : 0}`,
      '',
      '最近事件:',
      ...this.diagnostics.map(item => `${item.time} ${item.type} ${JSON.stringify(item.detail)}`)
    ];

    vscode.workspace
      .openTextDocument({
        language: 'text',
        content: lines.join('\n')
      })
      .then(document => vscode.window.showTextDocument(document, { preview: true }));
  }

  async searchFund(keyword) {
    const query = String(keyword || '').trim();
    if (!query) {
      this.postState({ searchResults: [], searching: false, searchError: '' });
      return;
    }

    const config = getConfig();
    if (!config.useYangjibaoApi) {
      const demoResults = getDemoSearchResults(query);
      this.postState({ searchResults: demoResults, searching: false, searchError: '' });
      return;
    }

    this.postState({ searching: true, searchError: '' });
    try {
      const accountId = this.lastData && this.lastData.selectedAccount ? this.lastData.selectedAccount.id : '';
      const suffix = accountId ? `&account_id=${encodeURIComponent(accountId)}` : '';
      const result = await requestYangjibao(config, `/search_fund?keyword=${encodeURIComponent(query)}${suffix}`);
      this.postState({
        searchResults: normalizeFundSearchResults(result),
        searching: false,
        searchError: ''
      });
    } catch (error) {
      this.postState({
        searchResults: [],
        searching: false,
        searchError: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async switchAccount(accountId) {
    this.selectedAccountId = String(accountId || '');
    await this.refresh({ silent: true });
  }

  async addHolding(payload) {
    const config = getConfig();
    const item = payload && payload.fund ? payload.fund : {};
    const holdShare = String(payload && payload.holdShare ? payload.holdShare : '').trim();
    const holdCost = String(payload && payload.holdCost ? payload.holdCost : '').trim();
    const accountId =
      (payload && payload.accountId) ||
      (this.lastData && this.lastData.selectedAccount && this.lastData.selectedAccount.id) ||
      '';

    if (!item.code || !holdShare || !holdCost) {
      this.postState({ actionError: '请选择基金并填写份额、成本' });
      return;
    }

    if (!/^\d{1,6}(\.\d{1,4})?$/.test(holdShare) || !/^\d{1,4}(\.\d{1,4})?$/.test(holdCost)) {
      this.postState({ actionError: '份额或成本格式不正确' });
      return;
    }

    if (!config.useYangjibaoApi) {
      this.addWatch(item);
      this.postState({ actionError: '', actionMessage: '示例模式下已加入本地自选' });
      return;
    }

    try {
      await requestYangjibao(config, '/fund_hold', {
        method: 'POST',
        body: {
          items: [
            {
              fund_id: item.fund_id || item.id,
              fund_code: item.code,
              hold_share: holdShare,
              hold_cost: holdCost,
              model: 1
            }
          ],
          account_id: accountId,
          sync_optional: 0
        }
      });
      this.postState({ actionError: '', actionMessage: '已新增持有' });
      await this.refresh({ silent: true });
    } catch (error) {
      this.postState({ actionError: error instanceof Error ? error.message : String(error) });
    }
  }

  addWatch(fund) {
    if (!fund || !fund.code) {
      return;
    }

    const watchlist = this.getWatchlist();
    if (!watchlist.some(item => item.code === fund.code)) {
      watchlist.unshift(normalizeWatchFund(fund));
      this.context.globalState.update('watchlist', watchlist);
    }
    this.lastData.watchlist = watchlist;
    this.postState({ data: this.lastData, actionError: '', actionMessage: '已加入自选' });
  }

  removeWatch(code) {
    const watchlist = this.getWatchlist().filter(item => item.code !== code);
    this.context.globalState.update('watchlist', watchlist);
    this.lastData.watchlist = watchlist;
    this.postState({ data: this.lastData, actionError: '', actionMessage: '已移出自选' });
  }

  getWatchlist() {
    const value = this.context.globalState.get('watchlist');
    return Array.isArray(value) ? value : [];
  }
}

async function fetchPortfolioData(options = {}) {
  const config = getConfig();
  if (config.useYangjibaoApi) {
    return fetchYangjibaoData(config, options);
  }

  if (!config.apiUrl) {
    return getDemoData();
  }

  const headers = {
    Accept: 'application/json'
  };

  if (config.authToken) {
    headers.Authorization = `Bearer ${config.authToken}`;
  }

  const response = await fetch(config.apiUrl, { headers });
  if (!response.ok) {
    throw new Error(`接口返回 ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  return normalizePayload(payload);
}

function getConfig() {
  const config = vscode.workspace.getConfiguration('yjb');
  return {
    apiUrl: String(config.get('apiUrl') || '').trim(),
    useYangjibaoApi: Boolean(config.get('useYangjibaoApi')),
    yangjibaoBaseUrl: String(config.get('yangjibaoBaseUrl') || 'http://browser-plug-api.yangjibao.com').trim(),
    authToken: String(config.get('authToken') || '').trim(),
    autoRefreshSeconds: Math.max(0, Number(config.get('autoRefreshSeconds') || 0))
  };
}

/**
 * @param {{ yangjibaoBaseUrl: string, authToken: string }} config
 */
async function fetchYangjibaoData(config, options = {}) {
  const [indexData, collectData, accountListData] = await Promise.all([
    requestYangjibao(config, '/index_data'),
    requestYangjibao(config, '/account_collect'),
    requestYangjibao(config, '/user_account')
  ]);
  const accountList = normalizeYangjibaoAccountList(accountListData);
  const selectedAccount = getSelectedAccount(accountListData, accountList, options.accountId);
  const isAllAccount = selectedAccount && selectedAccount.id === 'all';
  const funds = selectedAccount && !isAllAccount
    ? normalizeYangjibaoFunds(await requestYangjibao(config, `/fund_hold?account_id=${encodeURIComponent(selectedAccount.id)}`))
    : [];

  return normalizePayload({
    indices: normalizeYangjibaoIndices(indexData),
    accounts: normalizeYangjibaoAccounts(collectData, accountList),
    summary: normalizeYangjibaoSummary(collectData),
    accountList,
    selectedAccount,
    funds
  });
}

/**
 * @param {{ yangjibaoBaseUrl: string, authToken: string }} config
 * @param {string} apiPath
 * @param {{ method?: string, body?: unknown }} options
 */
async function requestYangjibao(config, apiPath, options = {}) {
  const baseUrl = config.yangjibaoBaseUrl.replace(/\/+$/, '');
  const url = `${baseUrl}${apiPath}`;
  const requestTime = Math.trunc(Date.now() / 1000);
  let basePath = new URL(baseUrl).pathname;
  if (basePath === '/') {
    basePath = '';
  }

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Request-Time': String(requestTime),
    Authorization: config.authToken,
    'Request-Sign': md5(`${basePath}${apiPath.split('?')[0]}${config.authToken}${requestTime}${YANGJIBAO_SIGN_SECRET}`)
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  if (!response.ok) {
    throw new Error(`养基宝接口返回 ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  if (payload && payload.code !== undefined && Number(payload.code) !== 200) {
    throw new Error(payload.message || `养基宝接口业务状态 ${payload.code}`);
  }

  return payload && payload.data !== undefined ? payload.data : payload;
}

/**
 * @param {any} data
 */
function normalizeYangjibaoIndices(data) {
  const source = data && typeof data === 'object' ? data : {};
  const known = [
    ['1.000001', '上证指数'],
    ['0.399001', '深证成指'],
    ['0.399006', '创业板指'],
    ['1.000300', '沪深300'],
    ['1.000016', '上证50']
  ];

  return known
    .map(([code, fallbackName]) => {
      const item = source[code];
      if (!item) {
        return undefined;
      }
      return {
        name: item.name || item.title || fallbackName,
        change: item.zde ?? item.change ?? item.price_change ?? item.num ?? 0,
        percent: item.dir ?? item.zdf ?? item.percent ?? item.change_percent ?? 0
      };
    })
    .filter(Boolean);
}

/**
 * @param {any} data
 */
function normalizeYangjibaoAccounts(data, accountList = []) {
  const accounts = Array.isArray(data && data.account_data)
    ? data.account_data
    : Array.isArray(data && data.accounts)
      ? data.accounts
      : [];

  if (accounts.length) {
    return accounts.map((item, index) => ({
      id: item.id || item.account_id || matchAccountId(item.title || item.name || item.account_name, accountList) || `account-${index}`,
      name: item.title || item.name || item.account_name || '账户',
      channel: item.platform || item.title || item.name || '',
      asset: item.total_amount ?? item.total_assets ?? item.asset ?? item.assets ?? item.money ?? 0,
      holdIncome: item.hold_income ?? item.holding_income ?? item.total_income ?? item.income ?? item.profit ?? 0,
      holdPercent: item.hold_income_rate ?? item.holding_income_rate ?? item.total_income_rate ?? item.income_rate ?? 0,
      dayIncome: item.today_income ?? item.day_income ?? item.daily_income ?? 0,
      dayPercent: item.today_income_rate ?? item.day_income_rate ?? item.daily_income_rate ?? 0,
      upCount: item.up_count ?? item.rise_count ?? item.rise ?? 0,
      downCount: item.down_count ?? item.fall_count ?? item.fall ?? 0
    }));
  }

  return [
    {
      id: 'all',
      name: '全部账户',
      asset: data.total_amount ?? data.total_assets ?? data.asset ?? data.assets ?? 0,
      holdIncome: data.hold_income ?? data.total_income ?? 0,
      holdPercent: data.hold_income_rate ?? data.total_income_rate ?? 0,
      dayIncome: data.today_income ?? 0,
      dayPercent: data.today_income_rate ?? 0,
      upCount: data.up_count ?? data.rise_count ?? 0,
      downCount: data.down_count ?? data.fall_count ?? 0
    }
  ];
}

function matchAccountId(name, accountList) {
  const normalized = stringValue(name);
  if (!normalized) {
    return '';
  }
  const matched = accountList.find(item => item.id !== 'all' && (item.name === normalized || normalized.includes(item.name) || item.name.includes(normalized)));
  return matched ? matched.id : '';
}

/**
 * @param {any} data
 */
function normalizeYangjibaoSummary(data) {
  return {
    asset: data.total_amount ?? data.total_assets ?? data.asset ?? data.assets ?? 0,
    dayIncome: data.today_income ?? data.day_income ?? 0,
    dayPercent: data.today_income_rate ?? data.day_income_rate ?? 0,
    upCount: data.up_count ?? data.rise_count ?? 0,
    downCount: data.down_count ?? data.fall_count ?? 0
  };
}

/**
 * @param {any} data
 */
function normalizeYangjibaoAccountList(data) {
  const list = Array.isArray(data && data.list) ? data.list : Array.isArray(data) ? data : [];
  const accounts = list.map((item, index) => ({
    id: stringValue(item.id || item.account_id || `account-${index}`),
    name: stringValue(item.title || item.name || item.account_name || `账户 ${index + 1}`)
  }));
  return [{ id: 'all', name: '全部' }, ...accounts];
}

/**
 * @param {any} raw
 * @param {{ id: string, name: string }[]} list
 */
function getSelectedAccount(raw, list, preferredAccountId) {
  if (!list.length) {
    return undefined;
  }

  if (preferredAccountId) {
    const preferred = list.find(item => item.id === String(preferredAccountId));
    if (preferred) {
      return preferred;
    }
  }

  const targetId = raw && raw.target_account_id;
  if (targetId) {
    const matched = list.find(item => item.id === String(targetId));
    if (matched) {
      return matched;
    }
  }

  const firstRealAccount = list.find(item => item.id !== 'all');
  return firstRealAccount || list[0];
}

/**
 * @param {any[]} data
 */
function normalizeYangjibaoFunds(data) {
  const list = Array.isArray(data) ? data : Array.isArray(data && data.list) ? data.list : [];
  return list.map(item => {
    const nv = item.nv_info || {};
    const holdShare = numberValue(item.hold_share);
    const holdCost = numberValue(item.hold_cost);
    const currentValue = numberValue(item.money ?? item.hold_sum ?? item.market_value);
    const estimateValue = numberValue(nv.gsz ?? nv.estimate_value ?? nv.dwjz);
    const lastValue = numberValue(nv.dwjz ?? nv.nav);
    const dayPercent = numberValue(nv.gszzl ?? nv.rzzl ?? nv.day_rate);
    const holdIncome = currentValue && holdShare && holdCost ? currentValue - holdShare * holdCost : numberValue(item.hold_earn);
    const dayIncome = currentValue ? (currentValue * dayPercent) / 100 : numberValue(item.today_income);

    return {
      id: stringValue(item.fund_id || item.id || item.code),
      fund_id: stringValue(item.fund_id || item.id || ''),
      code: stringValue(item.code),
      name: stringValue(item.short_name || item.name || item.fund_name || item.code),
      holdShare,
      holdCost,
      currentValue,
      dayIncome,
      dayPercent,
      holdIncome,
      latestNetValue: lastValue || estimateValue,
      estimateValue,
      netValueDate: stringValue(nv.jzrq || nv.gztime || ''),
      fuzzy: Boolean(item.is_fuzzy)
    };
  });
}

/**
 * @param {any} data
 */
function normalizeFundSearchResults(data) {
  const list = Array.isArray(data) ? data : Array.isArray(data && data.list) ? data.list : [];
  return list.map(normalizeWatchFund);
}

function normalizeWatchFund(item) {
  const nv = item.nv_info || item;
  return {
    id: stringValue(item.id || item.fund_id || item.code),
    fund_id: stringValue(item.fund_id || item.id || ''),
    code: stringValue(item.code || item.fund_code),
    name: stringValue(item.short_name || item.name || item.fund_name || item.title || item.code),
    dayPercent: numberValue(item.dayPercent ?? item.gszzl ?? item.rzzl ?? nv.gszzl ?? nv.rzzl),
    latestNetValue: numberValue(item.latestNetValue ?? item.dwjz ?? item.gsz ?? nv.dwjz ?? nv.gsz),
    netValueDate: stringValue(item.netValueDate || item.jzrq || item.gztime || nv.jzrq || nv.gztime),
    isHold: Boolean(item.is_hold)
  };
}

/**
 * @param {any} payload
 */
function normalizePayload(payload) {
  const body = payload && typeof payload === 'object' && payload.data ? payload.data : payload;
  const indices = Array.isArray(body.indices || body.markets || body.indexList)
    ? body.indices || body.markets || body.indexList
    : [];
  const accounts = Array.isArray(body.accounts || body.portfolios || body.holdings)
    ? body.accounts || body.portfolios || body.holdings
    : [];
  const summary = body.summary || body.total || {};
  const funds = Array.isArray(body.funds || body.fundList || body.items) ? body.funds || body.fundList || body.items : [];
  const accountList = Array.isArray(body.accountList) ? body.accountList : [];
  const selectedAccount = body.selectedAccount;
  const watchlist = Array.isArray(body.watchlist) ? body.watchlist : [];

  const normalizedAccounts = accounts.map((item, index) => ({
    id: stringValue(item.id || item.code || item.name || `account-${index}`),
    name: stringValue(item.name || item.title || item.platform || '账户'),
    channel: stringValue(item.channel || item.platform || item.name || ''),
    asset: numberValue(item.asset ?? item.totalAsset ?? item.amount ?? item.money),
    holdIncome: numberValue(item.holdIncome ?? item.holdingIncome ?? item.profit ?? item.totalProfit),
    holdPercent: numberValue(item.holdPercent ?? item.holdingPercent ?? item.profitPercent),
    dayIncome: numberValue(item.dayIncome ?? item.todayIncome ?? item.dailyIncome ?? item.dayProfit),
    dayPercent: numberValue(item.dayPercent ?? item.todayPercent ?? item.dailyPercent ?? item.dayProfitPercent),
    upCount: numberValue(item.upCount ?? item.riseCount),
    downCount: numberValue(item.downCount ?? item.fallCount)
  }));

  return {
    indices: indices.map(item => ({
      name: stringValue(item.name || item.title || item.indexName || item.code),
      change: numberValue(item.change ?? item.increase ?? item.point),
      percent: numberValue(item.percent ?? item.changePercent ?? item.rate)
    })),
    accounts: normalizedAccounts,
    summary: {
      asset: numberValue(summary.asset ?? summary.totalAsset ?? sum(normalizedAccounts, 'asset')),
      dayIncome: numberValue(summary.dayIncome ?? summary.todayIncome ?? sum(normalizedAccounts, 'dayIncome')),
      dayPercent: numberValue(summary.dayPercent ?? summary.todayPercent ?? percentByAsset(normalizedAccounts)),
      upCount: numberValue(summary.upCount ?? sum(normalizedAccounts, 'upCount')),
      downCount: numberValue(summary.downCount ?? sum(normalizedAccounts, 'downCount'))
    },
    funds: funds.map(item => ({
      id: stringValue(item.id || item.fund_id || item.code),
      fund_id: stringValue(item.fund_id || item.id || ''),
      code: stringValue(item.code || item.fund_code),
      name: stringValue(item.name || item.short_name || item.fund_name || item.code),
      holdShare: numberValue(item.holdShare ?? item.hold_share),
      holdCost: numberValue(item.holdCost ?? item.hold_cost),
      currentValue: numberValue(item.currentValue ?? item.money ?? item.hold_sum),
      dayIncome: numberValue(item.dayIncome ?? item.today_income),
      dayPercent: numberValue(item.dayPercent ?? item.gszzl ?? item.rzzl),
      holdIncome: numberValue(item.holdIncome ?? item.hold_earn),
      latestNetValue: numberValue(item.latestNetValue ?? item.dwjz ?? item.gsz),
      estimateValue: numberValue(item.estimateValue ?? item.gsz),
      netValueDate: stringValue(item.netValueDate ?? item.jzrq ?? item.gztime)
    })),
    accountList,
    selectedAccount,
    watchlist
  };
}

function getDemoData() {
  return {
    indices: [
      { name: '上证指数', change: -12.41, percent: -0.3 },
      { name: '深证成指', change: -148.98, percent: -0.95 },
      { name: '创业板指', change: -43.25, percent: -1.07 },
      { name: '沪深300', change: -44.02, percent: -0.9 },
      { name: '上证50', change: -18.8, percent: -0.64 }
    ],
    accounts: [
      {
        id: 'alipay',
        name: '支付宝',
        channel: '支付宝',
        asset: 10179.38,
        holdIncome: 789.61,
        holdPercent: 8.47,
        dayIncome: -72.71,
        dayPercent: -0.71,
        upCount: 4,
        downCount: 11
      }
    ],
    funds: [
      {
        id: '000001',
        fund_id: '000001',
        code: '000001',
        name: '华夏成长混合',
        holdShare: 1200,
        holdCost: 1.2345,
        currentValue: 1532.4,
        dayIncome: -8.21,
        dayPercent: -0.52,
        holdIncome: 50.99,
        latestNetValue: 1.277,
        estimateValue: 1.274,
        netValueDate: '05-28'
      }
    ],
    summary: {
      asset: 10179.38,
      dayIncome: -72.71,
      dayPercent: -0.71,
      upCount: 4,
      downCount: 11
    }
  };
}

function getDemoSearchResults(query) {
  const samples = [
    { id: '000001', fund_id: '000001', code: '000001', name: '华夏成长混合', dayPercent: -0.52, latestNetValue: 1.277 },
    { id: '110022', fund_id: '110022', code: '110022', name: '易方达消费行业股票', dayPercent: 0.36, latestNetValue: 3.518 },
    { id: '161725', fund_id: '161725', code: '161725', name: '招商中证白酒指数', dayPercent: -1.18, latestNetValue: 0.821 }
  ];
  const normalized = String(query || '').trim().toLowerCase();
  return samples.filter(item => item.code.includes(normalized) || item.name.toLowerCase().includes(normalized));
}

function getHtml() {
  const nonce = getNonce();

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>养基宝</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: var(--vscode-sideBar-background);
      --fg: var(--vscode-sideBar-foreground);
      --muted: var(--vscode-descriptionForeground);
      --line: var(--vscode-sideBarSectionHeader-border, rgba(128, 128, 128, 0.22));
      --panel: var(--vscode-editorWidget-background);
      --hover: var(--vscode-list-hoverBackground);
      --primary: var(--vscode-button-background);
      --primary-fg: var(--vscode-button-foreground);
      --green: #00a65a;
      --red: #ff4d4f;
      --green-bg: rgba(0, 166, 90, 0.14);
      --red-bg: rgba(255, 77, 79, 0.14);
      --blue: #2f80ed;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      height: 100%;
      margin: 0;
      padding: 0;
      background: var(--bg);
      color: var(--fg);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }

    button {
      color: inherit;
      font: inherit;
    }

    .app {
      min-height: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px 10px 48px;
    }

    .topbar {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .brand {
      width: 34px;
      height: 34px;
      flex: 0 0 auto;
      border-radius: 50%;
      background: var(--blue);
      color: #fff;
      display: grid;
      place-items: center;
      font-size: 12px;
      font-weight: 700;
    }

    .tabs {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
      flex: 1 1 auto;
    }

    .tab {
      border: 0;
      border-radius: 3px;
      background: transparent;
      color: var(--muted);
      padding: 4px 7px;
      cursor: pointer;
    }

    .tab.active {
      color: var(--fg);
      background: var(--hover);
      font-weight: 600;
    }

    .icon-button {
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: var(--muted);
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      cursor: pointer;
      flex: 0 0 auto;
    }

    .icon-button:hover,
    .tab:hover {
      background: var(--hover);
      color: var(--fg);
    }

    .icon-button.loading svg {
      animation: spin 0.85s linear infinite;
    }

    .indices {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(104px, 1fr));
      gap: 8px;
    }

    .index-card {
      border-radius: 4px;
      padding: 7px 8px;
      background: var(--green-bg);
      min-height: 48px;
    }

    .index-card.positive {
      background: var(--red-bg);
    }

    .index-name {
      color: var(--fg);
      opacity: 0.9;
      font-size: 12px;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .index-values {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 6px;
      color: var(--green);
      font-weight: 700;
    }

    .index-card.positive .index-values {
      color: var(--red);
    }

    .subtabs {
      display: flex;
      gap: 12px;
      border-bottom: 1px solid var(--line);
      padding-bottom: 6px;
    }

    .subtab {
      border: 0;
      background: transparent;
      padding: 0 0 5px;
      color: var(--muted);
      cursor: pointer;
      position: relative;
    }

    .subtab.active {
      color: var(--fg);
      font-weight: 600;
    }

    .subtab.active::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: -7px;
      height: 2px;
      background: var(--primary);
    }

    .status {
      color: var(--muted);
      font-size: 12px;
      min-height: 18px;
    }

    .status.error {
      color: var(--red);
    }

    .accounts {
      display: grid;
      gap: 10px;
    }

    .account-card {
      border: 1px solid var(--line);
      border-radius: 6px;
      overflow: hidden;
      background: var(--panel);
    }

    .account-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 9px 10px;
      border-bottom: 1px solid var(--line);
    }

    .account-name {
      display: flex;
      align-items: center;
      gap: 7px;
      min-width: 0;
      font-weight: 700;
    }

    .pay-icon {
      width: 18px;
      height: 18px;
      border-radius: 3px;
      background: #1677ff;
      color: #fff;
      display: grid;
      place-items: center;
      font-size: 12px;
      flex: 0 0 auto;
    }

    .trend {
      display: flex;
      gap: 9px;
      font-size: 12px;
      white-space: nowrap;
    }

    .rise,
    .positive-text {
      color: var(--red);
    }

    .fall,
    .negative-text {
      color: var(--green);
    }

    .account-body {
      padding: 10px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .metric.full {
      grid-column: 1 / -1;
    }

    .label {
      color: var(--muted);
      font-size: 12px;
      margin-bottom: 4px;
    }

    .value {
      font-size: 15px;
      font-weight: 700;
      line-height: 1.2;
    }

    .percent-pill {
      display: inline-block;
      border-radius: 4px;
      padding: 2px 5px;
      margin-left: 4px;
      background: var(--green-bg);
      color: var(--green);
      font-size: 12px;
    }

    .percent-pill.positive {
      background: var(--red-bg);
      color: var(--red);
    }

    .empty {
      border: 1px dashed var(--line);
      border-radius: 6px;
      padding: 24px 12px;
      color: var(--muted);
      text-align: center;
    }

    .fund-list,
    .watch-list,
    .search-results {
      display: grid;
      gap: 8px;
    }

    .fund-row,
    .search-row {
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--panel);
      padding: 9px 10px;
      display: grid;
      gap: 7px;
    }

    .fund-main,
    .search-main {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      align-items: start;
    }

    .fund-name {
      font-weight: 700;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fund-code,
    .fund-meta {
      color: var(--muted);
      font-size: 12px;
    }

    .fund-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
      font-size: 12px;
    }

    .fund-grid b {
      display: block;
      margin-top: 2px;
      font-size: 13px;
      color: var(--fg);
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .penetration-summary {
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--panel);
      padding: 10px;
      display: grid;
      gap: 8px;
    }

    .penetration-total {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .penetration-total .value {
      font-size: 18px;
    }

    .bar {
      height: 7px;
      border-radius: 999px;
      overflow: hidden;
      background: var(--line);
    }

    .bar-fill {
      height: 100%;
      border-radius: inherit;
      background: var(--green);
    }

    .bar-fill.positive {
      background: var(--red);
    }

    .penetration-note {
      color: var(--muted);
      font-size: 12px;
      line-height: 1.5;
    }

    .search-panel {
      display: grid;
      gap: 8px;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 10px;
      background: var(--panel);
    }

    .field {
      display: grid;
      gap: 4px;
    }

    .field label {
      color: var(--muted);
      font-size: 12px;
    }

    input {
      width: 100%;
      min-height: 28px;
      border: 1px solid var(--vscode-input-border, var(--line));
      border-radius: 4px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      padding: 4px 7px;
      font: inherit;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .primary-button,
    .ghost-button {
      min-height: 28px;
      border-radius: 4px;
      padding: 4px 9px;
      cursor: pointer;
      border: 1px solid var(--line);
      white-space: nowrap;
    }

    .primary-button {
      color: var(--primary-fg);
      background: var(--primary);
      border-color: var(--primary);
    }

    .ghost-button {
      color: var(--fg);
      background: transparent;
    }

    .row-actions {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
      flex-wrap: wrap;
    }

    .message {
      color: var(--muted);
      font-size: 12px;
      min-height: 16px;
    }

    .message.error {
      color: var(--red);
    }

    .footer {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      min-height: 40px;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 10px;
      padding: 7px 10px;
      border-top: 1px solid var(--line);
      background: var(--bg);
    }

    .add {
      border: 0;
      background: transparent;
      color: var(--muted);
      padding: 3px 0;
      cursor: pointer;
      white-space: nowrap;
    }

    .summary {
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
    }

    .summary strong {
      color: var(--fg);
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .income-badge {
      justify-self: end;
      border: 1px solid var(--green);
      color: var(--green);
      border-radius: 4px;
      padding: 4px 7px;
      font-weight: 700;
      white-space: nowrap;
    }

    .income-badge.positive {
      border-color: var(--red);
      color: var(--red);
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  </style>
</head>
<body>
  <div class="app">
    <header class="topbar">
      <div class="brand">养基宝</div>
      <nav class="tabs" aria-label="主分类">
        <button class="tab active" type="button" data-tab="holding">持有</button>
        <button class="tab" type="button" data-tab="watchlist">自选</button>
        <button class="tab" type="button" data-tab="penetration">穿透</button>
      </nav>
      <button class="icon-button" id="refresh" type="button" title="刷新" aria-label="刷新">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 6v5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M19 11a7 7 0 1 0-2 4.9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
      <button class="icon-button" id="settings" type="button" title="设置" aria-label="设置">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" stroke="currentColor" stroke-width="1.8"/>
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H2.8a2 2 0 1 1 0-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V2.8a2 2 0 1 1 4 0V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </button>
      <button class="icon-button" id="diagnostics" type="button" title="诊断" aria-label="诊断">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 5h16M4 12h16M4 19h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    </header>

    <section class="indices" id="indices"></section>

    <nav class="subtabs" id="accountTabs" aria-label="账户分类"></nav>

    <div class="status" id="status"></div>
    <section class="search-panel" id="searchPanel">
      <div class="field">
        <label for="fundSearch">搜索基金</label>
        <input id="fundSearch" type="search" placeholder="输入基金代码或名称">
      </div>
      <div class="form-grid">
        <div class="field">
          <label for="holdShare">持有份额</label>
          <input id="holdShare" type="text" inputmode="decimal" placeholder="如 1000">
        </div>
        <div class="field">
          <label for="holdCost">持仓成本</label>
          <input id="holdCost" type="text" inputmode="decimal" placeholder="如 1.2345">
        </div>
      </div>
      <div class="message" id="actionMessage"></div>
      <div class="search-results" id="searchResults"></div>
    </section>
    <main class="accounts" id="accounts"></main>
  </div>

  <footer class="footer">
    <button class="add" id="addToggle" type="button">+ 新增持有</button>
    <div class="summary" id="summary"></div>
    <div class="income-badge" id="incomeBadge"></div>
  </footer>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const state = {
      activeTab: 'holding',
      loading: false,
      updatedAt: '',
      error: '',
      searching: false,
      searchResults: [],
      actionError: '',
      actionMessage: '',
      addOpen: false,
      data: {
        indices: [],
        accounts: [],
        accountList: [],
        selectedAccount: null,
        funds: [],
        watchlist: [],
        summary: {}
      }
    };

    const els = {
      tabs: Array.from(document.querySelectorAll('.tab')),
      refresh: document.getElementById('refresh'),
      settings: document.getElementById('settings'),
      diagnostics: document.getElementById('diagnostics'),
      indices: document.getElementById('indices'),
      accountTabs: document.getElementById('accountTabs'),
      accounts: document.getElementById('accounts'),
      searchPanel: document.getElementById('searchPanel'),
      fundSearch: document.getElementById('fundSearch'),
      holdShare: document.getElementById('holdShare'),
      holdCost: document.getElementById('holdCost'),
      searchResults: document.getElementById('searchResults'),
      actionMessage: document.getElementById('actionMessage'),
      addToggle: document.getElementById('addToggle'),
      status: document.getElementById('status'),
      summary: document.getElementById('summary'),
      incomeBadge: document.getElementById('incomeBadge')
    };

    els.refresh.addEventListener('click', () => vscode.postMessage({ command: 'refresh' }));
    els.settings.addEventListener('click', () => vscode.postMessage({ command: 'openSettings' }));
    els.diagnostics.addEventListener('click', () => vscode.postMessage({ command: 'showDiagnostics' }));
    els.addToggle.addEventListener('click', () => {
      state.addOpen = !state.addOpen;
      render();
    });
    let searchTimer = 0;
    els.fundSearch.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        vscode.postMessage({ command: 'searchFund', keyword: els.fundSearch.value });
      }, 350);
    });
    els.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        state.activeTab = tab.dataset.tab;
        vscode.postMessage({ command: 'switchTab', tab: state.activeTab });
        render();
      });
    });

    window.addEventListener('message', event => {
      const message = event.data;
      if (!message || message.type !== 'state') {
        return;
      }
      Object.assign(state, message);
      render();
    });

    function render() {
      renderTabs();
      renderStatus();
      renderIndices();
      renderAccountTabs();
      renderSearchPanel();
      renderAccounts();
      renderSummary();
      els.refresh.classList.toggle('loading', state.loading);
    }

    function renderTabs() {
      els.tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === state.activeTab);
      });
    }

    function renderStatus() {
      els.status.classList.toggle('error', Boolean(state.error));
      if (state.error) {
        els.status.textContent = '刷新失败：' + state.error;
        return;
      }
      els.status.textContent = state.loading
        ? '正在刷新...'
        : state.updatedAt
          ? '更新于 ' + state.updatedAt
          : '';
    }

    function renderIndices() {
      const indices = state.data.indices || [];
      els.indices.innerHTML = indices.map(item => {
        const positive = Number(item.percent) > 0;
        return '<article class="index-card ' + (positive ? 'positive' : '') + '">' +
          '<div class="index-name">' + escapeHtml(item.name) + '</div>' +
          '<div class="index-values">' +
            '<span>' + signed(item.change) + '</span>' +
            '<span>' + signed(item.percent) + '%</span>' +
          '</div>' +
        '</article>';
      }).join('');
    }

    function renderAccountTabs() {
      const list = state.data.accountList || [];
      if (!list.length || state.activeTab === 'watchlist') {
        els.accountTabs.style.display = 'none';
        els.accountTabs.innerHTML = '';
        return;
      }

      const selectedId = state.data.selectedAccount && state.data.selectedAccount.id;
      els.accountTabs.style.display = 'flex';
      els.accountTabs.innerHTML = list.map(item =>
        '<button class="subtab ' + (item.id === selectedId ? 'active' : '') + '" type="button" data-account-id="' +
        escapeHtml(item.id) + '">' + escapeHtml(item.name) + '</button>'
      ).join('');
      els.accountTabs.querySelectorAll('[data-account-id]').forEach(button => {
        button.addEventListener('click', () => {
          vscode.postMessage({ command: 'switchAccount', accountId: button.dataset.accountId });
        });
      });
    }

    function renderAccounts() {
      if (state.activeTab === 'watchlist') {
        renderWatchlist();
        return;
      }

      if (state.activeTab === 'penetration') {
        renderPenetration();
        return;
      }

      const accounts = state.data.accounts || [];
      const funds = state.data.funds || [];
      if (!accounts.length) {
        els.accounts.innerHTML = '<div class="empty">暂无持仓数据</div>';
        return;
      }

      const selectedId = state.data.selectedAccount && state.data.selectedAccount.id;
      const visibleAccounts = selectedId && selectedId !== 'all'
        ? accounts.filter(item => item.id === selectedId || item.name === (state.data.selectedAccount && state.data.selectedAccount.name))
        : accounts;

      const accountHtml = visibleAccounts.map(item => {
        const holdPositive = Number(item.holdIncome) > 0;
        const dayPositive = Number(item.dayIncome) > 0;
        return '<article class="account-card">' +
          '<header class="account-head">' +
            '<div class="account-name"><span class="pay-icon">支</span><span>' + escapeHtml(item.name) + '</span></div>' +
            '<div class="trend"><span class="rise">↑ ' + integer(item.upCount) + '</span><span class="fall">↓ ' + integer(item.downCount) + '</span></div>' +
          '</header>' +
          '<div class="account-body">' +
            '<div class="metric full"><div class="label">账户资产</div><div class="value">' + money(item.asset) + '</div></div>' +
            '<div class="metric"><div class="label">持有收益</div><div class="value ' + (holdPositive ? 'positive-text' : 'negative-text') + '">' +
              signed(item.holdIncome) + '<span class="percent-pill ' + (holdPositive ? 'positive' : '') + '">' + signed(item.holdPercent) + '%</span>' +
            '</div></div>' +
            '<div class="metric"><div class="label">当日收益</div><div class="value ' + (dayPositive ? 'positive-text' : 'negative-text') + '">' +
              signed(item.dayIncome) + '<span class="percent-pill ' + (dayPositive ? 'positive' : '') + '">' + signed(item.dayPercent) + '%</span>' +
            '</div></div>' +
          '</div>' +
        '</article>';
      }).join('');

      const fundHtml = selectedId === 'all'
        ? ''
        : funds.length
        ? '<section class="fund-list">' + funds.map(renderFundRow).join('') + '</section>'
        : '<div class="empty">当前账户暂无基金明细</div>';

      els.accounts.innerHTML = accountHtml + fundHtml;
    }

    function renderWatchlist() {
      const watchlist = state.data.watchlist || [];
      if (!watchlist.length) {
        els.accounts.innerHTML = '<div class="empty">暂无自选基金，可以用上方搜索加入</div>';
        return;
      }

      els.accounts.innerHTML = '<section class="watch-list">' + watchlist.map(item => {
        const positive = Number(item.dayPercent) > 0;
        return '<article class="fund-row">' +
          '<div class="fund-main">' +
            '<div><div class="fund-name">' + escapeHtml(item.name) + '</div><div class="fund-code">' + escapeHtml(item.code) + '</div></div>' +
            '<div class="' + (positive ? 'positive-text' : 'negative-text') + '">' + signed(item.dayPercent) + '%</div>' +
          '</div>' +
          '<div class="fund-meta">最新净值 ' + money(item.latestNetValue) + ' ' + escapeHtml(item.netValueDate || '') + '</div>' +
          '<div class="row-actions">' +
            '<button class="ghost-button" type="button" data-remove-watch="' + escapeHtml(item.code) + '">移出自选</button>' +
            '<button class="primary-button" type="button" data-fill-fund="' + escapeHtml(item.code) + '">新增持有</button>' +
          '</div>' +
        '</article>';
      }).join('') + '</section>';
      bindDynamicButtons();
    }

    function renderFundRow(item) {
      const dayPositive = Number(item.dayIncome) > 0;
      const holdPositive = Number(item.holdIncome) > 0;
      return '<article class="fund-row">' +
        '<div class="fund-main">' +
          '<div><div class="fund-name">' + escapeHtml(item.name) + '</div><div class="fund-code">' + escapeHtml(item.code) + '</div></div>' +
          '<div class="' + (dayPositive ? 'positive-text' : 'negative-text') + '">' + signed(item.dayPercent) + '%</div>' +
        '</div>' +
        '<div class="fund-grid">' +
          '<span>当日收益<b class="' + (dayPositive ? 'positive-text' : 'negative-text') + '">' + signed(item.dayIncome) + '</b></span>' +
          '<span>持有收益<b class="' + (holdPositive ? 'positive-text' : 'negative-text') + '">' + signed(item.holdIncome) + '</b></span>' +
          '<span>最新净值<b>' + money(item.latestNetValue) + '</b></span>' +
          '<span>持有份额<b>' + money(item.holdShare) + '</b></span>' +
        '</div>' +
      '</article>';
    }

    function renderPenetration() {
      const funds = (state.data.funds || [])
        .map(item => {
          const asset = Number(item.currentValue || 0);
          const percent = Number(item.dayPercent || 0);
          const contribution = Number(item.dayIncome || 0) || asset * percent / 100;
          return { ...item, asset, percent, contribution };
        })
        .filter(item => item.asset || item.contribution || item.percent)
        .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

      if (!funds.length) {
        els.accounts.innerHTML = '<div class="empty">暂无可穿透的持仓数据</div>';
        return;
      }

      const totalAsset = funds.reduce((sum, item) => sum + item.asset, 0);
      const totalContribution = funds.reduce((sum, item) => sum + item.contribution, 0);
      const totalPercent = totalAsset ? totalContribution / totalAsset * 100 : 0;
      const maxContribution = Math.max(...funds.map(item => Math.abs(item.contribution)), 1);
      const positive = totalContribution > 0;

      els.accounts.innerHTML =
        '<section class="penetration-summary">' +
          '<div class="penetration-total">' +
            '<div><div class="label">今日穿透贡献</div><div class="value ' + (positive ? 'positive-text' : 'negative-text') + '">' + signed(totalContribution) + '</div></div>' +
            '<div><div class="label">估算涨跌</div><div class="value ' + (totalPercent > 0 ? 'positive-text' : 'negative-text') + '">' + signed(totalPercent) + '%</div></div>' +
          '</div>' +
          '<div class="penetration-note">当前为基金层估算：按持仓市值和基金当日涨跌计算贡献。股票级重仓穿透需要接入基金重仓股和股票实时行情后再细化。</div>' +
        '</section>' +
        '<section class="fund-list">' + funds.map(item => {
          const itemPositive = item.contribution > 0;
          const width = Math.max(4, Math.min(100, Math.abs(item.contribution) / maxContribution * 100));
          return '<article class="fund-row">' +
            '<div class="fund-main">' +
              '<div><div class="fund-name">' + escapeHtml(item.name) + '</div><div class="fund-code">' + escapeHtml(item.code) + '</div></div>' +
              '<div class="' + (itemPositive ? 'positive-text' : 'negative-text') + '">' + signed(item.contribution) + '</div>' +
            '</div>' +
            '<div class="bar"><div class="bar-fill ' + (itemPositive ? 'positive' : '') + '" style="width:' + width.toFixed(0) + '%"></div></div>' +
            '<div class="fund-grid">' +
              '<span>持仓市值<b>' + money(item.asset) + '</b></span>' +
              '<span>当日涨跌<b class="' + (item.percent > 0 ? 'positive-text' : 'negative-text') + '">' + signed(item.percent) + '%</b></span>' +
              '<span>贡献占比<b>' + (totalContribution ? signed(item.contribution / Math.abs(totalContribution) * 100) : '0.00') + '%</b></span>' +
              '<span>净值日期<b>' + escapeHtml(item.netValueDate || '-') + '</b></span>' +
            '</div>' +
          '</article>';
        }).join('') + '</section>';
    }

    function renderSearchPanel() {
      const show = state.addOpen || state.activeTab === 'watchlist';
      els.searchPanel.style.display = show ? 'grid' : 'none';
      els.actionMessage.classList.toggle('error', Boolean(state.actionError || state.searchError));
      els.actionMessage.textContent =
        state.actionError || state.searchError || state.actionMessage || (state.searching ? '搜索中...' : '');

      const results = state.searchResults || [];
      if (!results.length) {
        els.searchResults.innerHTML = els.fundSearch.value.trim() ? '<div class="empty">没有搜索结果</div>' : '';
        return;
      }

      els.searchResults.innerHTML = results.map(item => {
        const positive = Number(item.dayPercent) > 0;
        return '<article class="search-row">' +
          '<div class="search-main">' +
            '<div><div class="fund-name">' + escapeHtml(item.name) + '</div><div class="fund-code">' + escapeHtml(item.code) + '</div></div>' +
            '<div class="' + (positive ? 'positive-text' : 'negative-text') + '">' + signed(item.dayPercent) + '%</div>' +
          '</div>' +
          '<div class="row-actions">' +
            '<button class="ghost-button" type="button" data-watch-code="' + escapeHtml(item.code) + '">加入自选</button>' +
            '<button class="primary-button" type="button" data-add-code="' + escapeHtml(item.code) + '">新增持有</button>' +
          '</div>' +
        '</article>';
      }).join('');
      bindDynamicButtons();
    }

    function bindDynamicButtons() {
      document.querySelectorAll('[data-watch-code]').forEach(button => {
        button.addEventListener('click', () => {
          const fund = findFund(button.dataset.watchCode);
          vscode.postMessage({ command: 'addWatch', fund });
        });
      });
      document.querySelectorAll('[data-add-code]').forEach(button => {
        button.addEventListener('click', () => {
          const fund = findFund(button.dataset.addCode);
          vscode.postMessage({
            command: 'addHolding',
            payload: {
              fund,
              holdShare: els.holdShare.value,
              holdCost: els.holdCost.value,
              accountId: state.data.selectedAccount && state.data.selectedAccount.id
            }
          });
        });
      });
      document.querySelectorAll('[data-remove-watch]').forEach(button => {
        button.addEventListener('click', () => {
          vscode.postMessage({ command: 'removeWatch', code: button.dataset.removeWatch });
        });
      });
      document.querySelectorAll('[data-fill-fund]').forEach(button => {
        button.addEventListener('click', () => {
          const fund = (state.data.watchlist || []).find(item => item.code === button.dataset.fillFund);
          if (fund) {
            state.addOpen = true;
            els.fundSearch.value = fund.code;
            state.searchResults = [fund];
            render();
          }
        });
      });
    }

    function findFund(code) {
      return (state.searchResults || []).find(item => item.code === code) ||
        (state.data.watchlist || []).find(item => item.code === code) ||
        {};
    }

    function renderSummary() {
      const summary = state.data.summary || {};
      const dayPositive = Number(summary.dayIncome) > 0;
      els.summary.innerHTML =
        '<strong>￥ ' + money(summary.asset) + '</strong>' +
        '<span class="rise">↑ ' + integer(summary.upCount) + '</span>' +
        '<span class="fall">↓ ' + integer(summary.downCount) + '</span>';
      els.incomeBadge.classList.toggle('positive', dayPositive);
      els.incomeBadge.textContent = '当日收益: ' + signed(summary.dayIncome) + ' (' + signed(summary.dayPercent) + '%)';
    }

    function money(value) {
      const number = Number(value || 0);
      return number.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    function integer(value) {
      return String(Math.trunc(Number(value || 0)));
    }

    function signed(value) {
      const number = Number(value || 0);
      const formatted = number.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return number > 0 ? '+' + formatted : formatted;
    }

    function escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    render();
  </script>
</body>
</html>`;
}

function numberValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '').replace('%', '').trim();
    const number = Number(normalized);
    return Number.isFinite(number) ? number : 0;
  }

  return 0;
}

function stringValue(value) {
  return value === undefined || value === null ? '' : String(value);
}

function sum(items, key) {
  return items.reduce((total, item) => total + numberValue(item[key]), 0);
}

function percentByAsset(accounts) {
  const asset = sum(accounts, 'asset');
  if (!asset) {
    return 0;
  }
  return (sum(accounts, 'dayIncome') / asset) * 100;
}

function formatTime(date) {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function getNonce() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let value = '';
  for (let i = 0; i < 32; i += 1) {
    value += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return value;
}

function md5(value) {
  return crypto.createHash('md5').update(value).digest('hex');
}

module.exports = {
  activate,
  deactivate
};
