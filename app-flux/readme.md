### FluxによるReact開発

## fluxとは

- ユーザインターフェースを構築するためのアプリケーションアーキテクチャのひとつ
- ReactはviewレイヤーのFWであるため状態管理の手法を持ち合わせていない
- Storeと呼ばれる状態を管理する格納場所が役割を担っており、SPAではWebブラウザなどのクライアント側で行ってあげる必要がある
- fluxとは、このような状態管理の手法まで含めたSPAを実現するための設計パターン

## stateについて

- Reduxでいうところのstateは、現在の状態を表すデータを保管するもののこと
- React自身は、JSXを使い画面をレンダリングする機能はあるが、状態のCRUDが簡単に行える思想で作られてはいない
- ただし、Reactにstateそのものが無いわけではなく、stateを保持するReactコンポーネントを既に作成しているはず
- 例えば、ES6から実装されている`class`記法で作成したReactコンポーネントを下記で表す
```javascript:
import React, { Component } from 'react';
class Example extends React.Component {
    constructor {
        super()
        this.state = {
            unread_notifications: [
                { user: "Taro", message: "Hello" },
                { user: "Jiro", message: "Good afternoon" },
                { user: "Ann", message: "Good evening" }
            ]
        }
    }
    render() {
        const { unread_notifications } = this.state
        return <ul>{ unread_notifications.map(el => { <li key={el.name}>{el.message}</li> })}</ul>
    }
}
```
- 上記の例のように、React.Componentを拡張したclassは自身のstateを持っている
- また、setStateを使用して自身のstateのデータを更新することができる
- ただし、状態管理が複雑になるとコードが複雑になったり保守性が低くなるなどの弊害が現れる
  - 例えば、API側から受動的にPUSH方式で未読メッセージが追加されたりなど
- 他にも、状態の変化をどのように追跡すれば良いのかなどの弊害も現れる
  - 例えば、上記ならば初期状態では１件の未読メッセージのオブジェクトがセットされていて、別途２件の未読メッセージのオブジェクトが追加された場合に、３件の未読を追跡する方法など
  - SPAが出るまでは、定期的にWebブラウザ側からアプリケーションサーバ側に未読メッセージの件数を取得処理を実行し、アプリケーション側ではセッションを使用してユーザ毎の累計未読メッセージを都度、ブラウザ側に伝える手法を従来は行っていた
  - しかし、SPAが現れてからバックグラウンド側ではセッションを用いないシンプルなREST APIで建てられることが多くなった
  - その代わりに、ブラウザ側では現在何件の未読メッセージが存在するのか、状態を管理する要求が現れた
  - この要求に応える手法が`flux`といえる

## fluxの処理の流れ

- **View -> Actions -> Dispatcher -> Stores -> View**
  - View: 画面にあたり、ユーザがクリックするボタンや入力を行うフォームを想定している
  - Actions: Viewでの動作をListenしている
  - Dispatcher: 全てのActionを受けてStoreにイベントを発火する（全てのデータのオペレーションがDispatcherに集約されている）
  - Stores: アプリケーション全体のデータとビジネスロジックを持つ（Dispatcherから送られてくるActionに対してデータを処理する関数を登録してある）
  - View: Storeに変更があったらその値で自分自身を新しい情報でレンダリングする

## Actions

- Actionsは、ユーザが画面操作によって発生するデータの更新要求や、バックグラウンドから発生するデータの更新要求を発行する部分
- 具体的には以下のようなデータが要求される
```javascript:
{
  type: "ADD_TODO",
  data: {
    name: "Study English",
    description: "Studing English with Bob"
  }
}
```
- そして、ActionからDispatcherへデータはdispatchされる
```javascript:
Dispatcher.dispatch({
  type: "ADD_TODO",
  data: {
    name: "Study English",
    description: "Studing English with Bob"
  }
})
```

## Dispatcher

- Dispatcherのベースは`pub/sub`の思想
- Actionから受け取った処理をDispatcherは複数の接続先であるDBや他APIサーバ等にアクセスして必要なデータを処理したり、計算処理をする役割を持つ
- Dispatcherは一つのアプリケーションに一つの、シングルトンパターンが多い
- 処理されたデータは随時Storeに送られる

## Stores

