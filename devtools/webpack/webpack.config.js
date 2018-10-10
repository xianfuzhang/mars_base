'use strict';
const path = require('path');
const AliasProvider = require('./alias');

const fs = require('fs');
const glob = require('glob');

module.exports = function (config) {
  let _CONFIG_ = { // default config if nothing is passed from CLI
    environment: (config && config.environment) ? config.environment : 'dev',
    theme: (config && config.theme) ? config.theme : 'default'
  };

  let output_en = {};
  let output_cn = {};

  glob('src/**/**/**/en.json', (error, files) => {
    files.forEach((filename) => {
      const contents = JSON.parse(fs.readFileSync(filename, 'utf8'));
      Object.assign(output_en, contents);
    });

    fs.writeFileSync('public/en.json', JSON.stringify(output_en));
  });

  glob('src/**/**/**/cn.json', (error, files) => {
    files.forEach((filename) => {
      const contents = JSON.parse(fs.readFileSync(filename, 'utf8'));
      Object.assign(output_cn, contents);
    });

    fs.writeFileSync('public/cn.json', JSON.stringify(output_cn));
  });


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
        AliasProvider.getServices(),
        AliasProvider.getTest()
      )
    },
    resolveLoader: {
      modules: ['node_modules']
    }
  }, require('./' + _CONFIG_.environment)(_CONFIG_));
}