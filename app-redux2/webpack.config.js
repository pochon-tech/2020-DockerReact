var debug   = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path    = require('path'); // output.pathに絶対パスを指定する必要があるため、pathモジュールを読み込んでおく

module.exports = {
  context: path.join(__dirname, "src"), // ビルドの対象となるディレクトリを定義
  entry: "./js/client.js", // webpackがビルドを始める際の開始点となるjsファイル
  // ビルドのメインとなる部分 , ビルドに必要なモジュール（loader）を指定
  module: {
    rules: [{
      test: /\.jsx?$/, // ビルドの対象ファイルを記述, 正規表現を使い全ての.jsまたは.jsxファイル拡張子を対象
      exclude: /(node_modules|bower_components)/, // ビルドから除外するディレクトリを指定, /node_modules/を除外しないと処理が重くなる
      use: [{
        loader: 'babel-loader',  // ビルドで使用するloaderを指定
        options: {
          plugins: [
            /** JSX内でもHTML属性のclassキーワードを使えるようにする */
            'react-html-attrs',
            /** @babel/plugin-proposal-decoratorsでlegacyフラグを付けた場合、引数にクラスとプロパティ名そしてプロパティディスクリプタを受け取り、そのプロパティディスクリプタを加工して返すようになる */
            [require('@babel/plugin-proposal-decorators'), {legacy: true}]
          ],
          /** Reactトランスパイルに使用 */
          presets: ['@babel/preset-react', '@babel/preset-env']
        }
      }]
    }]
  },
  /** 出力先、出力ファイル名 */
  output: {
    path: __dirname + "/src/",
    filename: "client.min.js",
    publicPath: '/'
  },
  /** 開発サーバ設定 */
  devServer: {
    port: 8001, // 8001番ポートを使用
    host: '0.0.0.0', // 外部からのアクセスを許容
    watchOptions: {
      aggregateTimeout: 500,
      poll: 1000
    },
    historyApiFallback: true
  },
  plugins: debug ? [] : [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};