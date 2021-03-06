const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const webpack = require('webpack');
const HtmlCriticalPlugin = require("html-critical-webpack-plugin");
const BrotliPlugin = require('brotli-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require("compression-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = (env,argv) => merge(common(env,argv), {
    plugins: [
        new UglifyJsPlugin({sourceMap:true}),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new HtmlCriticalPlugin({
            base: path.resolve(__dirname, 'dist/'),
            src: 'index.html',
            dest: 'index.html',
            inline: true,
            minify: true,
            extract: false,
            width: 1400,
            height: 1200,
            inlineImages: true,
            assetPaths: ['dist/static'],
            penthouse: {
                renderWaitTime: 3000,
                blockJSRequests: false,
            }
        }),
        new CompressionPlugin({
            minRatio:0.85, cache:true,
            test:[/\.css/,/\.ttf/,/\.eot/,/\.js/],
            exclude:[/\.png/,/\.ico/,/\.html/]
        }),
        new BrotliPlugin({
            asset: '[path].br[query]',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8
        }),
        // new BundleAnalyzerPlugin()
    ],
    devtool: 'source-map'
});
