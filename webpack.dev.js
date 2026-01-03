const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { GenerateSW } = require('workbox-webpack-plugin'); // ✅ Tambahkan ini

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 9000,
    hot: false,
    liveReload: true,
    open: true,
  },
  plugins: [
    new GenerateSW({
      swDest: 'sw.bundle.js',  // hasil file SW
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
});
