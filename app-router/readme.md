### ReactRouterによるReact開発


- dockerコンテナ起動
```zsh:
apple@appurunoMacBook-Pro project % docker-compose up -d
```

- プロジェクトの作成
```zsh:                                          
apple@appurunoMacBook-Pro project % cd app-router
apple@appurunoMacBook-Pro app-router % npm init -y
apple@appurunoMacBook-Pro app-router % npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-loader \
        webpack webpack-cli webpack-dev-server \
        react react-dom \
        react-router react-router-dom
```

- package.jsonのscriptsにstartコマンドでwebpack-dev-serverが起動するように設定
```json:app-router/package.json
  "scripts": {
    "start": "webpack-dev-server --content-base src --mode development --inline",
```

- webpack.config.jsの設定を行う

```javascript:app-router/webpack.config.js
var debug   = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path    = require('path');

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
     */
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
```

- ページのメインを作成する
```javascript:app-router/src/js/pages/Layout.js
import React from "react";

export default class Layout extends React.Component {
  render() {
    return (
      <h1>Sample</h1>
    );
  }
}
```

- 静的HTMLを作成する
```html:app-router/src/index.html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="">
  <meta name="author" content="">
  <title>React</title>
  <!-- Bootstrap Core CSS -->
  <link href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.6/cerulean/bootstrap.min.css" rel="stylesheet">

  <!-- Custom Fonts -->
  <!-- <link href="font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css"> -->
  <link href="http://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,700,300italic,400italic,700italic" rel="stylesheet" type="text/css">
</head>

<body>

  <!-- Navigation -->
  <nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
    <div class="container">
      <!-- Brand and toggle get grouped for better mobile display -->
      <div class="navbar-header">
        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
      </div>
      <!-- Collect the nav links, forms, and other content for toggling -->
      <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <ul class="nav navbar-nav">
          <li>
            <a href="#">Featured</a>
          </li>
          <li>
            <a href="#">Archives</a>
          </li>
          <li>
            <a href="#">Settings</a>
          </li>
        </ul>
      </div>
      <!-- /.navbar-collapse -->
    </div>
  </nav>
  <!-- Page Content -->
  <div class="container" style="margin-top: 60px;">
    <div class="row">
      <div class="col-lg-12">
        <div id="app"></div>
      </div>
    </div>
    <!-- Call to Action Well -->
    <div class="row">
      <div class="col-lg-12">
        <div class="well text-center">
          Ad spot goes here
        </div>
      </div>
      <!-- /.col-lg-12 -->
    </div>
    <!-- /.row -->
    <!-- Content Row -->
    <div class="row">
      <div class="col-md-4">
        <h2>Heading 1</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe rem nisi accusamus error velit animi non ipsa placeat. Recusandae, suscipit, soluta quibusdam accusamus a veniam quaerat eveniet eligendi dolor consectetur.</p>
        <a class="btn btn-default" href="#">More Info</a>
      </div>
      <!-- /.col-md-4 -->
      <div class="col-md-4">
        <h2>Heading 2</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe rem nisi accusamus error velit animi non ipsa placeat. Recusandae, suscipit, soluta quibusdam accusamus a veniam quaerat eveniet eligendi dolor consectetur.</p>
        <a class="btn btn-default" href="#">More Info</a>
      </div>
      <!-- /.col-md-4 -->
      <div class="col-md-4">
        <h2>Heading 3</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe rem nisi accusamus error velit animi non ipsa placeat. Recusandae, suscipit, soluta quibusdam accusamus a veniam quaerat eveniet eligendi dolor consectetur.</p>
        <a class="btn btn-default" href="#">More Info</a>
      </div>
      <!-- /.col-md-4 -->
    </div>
    <!-- /.row -->
    <!-- Footer -->
    <footer>
      <div class="row">
        <div class="col-lg-12">
          <p>Copyright &copy; KillerNews.net</p>
        </div>
      </div>
    </footer>
  </div>

  <!-- /.container -->
  <script src="client.min.js"></script>
</body>
</html>
```
- bootstrapの使い方は適宜調べる

- エントリーポイントのJSを作成する

```javascript:app-router/src/js/client.js
import React from "react";
import ReactDOM from "react-dom";

import Layout from "./pages/Layout";

const app = document.getElementById('app');

ReactDOM.render(<Layout />, app);
```

