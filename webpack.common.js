const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, './src/index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    clean: true,
  },
  module: {
    rules: [
      /* style dan css loader */
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
      },

      // loader untuk map
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    /* HTML webpack plugins */
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      excludeChunks: ['sw'],
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, './src/public'),
          to: path.join(__dirname, 'dist'),
        },
      ],
    }),
  ],
};
