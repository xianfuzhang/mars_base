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


const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || 'localhost';
const host = 'http://' + hostname + ':' + port;
const assetHost = process.env.ASSET_HOST || host + '/';

module.exports = function (config) {
  return {
    mode: "development",
    entry: {
      app: [path.resolve('src/test/component_dev.js')],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/test/index.html",
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
      proxy: {
        '/mars': 'http://localhost:4001'
      }
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
                  path.resolve('node_modules/xbem/src'),
                  "node_modules",
                  path.resolve('src/themes/shared'),
                  path.resolve('src/themes/' + config.theme)
                ]
              }
            }
          ]
        },
        {
          test: /\.(jpg|svg|png|woff|woff2|eot|ttf)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'file-loader'
            }
          ]
        }
      ]
    }
  };
}