- Webで確認してみる
```sh:
apple@appurunoMacBook-Pro app-router % docker-compose exec app-router sh
/app # npm start
```

- localhost:8001で動作の確認ができる
- ここで、srcディレクトリに`client.min.js`が作られていない事に疑問を持つかもしれないが正常である
- `client.min.js`は`webpack-dev-server`で開発サーバ上で擬似的に作成されているからである
- 実体のファイルとして`client.min.js`を吐き出したいのであれば、`npm install -g webpack webpack-cli`でグローバルにWebpackクライアントをインストールして`webpack --mode development`を実行すれば出力される

## React-Routerの導入

- 前述で用意した静的HTMLをSPAとして動的に描画するように作業を行う

```zsh:
/app # npm install --save-dev react-router react-router-dom
```
- `react-router v4`からは`react-router-dom`も必要

- ヘッダ部分の各コンポーネントを作成していく
```javascript:app-router/src/js/pages/Featured.js
import React from "react";

export default class Featured extends React.Component {
  render() {
    return (
      <h1>Featured</h1>
    );
  }
}
```
```javascript:app-router/src/js/pages/Archives.js
import React from "react";

export default class Archives extends React.Component {
  render() {
    return (
      <h1>Archives</h1>
    );
  }
}
```
```javascript:app-router/src/js/pages/Settings.js
import React from "react";

export default class Settings extends React.Component {
  render() {
    return (
      <h1>Settings</h1>
    );
  }
}
```

- client.jsファイルを編集

```javascript:app-router/src/js/client.js
import React from "react";
import ReactDOM from "react-dom";
// react-routerの読み込み
import { BrowserRouter as Router, Route } from "react-router-dom";

import Layout from "./pages/Layout";
// 各ヘッダコンポーネントの読み込み
import Featured from "./pages/Featured";
import Archives from "./pages/Archives";
import Settings from "./pages/Settings";

const app = document.getElementById('app');

// ReactDOM.render(<Layout />, app);
// <Router>コンポーネントで囲む
ReactDOM.render(
  <Router>
    <Layout>
      <Route exact path="/" component={Featured}></Route>
      <Route path="/archives" component={Archives}></Route>
      <Route path="/settings" component={Settings}></Route>
    </Layout>
  </Router>,
  app);
```
- 上記のソースコードを追加したら`npm start`を実行して一番最初の時と同じレイアウトで、エラー無く表示されれば問題ない

- React Routerではユーザがそれぞれ`/`,`/archives`,`/settings`のパスにアクセスした時に表示されるコンポーネントをそれぞれ、`Featured`,`Archives`,`Settings`になるように上記のように指定ができる
- `exact`はパスが厳密にマッチしたら表示されるコンポーネントであることを意味している
- 上記であれば、`exact`がないと`/archives`というパスにアクセスした時に、FeaturedコンポーネントもArchivesコンポーネントも表示されるという事態が発生する
- また、上記の場合だと`/archives/foo`や`/archives/hoge`というパスにアクセスした時は、必ずArchivesコンポーネントが表示される
- exactを使ったコンポーネントの指定はreact-router v3 までのIndexRouteに相当するので、v4からはexactを使用するようにする

## Linkを追加していく

- Layout.jsを修正してArchive,Settingsへのリンクを追加

```javascript:app-router/src/js/pages/Layout.js
import React from "react";
import { Link } from "react-router-dom";

export default class Layout extends React.Component {
  render() {
    return (
      <div>
        <h1>Sample</h1>
        component : {this.props.children}
        <Link to="archives">archives</Link>,
        <Link to="settings">settings</Link>
      </div>
    );
  }
}
```
- Layoutコンポーネントの各リンクをクリックするとclient.jsに埋め込まれたRouteコンポーネントがLayoutコンポーネントへ渡されるようになる
- Layoutコンポーネントの`this.props.children`からRouteコンポーネントを参照することができる 

## ボタンの装飾

- `<button class="btn btn-danger">`のような記述でBootStrapのCSSが適用され、ボタンを装飾することができる
- ただし、classキーワードはJavascriptでは予約語にあたるので、ソースコード内で使用することができない
  - Layput.jsで`<Link to="archives"><button class="btn-danger">archives</button></Link>`と記述すると装飾はされるが下記のようなエラーが発生する
  - Warning: Invalid DOM property `class`. Did you mean `className`?
