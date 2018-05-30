'use strict';
const path = require('path');
const AliasProvider = require('./alias');

module.exports = function (config) {
  let _CONFIG_ = { // default config if nothing is passed from CLI
    environment: (config && config.environment) ? config.environment : 'dev',
    theme: (config && config.theme) ? config.theme : 'default'
  };

  return Object.assign({
    output: {
      path: path.resolve('public'),
      filename: '[name].js',
      chunkFilename: '[chunkhash].[name].js'
    },
    resolve: {
      modules: ['src', 'node_modules'],
      extensions: ['.js', '.json', '.scss', '.css', '.html', '.jpg', '.png', '.svg'],
      alias: Object.assign({},
        AliasProvider.getComponents(),
        AliasProvider.getModules(),
        AliasProvider.getServices()
      )
    },
    resolveLoader: {
      modules: ['node_modules']
    }
  }, require('./' + _CONFIG_.environment)(_CONFIG_));
}