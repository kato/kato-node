let merge = require('webpack-merge');
let base = require('./webpack.base');

module.exports = merge(base, {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    example: './example/index.js',
  },
});
