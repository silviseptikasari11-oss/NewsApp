const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { InjectManifest } = require('workbox-webpack-plugin');
const path = require('path');

module.exports = merge(common, {
  mode: 'production',
  module: {
    rules: [
      /* babel loader */
      {
        test: /\.js$/,
        exclude: '/node_modules/',
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new InjectManifest({
      swSrc: path.resolve(__dirname, './src/scripts/sw.js'),
      swDest: 'sw.bundle.js',
    }),
  ],
});
