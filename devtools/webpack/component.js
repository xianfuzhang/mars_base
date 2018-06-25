/**
 * Created by wls on 2018/6/7.
 */
'use strict';
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MergeJsonWebpackPlugin = require('merge-jsons-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');


const port = process.env.PORT || 4000;
const hostname = process.env.HOSTNAME || 'localhost';
const host = 'http://' + hostname + ':' + port;
const assetHost = process.env.ASSET_HOST || host + '/';

module.exports = function (config) {
  return {
    mode: "none",
    entry: {
      app: [path.resolve('src/component_dev.js')],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "./index.html",
        inject: 'head'
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css"
      }),
      new MergeJsonWebpackPlugin({
        'output': {
          'groupBy': [
            {
              'pattern': 'src/**/**/**/en.json',
              'fileName': './en.json'
            },
            {
              'pattern': 'src/**/**/**/cn.json',
              'fileName': './cn.json'
            }
          ]
        }
      }),
      new webpack.HotModuleReplacementPlugin()
    ],
    devtool: 'inline-source-map',
    devServer: {
      contentBase: "./public",
      publicPath: assetHost,
      inline: true,
      port: port,
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "html-loader",
            }
          ]
        },
        {
          test: /\.(scss|css)$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            {
              loader: "css-loader"
            },
            {
              loader: "sass-loader",
              options: {
                includePaths: [
                  "node_modules",
                  path.resolve('src/themes/shared'),
                  path.resolve('src/themes/' + config.theme)
                ]
              }
            }
          ]
        },
        {
          test: /\.(jpg|svg|png)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'file-loader'
            }
          ]
        },
      ]
    }
  };
}