- Viewがレンダリングするためのデータを格納する役割を持つ
- 一つのアプリケーションに複数存在することがあるが、それぞれはシングルトンパターンとして存在
- JavaScriptではActionからのdispatchにコールバックを登録しておき、Dispatcherの処理が完了後にStore自身のデータが更新されるという流れが一般的

## View

- Storeのデータを検知して、データをレンダリングして表示する

## Flux思想にそってTODOアプリを作成してみる

- dockerコンテナ起動
```zsh:
apple@appurunoMacBook-Pro project % docker-compose up -d
apple@appurunoMacBook-Pro 2020-02-DockerReact % docker-compose exec app-flux sh
```

- プロジェクトの作成

```zsh:
/app # npm init
# Babel関連のパッケージ導入
/app # npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-loader \
          babel-plugin-react-html-attrs babel-plugin-add-module-exports \
          babel-plugin-transform-class-properties babel-plugin-transform-decorators-legacy
# React関連のパッケージ導入
/app # npm install --save-dev react react-dom react-router react-router-dom webpack webpack-cli webpack-dev-server
# fluxのパッケージ導入
/app # npm install --save-dev flux
```
- webpack.config.jsの作成

```javascript:app-flux/webpack.config.js
var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path');

module.exports = {
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
  devServer: {
    port: 8001, // use any port suitable for your configuration
    host: '0.0.0.0', // to accept connections from outside container
    watchOptions: {
      aggregateTimeout: 500, // delay before reloading
      poll: 1000 // enable polling since fsevents are not supported in docker
    },
    historyApiFallback: true
  },
  plugins: debug ? [] : [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};
```

- ベースのコンテンツを作成 (構成は基本的にapp-routerとほぼ同じ)

- SPAのベースページ`src/index.html`の作成
```html:app-flux/src/index.html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="" />
  <meta name="author" content="" />
  <title>React</title>
  <!-- Bootstrap Core CSS -->
  <link href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.6/cerulean/bootstrap.min.css" rel="stylesheet" />

  <!-- Custom Fonts -->
  <!-- <link href="font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css" /> -->
  <link href="http://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,700,300italic,400italic,700italic"
    rel="stylesheet" type="text/css" />
</head>

<body>
  <div id="app"></div>
  <script src="client.min.js"></script>
</body>

</html>
```

- webpack対象のエントリーファイル`src/js/client.js`の作成
```javascript:app-flux/src/js/client.js
import React from "react";
import ReactDOM from "react-dom";
/** Routerを使用してページ遷移を行う想定 */
import { BrowserRouter as Router, Route } from "react-router-dom";

/** pages群のコンポーネント */
import Layout from "./pages/Layout"; // Topページ（ベース）
import Todos from "./pages/Todos"; // Todo一覧ページ（/)
import Favorites from "./pages/Favorites"; // Favoriteページ（/favorite）
import Settings from "./pages/Settings"; // Settingsページ（/Settings）

const app = document.getElementById('app');

/** ルーティング設定 */
ReactDOM.render(
  <Router>
    <Layout>
      <Route exact path="/" component={Todos}></Route>
      <Route path="/favorites" component={Favorites}></Route>
      <Route path="/settings" component={Settings}></Route>
    </Layout>
  </Router>,
  app);
```

- ベースのページ`src/js/pages/Layout.js`の作成
```javascript:app-flux/src/js/pages/Layout.js
import React from "react";
import { Link, withRouter } from "react-router-dom";

/** ヘッダとフッダのコンポーネント */
import Nav from "../components/Layout/Nav";
import Footer from "../components/Layout/Footer"

class Layout extends React.Component {
  render() {
    /** historyオブジェクトのlocationを取得 */
    const { location } = this.props;
    const containerStyle = {
      marginTop: "60px"
    };
    return (
      <div>
        {/** Navコンポーネントにlocation情報を渡す */}
        <Nav location={location} />
        <div class="container" style={containerStyle}>
          <div class="row">
            <div class="col-lg-12">
              {/** client.jsでLayoutコンポーネントでラップされた子コンポーネントを表示する */}
              {this.props.children}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }
}
export default withRouter(Layout)
```

