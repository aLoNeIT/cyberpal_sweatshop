import { Environment } from '@delon/theme';

export const environment = {
  production: true,
  useHash: true,
  api: {
    baseUrl: './',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  img: {
    favicon: 'favicon.ico',
    logo: '/assets/logo.png'
  }
} as Environment;
