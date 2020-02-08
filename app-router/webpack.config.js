var debug   = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path    = require('path');

// npm install -g webpack webpack-cli
// webpack --mode development
// client.min.jsが作成される
module.exports = {
  /** dev-serverの環境設定 */
  devServer: {
    port: 8001, // use any port suitable for your configuration
    host: '0.0.0.0', // to accept connections from outside container
    watchOptions: {
        aggregateTimeout: 500, // delay before reloading
        poll: 1000 // enable polling since fsevents are not supported in docker
    },
    /** 
     * react-router のルーティング設定だけでは、静的リソースの存在しないページを直接 URL で指定してアクセスすると 404 Error になる
     * webpack-dev-server であるならば historyApiFallback: true を設定することで、404 Error を回避できる
     * webpack-dev-serverで動作するためにはoutput.pubicPathの設定が必須
     *  */
    historyApiFallback: true
  },
  /** 以下はoutput.pubicPath以外はapp-basicと同様 */
  context: path.join(__dirname, "src"),
  entry: "./js/client.js",
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      use: [{
        loader: 'babel-loader',
        options: {
          plugins: ['react-html-attrs'],
          presets: ['@babel/preset-react', '@babel/preset-env']
        }
      }]
    }]
  },
  output: {
    path: __dirname + "/src/",
    filename: "client.min.js",
    publicPath: '/'
  },
  plugins: debug ? [] : [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};