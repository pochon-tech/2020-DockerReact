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

## webpack-dev-serverで開発用webサーバを起動する

- コンテナの中に入って開発用Webサーバを起動する
```zsh
apple@appurunoMacBook-Pro 2020-02-DockerReact % docker-compose up -d
Creating network "2020-02-dockerreact_default" with the default driver
Creating 2020-02-dockerreact_app_1 ... done
apple@appurunoMacBook-Pro 2020-02-DockerReact % docker-compose exec app sh
/app # ./node_modules/webpack-dev-server/bin/webpack-dev-server.js --hot --inline --watch-content-base --content-base src --host 0.0.0.0 --port 8001
```
- localhost:8001を開くとHTMLが確認できる
- webpack-dev-serverのサーバーとポートを変更して起動する
  - --hot: HMR(Hot Module Replacement)を有効
  - --inline: jsコードが変更されたら（コンパイルして）自動的にブラウザをリロード
  - --content-base src: htmlやcssなどを置いておくコンテンツベースとなるディレクトリを`作業ディレクトリ/src/`に指定
  - --watch-content-base: サーバー起動後、自動的に（デフォルトの）ブラウザを開く
  - ※ Dockerとの兼ね合いのせいかHMRが起動しない 

- コマンドが長いのでpackage.jsonにnpmスクリプトを記述
```json:app/package.json
  "scripts": {
    "start": "webpack-dev-server --hot --inline --watch-content-base --content-base src",
  },
```
- `npm start`でwebpack-dev-serverを起動
```zsh
/app # npm start
```

- ※ Docker対応：`webpack.config.js`にポーリング設定を追記することでHMRの起動
```javascript:webpack.config.js
module.exports = {
  devServer: {
    port: 8001, // use any port suitable for your configuration
    host: '0.0.0.0', // to accept connections from outside container
    watchOptions: {
        aggregateTimeout: 500, // delay before reloading
        poll: 1000 // enable polling since fsevents are not supported in docker
    }
  },
```

## JSX基本

- JSX内で匿名関数の定義を行い呼び出したり、コンストラクタで初期化されたメンバ変数を参照などの例
```javascript:app/src/js/client.js
class Layout extends React.Component {
  constructor() {
    super();
    this.title = 'Sample App'
  }
  render() {
    return (
      <div>
        <h1>{this.title}</h1>
        <h2>It's: {((num) => { return num + 1 })(3)}</h2>
      </div>
    );
  }
}
```

## Component化

- 幾つかのファイルに分けていき再利用性を高める
```zsh
apple@appurunoMacBook-Pro 2020-02-DockerReact % cd app
apple@appurunoMacBook-Pro app % mkdir -p ./src/js/components
apple@appurunoMacBook-Pro app % touch src/js/components/Layout.js
```

- export構文を用いて外部からアクセスできるLayout.jsを作成
- client.jsに作成したLayout.jsを取り込むことでJSXのLayoutタグが今までどおりclient.jsでも利用できる
- あわせてHeader、Footerコンポーネントを作成し、Layout.jsで取り込み利用してみる
- HeaderもしくはFooterで別のコンポーネントを取り込みたい場合は、別のコンポーネントを格納するためのディレクトリを作成するのが一般的
  - 今回の例だとHeader.jsで取り込むTitleコンポーネントを格納するHeaderディレクトリを作成している
```javascript:app/src/js/components/Layout.js
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

// client.jsで使用する全体的なLayoutなコンポーネント
export default class Layout extends React.Component {
    constructor() {
        super();
        this.title = 'Sample Layout'
    }
    render() {
        return (
            <div>
                <Header />
                <h1>{this.title}</h1>
                <h2>It's: {((num) => { return num + 1 })(3)}</h2>
                <Footer />
            </div>
        );
    }
}
```
```javascript:app/src/js/client.js
import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/Layout";
// index.htmlのDOMに組み込むエントリーポイント
const app = document.getElementById('app');
ReactDOM.render(<Layout />, app);
```
```javascript:app/src/js/components/Header.js
import React from "react";
import Title from "./Header/Title";
// Layout.jsで使用するコンポーネント
export default class Header extends React.Component {
  render() {
    return (
      <div>Header</div>
    );
  }
}
```
```javascript:app/src/js/components/Header/Title.js
import React from "react";
// Header.jsで使用するコンポーネント
export default class Title extends React.Component {
  render() {
    return (
      <h1>HeaderTitle!!</h1>
    );
  }
}
```
```javascript:app/src/js/components/Footer.js
import React from "react";
// Layout.jsで使用するコンポーネント
export default class Footer extends React.Component {
  render() {
    return (
      <footer>Footer</footer>
    );
  }
}
```

## stateの基本

- Reactはstateというアプリケーションの状態を持つ == コンポーネントをどのようにレンダリングするかといった情報を格納する場所
- stateは`setState`を通じて変更される -> stateの変更をトリガーに再レンダリングの命令がキューイングされ自動的にコンポーネントの(再)レンダリングがされる
- stateはReactコンポーネント内にある -> `React.Component`クラスを親に持つクラスから`this.state`でアクセスできる
- `this.state`のデータは`setState`を通して値が設定されたり変更されると、自動的に更新差分を検知し、renderメソッド内のJSXによって必要なところだけdomが再レンダリングされる
- 画面描画後、１秒後に名前が出力されるサンプルを以下のように実装する
```javascript:app/src/js/components/Layout.js
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default class Layout extends React.Component {
    constructor() {
        super();
        this.title = 'Sample Layout'
        this.state = { name: '' }
    }
    render() {
        setTimeout(
            () => { this.setState({ name: 'Jack' }) }, 1000
        )
        return (
            <div>
                <Header />
                <h1>{this.title}</h1>
                <h2>Hello {this.state.name}</h2>
                <Footer />
            </div>
        );
    }
}
```

