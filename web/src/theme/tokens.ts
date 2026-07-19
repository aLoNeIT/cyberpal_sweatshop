import type { ThemeConfig } from 'antd';

/**
 * Ant Design v5 主题 Token 映射
 *
 * 严格对齐 ui-style-guide §1 Design Tokens（浅色默认值）。
 * 7 个主色变量 + 语义色 + 中性灰阶 + 圆角 + 字体。
 */
const lightTokens: ThemeConfig = {
  token: {
    // ── 主色（indigo/violet，延续品牌感） ──
    colorPrimary: '#6366F1',
    colorPrimaryBg: '#EEF2FF',
    colorPrimaryBgHover: '#C7D2FE',
    colorPrimaryBorder: '#C7D2FE',
    colorPrimaryBorderHover: '#4F46E5',
    colorPrimaryHover: '#4F46E5',
    colorPrimaryActive: '#4338CA',
    colorPrimaryTextHover: '#4F46E5',
    colorPrimaryText: '#6366F1',
    colorPrimaryTextActive: '#4338CA',

    // ── 语义色 ──
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorInfo: '#3B82F6',

    // ── 文本 ──
    colorTextBase: '#0F172A',
    colorText: '#0F172A',
    colorTextSecondary: '#64748B',
    colorTextTertiary: '#94A3B8',
    colorTextQuaternary: '#C0C8D4',

    // ── 背景 / 表面 ──
    colorBgBase: '#FFFFFF',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#F8FAFC',
    colorBgSpotlight: 'rgba(15, 23, 42, 0.85)',
    colorBgMask: 'rgba(15, 23, 42, 0.45)',

    // ── 边框 ──
    colorBorder: '#E2E8F0',
    colorBorderSecondary: '#F1F5F9',

    // ── 圆角 ──
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 4,
    borderRadiusXS: 4,

    // ── 字体 ──
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif",
    fontSize: 14,
    fontSizeHeading1: 30,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 18,
    fontSizeHeading5: 16,

    // ── 控件 ──
    controlHeight: 36,
    controlHeightSM: 28,
    controlHeightLG: 40,
    lineHeight: 1.5,
    lineWidth: 1,

    // ── 阴影 ──
    boxShadow:
      '0 1px 2px rgba(15,23,42,0.06)',
    boxShadowSecondary:
      '0 4px 12px rgba(15,23,42,0.08)',
  },
  components: {
    Layout: {
      siderBg: '#FFFFFF',
      triggerBg: '#F1F5F9',
      triggerColor: '#64748B',
    },
    Menu: {
      itemBg: 'transparent',
      subMenuItemBg: 'transparent',
    },
  },
};

export default lightTokens;