- JSXではclassでは無く、classNameを使ってHTMLのclass属性を表す必要がある
- もしくは、`babel-plugin-react-html-attrs`を導入して、JSX内でもclassキーワードを使えるようにする

```zsh:
apple@appurunoMacBook-Pro 2020-02-DockerReact % docker-compose exec app-router sh                                                      
/app # npm install --save-dev babel-plugin-react-html-attrs
```
```javascript:app-router/webpack.config.js
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      use: [{
        loader: 'babel-loader',
        options: {
          plugins: ['react-html-attrs'], // 追加
          presets: ['@babel/preset-react', '@babel/preset-env']
        }
      }]
    }]
  },
```

## navigate

- ReactRouterを使用してPathを切り替えると、表示されていた状態がブラウザの履歴にも蓄積されるようになる
- navigateを使用することで、この履歴の管理をカスタマイズすることができる
  - react-router v4からnavigateを使って履歴を管理するにはwithRouterを使用する必要がある
- `this.props.history`
  `this.props.history.push`: 画面遷移、前居た画面を履歴に追加し、ブラウザの戻るボタンで戻れるようにする(React Router で標準的な挙動)
  `this.props.history.replace`: 画面遷移、前居た画面を置換するため、ブラウザの戻るボタンで戻れない

- 実装例
```javascript:app-router/src/js/pages/Layout.js
import React from "react";
import { Link, withRouter } from "react-router-dom" // withRouterを追加

// withRouterでLayputClassを囲む必要があるのでexport defaultを消す
class Layout extends React.Component {
  /** / に遷移する関数 */
  navigate() {
    console.log(this.props.history);
    this.props.history.push("/");
  }
  render() {
    return (
      <div>
        <h1>Sample</h1>
         {this.props.children}
         <Link to="archives"><button class="btn btn-danger">archives</button></Link>
         <Link to="settings"><button class="btn btn-success">settings</button></Link>
         <button class="btn btn-info" onClick={this.navigate.bind(this)}>featured</button>
      </div>
    );
  }
}
// withRouterでLayputClassを囲む
export default withRouter(Layout);
```

## URLのパラメータ取得

- 例えば`http://localhost:8080/archives/some`とURLが入力された時に"some"の部分を取得したい場合、`:変数名`という形式で取得することができる
- なお、`path="/archives"`と`path="/archives/:article"`が部分一致するため、`/archives/foo`ロケーションにアクセスした時に両方のコンポーネントがレンダリングされる
- そのため、短い方の`path="/archives"`にexactキーワードを追加して完全一致した場合のみレンダリングするように変更する必要がある
```javascript:client.js
  - <Route path="/archives" component={Archives}></Route>
  + <Route exact path="/archives" component={Archives}></Route>
  + <Route path="/archives/:article" component={Archives}></Route>
```
- 上記のルーティングの変更により、Archivesコンポーネントへ/archives以下の値が渡るようになる
  - 上の例だと`this.props.match.params.article`でパラメータを取得することができる

## URLのパラメータを正規表現で指定

- 子コンポーネントに渡すパラメータを正規表現で指定することができる
- 例えばSettingsコンポーネントに`this.props.match.params.mode`で、/settings/nomalもしくは/settings/hardというパス値のときのみ動作するコンポーネントを定義可能
```javascript:client.js
  -  <Route path="/settings" component={Settings}></Route>
  +  <Route path="/settings/:mode(nomal|hard)" component={Settings}></Route>
```
- 上記のルーティングの変更により、Settingコンポーネントで`this.props.match.params.mode`で値を参照できる

## クエリストリングを取得する     

- クエリストリングとはブラウザなどのURLを`http://localhost:8080/archives?date=today&filter=hot`と入力した時に、パラメータとして渡す`?date=today&filter=hot`の`key=value`の値のこと
- **クエリストリングを React Router で解析するやり方が React Router v4 で撤去されている**
- React Router v4 からは独自にクエリストリングを解析する必要がある

