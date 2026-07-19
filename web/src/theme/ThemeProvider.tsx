import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ConfigProvider, theme as antTheme, App as AntApp } from 'antd';
import lightTokens from './tokens';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  toggle: () => {},
});

/** 读取 localStorage 或系统偏好 */
function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem('theme') as ThemeMode | null;
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  // 同步到 <html data-theme> 和 localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
  }, [mode]);

  // 监听系统主题变化
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setMode(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggle = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const themeConfig = useMemo<ThemeConfigWithMode>(
    () => ({
      ...lightTokens,
      algorithm:
        mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={{ mode, toggle }}>
      <ConfigProvider theme={themeConfig}>
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

// Workaround: AntD ConfigProvider theme prop accepts algorithm directly
type ThemeConfigWithMode = typeof lightTokens & {
  algorithm: typeof antTheme.darkAlgorithm | typeof antTheme.defaultAlgorithm;
};

export default ThemeProvider;
