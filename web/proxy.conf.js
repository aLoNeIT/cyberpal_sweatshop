/**
 * For more configuration, please refer to https://angular.io/guide/build#proxying-to-a-backend-server
 *
 * 更多配置描述请参考 https://angular.cn/guide/build#proxying-to-a-backend-server
 *
 * Note: The proxy is only valid for real requests, Mock does not actually generate requests, so the priority of Mock will be higher than the proxy
 */
module.exports = {
  '/api': {
    target: 'http://localhost:9502/',
    secure: false,
    logLevel: 'info',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api'
    }
  },
  '/chat': {
    target: 'http://localhost:9502/',
    secure: false,
    logLevel: 'info',
    changeOrigin: true
  },
  '/admin': {
    target: 'http://localhost:9502/',
    secure: false,
    logLevel: 'info',
    changeOrigin: true
  },
  '/home': {
    target: 'http://localhost:9502/',
    secure: false,
    logLevel: 'info',
    changeOrigin: true
  }
};
