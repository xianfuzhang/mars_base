'use strict';
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MergeJsonWebpackPlugin = require('merge-jsons-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
//const ngAnnotateWebpackPlugin =  require('ng-annotate-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || 'localhost';
const host = 'http://' + hostname + ':' + port;
const assetHost = process.env.ASSET_HOST || host + '/';

module.exports = function (config) {
  return {
    mode: "development",
    entry: {
      // app: [path.resolve('src/main.js'), path.resolve('src/libs/jtopo/jtopo-0.4.8-min.js')],
      app: path.resolve('src/main.js')
    },
    plugins: [
      //new ngAnnotateWebpackPlugin(),
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
      // new OptimizeCssAssetsPlugin({
      //   assetNameRegExp: /\.css\.*(?!.*map)/g,
      //   cssProcessor: require('cssnano'),
      //   cssProcessorOptions: { safe: true, discardComments: { removeAll: true } },
      //   canPrint: true
      // }),
      // new MergeJsonWebpackPlugin({
      //   'output': {
      //     'groupBy': [
      //       {
      //         'pattern': 'src/**/**/**/en.json',
      //         'fileName': './en.json'
      //       },
      //       {
      //         'pattern': 'src/**/**/**/cn.json',
      //         'fileName': './cn.json'
      //       }
      //     ]
      //   }
      // }),
      //new webpack.HotModuleReplacementPlugin(),
      new CopyWebpackPlugin([{
        from: path.resolve('src/libs/jtopo/jtopo-0.4.8-min.js'),
        to: path.resolve('public/jtopo-0.4.8-min.js'),
        toType: 'file'
      }])
    ],
    devtool: 'inline-source-map',
    devServer: {
      contentBase: "./public",
      host:'0.0.0.0',
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