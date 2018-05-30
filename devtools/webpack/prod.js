'use strict';

module.exports = function (config) {
  return {
    optimization: {
      minimize: true
    },
    module: {
      rules: [
        {
          test: /\.(scss|css)$/,
          use: ["style-loader", "css-loader", "sass-loader"]
        }
      ]
    }
  };
}