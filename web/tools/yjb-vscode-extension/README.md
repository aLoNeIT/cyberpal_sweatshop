# 养基宝 VS Code 扩展

这是一个 VS Code 侧边栏扩展雏形，用于展示基金持仓、市场指数、收益汇总，并支持手动刷新。

## 本地运行

1. 用 VS Code 打开 `tools/yjb-vscode-extension` 目录。
2. 按 `F5` 启动 Extension Development Host。
3. 在新窗口左侧活动栏打开“养基宝”。

## 配置真实接口

在 VS Code 设置中搜索“养基宝”，配置：

- `yjb.useYangjibaoApi`: 启用养基宝浏览器插件同款接口。
- `yjb.yangjibaoBaseUrl`: 默认 `http://browser-plug-api.yangjibao.com`。
- `yjb.apiUrl`: 你的基金数据接口地址。
- `yjb.authToken`: 如果接口需要 Bearer Token，可配置该值。
- `yjb.autoRefreshSeconds`: 自动刷新间隔，单位秒。

如果启用 `yjb.useYangjibaoApi`，扩展会请求：

- `/index_data`
- `/account_collect`

并按照浏览器插件里的规则加上 `Request-Time`、`Request-Sign`、`Authorization` 请求头。VS Code 扩展不能直接读取 Edge 扩展的 `chrome.storage.local`，所以需要把登录 token 填到 `yjb.authToken`。

接口返回可以直接使用下面结构，扩展也兼容部分常见字段名：

```json
{
  "indices": [
    { "name": "上证指数", "change": -12.41, "percent": -0.3 }
  ],
  "accounts": [
    {
      "id": "alipay",
      "name": "支付宝",
      "asset": 10179.38,
      "holdIncome": 789.61,
      "holdPercent": 8.47,
      "dayIncome": -72.71,
      "dayPercent": -0.71,
      "upCount": 4,
      "downCount": 11
    }
  ],
  "summary": {
    "asset": 10179.38,
    "dayIncome": -72.71,
    "dayPercent": -0.71,
    "upCount": 4,
    "downCount": 11
  }
}
```

## 打包

```bash
npm install
npx vsce package
```