- Layoutページで使用するヘッダ`src/js/components/layout/Nav.js`の作成
```javascript:app-flux/src/js/components/layout/Nav.js
import React from "react";
import { Link } from "react-router-dom";

/** ナビコンポーネントは、app-routerと同様にBootstrapのトグルヘッダにReactRouterのLinkを適応させるようにしている */
export default class Nav extends React.Component {
  constructor() {
    super();
    this.state = {
      collapsed: true
    };
  }
  toggleCollapse() {
    const collapsed = !this.state.collapsed;
    this.setState({ collapsed });
  }

  render() {
    const { location } = this.props;
    const { collapsed } = this.state;
    const featuredClass = location.pathname === "/" ? "active" : "";
    const archivesClass = location.pathname.match(/^\/favorites/) ? "active" : "";
    const settingsClass = location.pathname.match(/^\/settings/) ? "active" : "";
    const navClass = collapsed ? "collapse" : "";

    return (
      <nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
        <div class="container">
          <div class="navbar-header">
            <button type="button" class="navbar-toggle" onClick={this.toggleCollapse.bind(this)}>
              <span class="sr-only">Toggle navigation</span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
            </button>
          </div>
          <div class={"navbar-collapse"} id="bs-example-navbar-collapse-1">
            <ul class="nav navbar-nav">
              <li class={featuredClass}>
                <Link to="/" onClick={this.toggleCollapse.bind(this)}>Todos</Link>
              </li>
              <li class={archivesClass}>
                <Link to="favorites" onClick={this.toggleCollapse.bind(this)}>Favorites</Link>
              </li>
              <li class={settingsClass}>
                <Link to="settings" onClick={this.toggleCollapse.bind(this)}>Settings</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  };
}
```

- Layoutページで使用するヘッダ`src/js/components/layout/Footer.js`の作成
```javascript:app-flux/src/js/components/layout/Footer.js
import React from "react";

export default class Footer extends React.Component {
  render() {
    const footerStyles = {
      marginTop: "30px"
    };
    return (
      <footer style={footerStyles}>
        <div class="row">
          <div class="row">
            <p>Copyright &copy; Sample.com</p>
          </div>
        </div>
      </footer>
    );
  }
}
```

- Todoのページ`src/js/pages/Todos.js`の作成
```javascript:app-flux/src/js/pages/Todos.js
import React from "react";

import Todo from "../components/Todo.js";

/** TodoListのページ */
class Todos extends React.Component {
  constructor() {
    super();
    /** TodoList */
    this.state = {
      todos: [
        {
          id: 1,
          text: "Go Shop",
          complete: false
        },
        {
          id: 2,
          text: "Pay Bills",
          complete: false
        }
      ]
    };
  }

  render() {
    const { todos } = this.state
    /** Todoコンポーネントをstateに格納されている数分使用する */
    const TodoComponents = todos.map(todo => <Todo key={todo.id} {...todo} />)
    return (
      <div>
        <h1>Todo List</h1>
        {TodoComponents}
      </div>
    )
  };
}

export default Todos;
```

- Todosページで使用するTodoコンポーネント`src/js/components/Todo.js`の作成
```javascript:app-flux/src/js/components/Todo.js
import React from 'react';

export default class Todo extends React.Component {
  constructor(props) {
    /** propsなしのsuper()呼び出しでも、render()や他のメソッド内でthis.propsにアクセスできる */
    super();
  }
  render() {
    const { edit, text, complete } = this.props;
    /** デザイン的にiconを定義してみる */
    const icon = complete ? "\u2714" : "\u2716";

    if (edit) {
      return (<li><input value={text} focus="focused" /></li>)
    }
    return (
      <li>
        <span>{text}</span>
        <span>{icon}</span>
      </li>
    );
  }
}
```

- 擬似ページとしてFavorite`src/js/pages/Favorites.js`とSetting`src/js/pages/Settings.js`の作成
```javascript:app-flux/src/js/pages/Favorites.js
import React from "react";

export default class Favorites extends React.Component {
  render() {
    return (
      <div>
        <h1>Favorites</h1>
      </div>
    );
  }
}
```
```javascript:app-flux/src/js/pages/Settings.js
import React from "react";

export default class Settings extends React.Component {
  render() {
    return (
      <div>
        <h1>Settings</h1>
      </div>
    );
  }
}
```

## Storeを作成する