## Propsの基本

- 各コンポーネントに対してパラメータを渡して使うことができ、そうすることでコンポーネント毎に個別の値の引数を渡すことができる
- Layout=>Header=>Titleに値を渡す実装を行う
```javascript:app/src/js/components/Layout.js
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default class Layout extends React.Component {
  render() {
    const title = 'Header Title'
    return (
      <div>
        <Header title={title} />
        <Footer />
      </div>
    );
  }
}
```
```javascript:app/src/js/components/Header.js
import React from "react";
import Title from "./Header/Title";

export default class Header extends React.Component {
  render() {
    console.log(this.props)
    return (
      <Title title={this.props.title} />
    );
  }
}
```
```javascript:app/src/js/components/Header/Title.js
import React from "react";

export default class Title extends React.Component {
  render() {
    return (
      <h1>{this.props.title}</h1>
    );
  }
}
```

## Eventの基本

- input要素を追加してユーザがフォームに入力したデータによって、リアルタイムにイベントを発生させる
```javascript:app/src/js/components/Layout.js
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default class Layout extends React.Component {
  constructor() {
    super();
    this.state = { title: "Welcome" };
  }
  changeTitle(title) {
    this.setState({ title })
  }
  render() {
    return (
      <div>
        <Header changeTitle={this.changeTitle.bind(this)} title={this.state.title} />
        <Footer />
      </div>
    );
  }
}
```
```javascript:app/src/js/components/Header.js
import React from "react";
import Title from "./Header/Title";

export default class Header extends React.Component {
  handleChange(e) {
    const title = e.target.value
    this.props.changeTitle(title)
  }
  render() {
    console.log(this.props)
    return (
      <div>
        <Title title={this.props.title} />
        <input value={this.props.title} onChange={this.handleChange.bind(this)} />
      </div>
    );
  }
}
```
```javascript:app/src/js/components/Header/Title.js
import React from "react";

export default class Title extends React.Component {
  render() {
    return (
      <h1>{this.props.title}</h1>
    );
  }
}
```
- `Layout`でtitleをstateで管理する
- `Layout`にstateの値を変更する`changeTitle`メソッドを定義する
  - `this.setState({ title })`はES6の書き方であり`this.setState({ title: title })`と同じ意味
- `Layout`から`Header`に`title`の値と`changeTitle`メソッドを渡す
  - 渡す理由は、`Header`で`Layout`の`changeTitle`メソッドを呼び出して、`Layout`で管理されているtitleを変更するため
  - `Layout`では状態の管理のみを行い、input要素によるイベント操作は`Header`の責務にしている
  - `<Header changeTitle={this.changeTitle.bind(this)} ...>`というようにbind(this)メソッドを呼び出して渡して理由は、確実に`Layout`インスタンスのsetState関数を呼び出すため
  - bind関数の引数のthis(Layout インスタンス)に対して紐付けをしてあげることで、この関数が`Header`コンポーネント内、またはその他のあらゆる場所で呼ばれたとしても`Layout`インスタンスの`changeTitle`メソッドが呼ばれるようになる
- `Header`から`Title`にpropsで渡ってきた`title`を渡す
- `Header`では、input要素のイベントをハンドリングする`handleChange`メソッドを定義する
  - `handleChange`メソッドでは、input要素のOnChangeイベントから入力値を取り出し、`Layout`インスタンスの`changeTitle`メソッドを呼び出してstateの値を変更している
- `Title`はpropsで渡ってきたtitleを単純に表示しているだけ

**public class fields syntax によるbind の記載の省略**

- public class fields syntax を使用することでbind の記載を省略できる
- `@babel/plugin-proposal-class-propertie`というプラグインをインストールする必要がある
- インストール後は、`.babelrc`もしくはw`ebpack.config.js`に指定する
```zsh
/app # npm install --save-dev @babel/plugin-proposal-class-properties
```
```.babelrc
# .babelrcを新規に作成する場合
{
  "plugins": [
    ["@babel/plugin-proposal-class-properties", { "loose": true }]
  ]
}
```
```javascript:webpack.config.js
  /* webpackで指定する場合 */
  use: [{
    loader: 'babel-loader',
    options: {
    presets: ['@babel/preset-react', '@babel/preset-env'],
    plugins: [
      ['@babel/plugin-proposal-class-properties', { 'loose': true }]
    ]
  }
```
- bindを省略する場合は下記のように宣言を変更する
```javascript:
  ...
  changeTitle = (title) => {    /* <- 関数の宣言をこのように変える */
    this.setState({title});
  }
  render() {
    return (
      <div>
        <Header changeTitle={this.changeTitle} title={this.state.title} />    /* <- bind の記載が省略できる */
        <Footer />
      </div>
    );
  }
```