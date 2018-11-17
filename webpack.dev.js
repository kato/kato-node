const merge = require('webpack-merge');
const base = require('./webpack.base');

module.exports = merge(base, {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    index: './index.ts',
  },
});
