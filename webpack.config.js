/*
    ./webpack.config.js
*/
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfigIndex = new HtmlWebpackPlugin({
  template: './client/index.html',
  filename: 'index.html',
  inject: 'body'
})

const HtmlWebpackPluginConfigOption = new HtmlWebpackPlugin({
  template: './client/settings.html',
  filename: 'settings.html',
  inject: 'body'
})

const loaders =   [
  { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
  { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },
  { test: /\.css$/, loader: 'style-loader' },
  { test: /\.css$/, loader: 'css-loader' },
  { test: /\.(gif|svg|jpg|png)$/, loader: "file-loader"}
]

module.exports = [{
    entry: './client/index.js',
    output: {
      path: path.resolve('dist'),
      filename: 'index_bundle.js'
    },
    module:{
      loaders:loaders
    },
    plugins: [HtmlWebpackPluginConfigIndex]
  },
  {
    entry: './client/settings.js',
    output: {
      path: path.resolve('dist'),
      filename: 'settings_bundle.js'
    },
    module: {
      loaders: loaders
    },
    plugins: [HtmlWebpackPluginConfigOption]
  }
]