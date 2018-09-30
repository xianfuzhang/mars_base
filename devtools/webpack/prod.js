'use strict';
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MergeJsonWebpackPlugin = require('merge-jsons-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || 'localhost';
const host = 'http://' + hostname + ':' + port;
const assetHost = process.env.ASSET_HOST || host + '/';

module.exports = function (config) {
  return {
    mode: "production",
    entry: {
      app: path.resolve('src/main.js')
    },
    optimization: {
      minimizer: [
        new OptimizeCssAssetsPlugin({
          assetNameRegExp: /\.css\.*(?!.*map)/g,
          cssProcessor: require('cssnano'),
          cssProcessorOptions: { safe: true, discardComments: { removeAll: true } },
          canPrint: true
        })
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        favicon: "./favicon.ico",
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
      new webpack.HotModuleReplacementPlugin(),
      new CopyWebpackPlugin([{
        from: path.resolve('src/libs/jtopo/jtopo-0.4.8-min.js'),
        to: path.resolve('public/jtopo-0.4.8-min.js'),
        toType: 'file'
      }]),
      new UglifyJsPlugin()
    ],
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
        },
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['env']
            }
          }
        }
      ]
    }
  };
}