- URLSearchParamsを使用する方法
- Layout.jsでクエリストリングを含んだリンクに書き換える
```javascript:app-router/src/js/pages/Layout.js
  - <Link to="/archives"><button class="btn btn-danger">archives</button></Link>
  - <Link to="/archives/some-other-articles" class="btn btn-warning">archives (some other articles)</Link>
  + <Link to="/archives/some-other-articles?date=yesterday&filter=none" class="btn btn-warning">archives (some-other-articles)</Link>
  + <Link to="/archives?date=today&filter=hot" class="btn btn-danger">archives</Link>
```
- Archivesコンポーネントにクエリストリングを解析して画面に表示
```javascript:app-router/src/js/pages/Archives.js
import React from "react";

export default class Archives extends React.Component {
  render() {
    // withRouterで囲まれたコンポーネント(Layout)のpropsに渡されるlocationを引数にURLSearchParamsオブジェクトを作成する
    const query = new URLSearchParams(this.props.location.search)
    let message
      = (this.props.match.params.article
        ? 'URLパラメータ：' + this.props.match.params.article + ", "
        : "")
      + "クエリストリング： date=" + query.get("date") + ", filter=" + query.get("filter");
    return (
      <div>
        <h1>Archives</h1>
        <div> {message}</div>
      </div>
    );
  }
}
```
**URLSearchParams をサポートしていないブラウザ対応**
- query-stringライブラリを使って解析する方法がある

## activeClassNameを使用する

- `NavLink`を使うと`activeClassName`というpropを使って該当するリンクが表示されている時に適用するHTMLのclass値を指定可能
```javascript:app-router/src/js/pages/Layout.js
import { NavLink, Link, withRouter } from "react-router-dom"; // Navlinkを追加

  - <Link to="/settings/nomal"><button class="btn btn-success">settings (Nomal)</button></Link>
  + <NavLink to="/settings/nomal" class="btn btn-success" activeClassName="btn-danger">settings (Nomal)</NavLink>
```
- **NavLinkのtoにquery stringが含まれる場合、activeClassNameに指定したclassが正しく反映されない**
- ※ React Router v4 からquery stringに対しての機能を取り除いたため

## 静的コンテンツのコンポーネント化

- `src/index.html`内の静的コンテンツを各Reactコンポーネントに移動していく

- まずは、bodyタグ内部をごっそり削る
```html:app-router/src/index.html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="">
  <meta name="author" content="">
  <title>React</title>
  <link href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.6/cerulean/bootstrap.min.css" rel="stylesheet">
  <link href="http://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,700,300italic,400italic,700italic" rel="stylesheet" type="text/css">
</head>

<body>
  <div id="app"></div>
  <script src="/client.min.js"></script>
</body>

</html>
```
- ヘッダ部分のリンクのルーティングを`src/js/client.js`に定義する
```javascript:app-router/src/js/client.js
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Layout from "./pages/Layout";
import Featured from "./pages/Featured";
import Archives from "./pages/Archives";
import Settings from "./pages/Settings";

const app = document.getElementById('app');

ReactDOM.render(
  <Router>
    <Layout>
      <Route exact path="/" component={Featured}></Route>
      <Route path="/archives/:article" name="archives" component={Archives}></Route>
      <Route path="/settings" name="settings" component={Settings}></Route>
    </Layout>
  </Router>,
app);
```
- ページ全体（Body内部）のコンポーネント`src/js/pages/Layout.js`を作成する
- 後述で作成するNavコンポーネントに対して`location`を渡すようにして、Navコンポーネント側で選択中のActiveClassNameを実現する
```javascript:app-router/src/js/pages/Layout.js
import React from "react";
import { withRouter } from "react-router-dom";

import Footer from "../components/layout/Footer";
import Nav from "../components/layout/Nav";

class Layout extends React.Component {
  render() {
    const { location } = this.props;
    const containerStyle = {
      marginTop: "60px"
    };
    return (
      <div>
        <Nav location={location} />
        {/** 中央に記事を出力するようにcontainerStyleを指定する */}
        <div class="container" style={containerStyle}>
          <div class="row">
            <div class="col-lg-12">
              <h1>Sample</h1>
              {/** client.jsでLayoutコンポーネントでwrapしている子コンポーエントを表示する */}
              {this.props.children}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }
}
/** withRouterで囲む */
export default withRouter(Layout);
```
- Layoutコンポーネントで使用するNavコンポーネント`src/js/components/layout/Nav.js`を作成する
```javascript:app-router/src/js/components/layout/Footer.js
import React from "react";
import { Link } from "react-router-dom";

export default class Nav extends React.Component {
  constructor() {
    super();
    this.state = {
      collapsed: true
    };
  }
  /**  Bootstrapのナビゲーションバーの再現を行うための関数
   *   (data-toggle="collapse" data-target="#bs-example-navbar-collapse-1"） */
  toggleCollapse() {
    const collapsed = !this.state.collapsed;
    this.setState({collapsed});
  }
  render() {
    const { location } = this.props; // Layoutコンポーネントから渡ってくるlocation情報
    const { collapsed } = this.state; // 
    const featuredClass = location.pathname === "/" ? "active" : ""; // アクセスパスが/の時は、featuredクラスをアクティブ状態
    const archivesClass = location.pathname.match(/^\/archives/) ? "active" : ""; // アクセスパスが/archivesの時は、archivesクラスをアクティブ状態
    const settingsClass = location.pathname.match(/^\/settings/) ? "active" : ""; // アクセスパスが/settingsの時は、settingsクラスをアクティブ状態
    const navClass = collapsed ? "collapse" : "";
    return (
      <nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
        <div class="container">
          <div class="navbar-header">
            {/** onClick = data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" */}
            <button type="button" class="navbar-toggle" onClick={this.toggleCollapse.bind(this)}>
              <span class="sr-only">Toggle navigation</span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
            </button>
          </div>
          <div class={"navbar-collapse " + navClass} id="bs-example-navbar-collapse-1">
            <ul class="nav navbar-nav">
              {/** アクセスパスによってactive状態のliが変化する */}
              <li class={featuredClass}>
                {/** onClick = icon-barとの対応付 */}
                <Link to="/" onClick={this.toggleCollapse.bind(this)}>Featured</Link>
              </li>
              <li class={archivesClass}>
                <Link to="/archives/news?date=today&filter=none" onClick={this.toggleCollapse.bind(this)}>Archives</Link>
              </li>
              <li class={settingsClass}>
                <Link to="/settings" onClick={this.toggleCollapse.bind(this)}>Settings</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}
```

