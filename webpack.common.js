var path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

var BUILD_DIR = path.resolve(__dirname, 'src/static/scripts/js');
var APP_DIR = path.resolve(__dirname, 'src/static/scripts/jsx');
var GPX_DIR = path.resolve(__dirname, 'node_modules/gpx-parse/dist');

module.exports = {
    entry: [
        APP_DIR + '/main.js'
    ],
    module: {
        rules: [
            {test: /\.jsx?$/,
                include: APP_DIR,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    cacheDirectory:true
                }
            },
            {test: /\.js$/,
                use: [{loader:"source-map-loader",options:{enforce: "pre"}}],
            },
            { test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: 'ts-loader' },
            { test: /\.css$/, use:
                ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [{loader:"css-loader", options: {modules:false, sourceMap:true, minimize:true}}]
                })
            },
            { test: /\.(png|woff2?)$/, loader: "url-loader?limit=100000" },
            { test: /\.jpg$/, loader: "file-loader" },
            { test: /\.(ttf|eot|svg)$/, loader: "file-loader" }
        ]
    },
    plugins: [
        new ExtractTextPlugin("styles.css"),
    ],
    output: {
        path: BUILD_DIR,
        filename: "bundle.js",
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
        modules: ["node_modules", GPX_DIR]
    },
    externals: {
        jquery: 'jQuery'
    },
    node: {
        fs: 'empty'
    }
}