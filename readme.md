## React学習

- 環境

```
Host: MacBook Pro
Docker: version 19.03.5
docker-compose: version 1.25.2
```

### WebpackによるReact開発

- ディレクトリの作成
```zsh:                                          
apple@appurunoMacBook-Pro project % cd app 
apple@appurunoMacBook-Pro app % mkdir -p src/js
```

- dockerコンテナ起動
```zsh:
apple@appurunoMacBook-Pro project % docker-compose up -d
apple@appurunoMacBook-Pro app % docker-compose exec app sh 
```

- プロジェクトの作成
```zsh:
/app # npm init

package name: (app) 
version: (1.0.0) 
description: y
entry point: (index.js) webpack.config.js
test command: 
git repository: y
keywords: 
author: dev
license: (ISC) 
About to write to /app/package.json:
```

- react,webpack,babelのインストール
```zsh:
/app # npm install --save-dev webpack webpack-cli webpack-dev-server
/app # npm install -g webpack webpack-cli
/app # npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-loader
/app # npm install --save-dev react react-dom
```

- webpack.config.jsファイルを作成し、バンドリングルールを記述
```javascript:app/webpack.config.js
var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path');

module.exports = {
  // ビルドの対象となるディレクトリ
  context: path.join(__dirname, "src"),
  // ビルドの起点となるファイル
  entry: "./js/client.js",
  // ビルドに必要なモジュール(loader)定義
  module: {
    rules: [{
      // ローダーの処理対象ファイル
      test: /\.jsx?$/,
      // ローダーの処理対象から外すディレクトリ
      exclude: /(node_modules|bower_components)/,
      use: [{
        // 利用するローダー
        loader: 'babel-loader',
        // ローダーのオプション
        options: {
          // @babel/preset-envは、出力したいECMAScriptのバージョンを指定するためのプリセット
          // @babel/preset-reactは、React用のBabelが変換処理を行うためのプリセット
          presets: ['@babel/preset-react', '@babel/preset-env']
        }
      }]
    }]
  },
  output: {
    // 出力ディレクトリ・ファイル名
    path: __dirname + "/src/",
    filename: "client.min.js"
  },
  plugins: debug ? [] : [
    // モジュールとチャンクのIDを使用(出現)頻度で割り当て
    // 合計ファイルサイズを縮小することができるようになるプラグイン
    new webpack.optimize.OccurrenceOrderPlugin(),
    // 不要なスペースやコメント、改行などを削除し、ファイルサイズを圧縮するためのプラグイン
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ]
};
```

- webpackで作成された`client.min.js`を読み込むよ`index.html`の作成
```html:app/src/index.html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>React Tutorials</title>
    <!-- change this up! http://www.bootstrapcdn.com/bootswatch/ -->
    <link href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.6/cosmo/bootstrap.min.css" type="text/css" rel="stylesheet"/>
  </head>

  <body>
    <div id="app"></div>
    <script src="client.min.js"></script>
  </body>
</html>
```

- `client.js`を作成する
```javascript:app/src/js/client.js
import React from "react";
import ReactDOM from "react-dom";

class Layout extends React.Component {
  render() {
    return (
      <h1>Welcome!</h1>
    );
  }
}

const app = document.getElementById('app');
ReactDOM.render(<Layout />, app);
```

- webpackを実行する
```zsh:
/app # webpack --mode development
```

- ホスト側からindex.htmlをブラウザで開いてみる
```zsh
apple@appurunoMacBook-Pro app % open -a '/Applications/Google Chrome.app' file:///Users/apple/dev/sample/project/app/src/index.html
```