- Layoutコンポーネントで使用するNavコンポーネント`src/js/components/layout/Footer.js`を作成する
```javascript:app-router/src/js/components/layout/Footer.js
import React from "react";

export default class Footer extends React.Component {
  render() {
    return (
      <footer>
        <div class="row">
          <div class="col-lg-12">
            <p>Copyright &copy; Sammple</p>
          </div>
        </div>
      </footer>
    );
  }
}
```

- ArchivesページおよびFeaturedページから呼び出される記事のテンプレート用コンポーネント`src/js/components/Article.js`を作成する
```javascript:app-router/src/js/components/Article.js
import React from "react";

export default class Article extends React.Component {
  render() {
    const { title } = this.props;

    return (
      <div class="col-md-4">
        <h4>{title}</h4>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe rem nisi accusamus error velit animi non ipsa placeat. Recusandae, suscipit, soluta quibusdam accusamus a veniam quaerat eveniet eligendi dolor consectetur.</p>
        <a class="btn btn-default" href="#">More Info</a>
      </div>
    );
  }
}
```

- Archivesページ`src/js/pages/Archives.js`を作成する
```javascript:app-router/src/js/pages/Archives.js
import React from "react";
import Article from "../components/Article";

/** アーカイブページ */
export default class Archives extends React.Component {
  render() {
    /** クエリストリングを取得するためのURLSearchParamsオブジェクトを作成する */
    const query = new URLSearchParams(this.props.location.search)
    /** URLパラメータを取得する */
    const { article } = this.props.match.params;
    const date = query.get("date");
    const filter = query.get("filter");

    /** 記事テンプレートにタイトルを渡して記事コンポーネントを作成する */
    const Articles = [
      "Some Article",
      "Some Other Article",
      "Yet Another Article",
      "Still More",
      "Fake Article",
      "Partial Article",
      "American Article",
      "Mexican Article"
    ].map((title, i) => <Article key={i} title={title} />);

    return (
      <div>
        <h1>Archives</h1>
        article: {article}, date: {date}, filter: {filter}
        <div class="row">{Articles}</div>
      </div>
    );
  }
}
```
