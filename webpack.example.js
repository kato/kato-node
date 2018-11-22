const merge = require('webpack-merge');
const base = require('./webpack.base');
const NodemonPlugin = require('nodemon-webpack-plugin');

module.exports = merge(base, {
  mode: 'development',
  entry: {
    example: [
      'source-map-support/register',
      './example/index.js'
    ],
  },
  plugins: [
    new NodemonPlugin({
      nodeArgs: ['--inspect']
    })
  ]
});
