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

## Storeへの移行作業

- 前述したがStoreの役割は、**Storeが保持しているデータに変更があったらViewに送る**機能を持つ
- その機能を実現するために、EventEmitterを使ってStoreを作成する
- 場所は`src/js/stores/TodoStore.js`
- まずは、ベースのクラス定義を実装する
```javascript:app-flux/src/js/stores/TodoStore.js
/** 
 * EventEmitterを使用したイベント駆動型のクラスを定義するのに必要
 * TodoStoreクラスをEventEmitterで継承させることで、コンポーネント側からTodoStore.on("change")等でイベントを受け取ったり、
 * TodoStoreクラス内でthis.emit()を行ったりすることができる
*/
import { EventEmitter } from "events";

class TodoStore extends EventEmitter {
  constructor(){
    super();
    /** Todos.jsのstateで管理していたデータを移行 */
    this.todos = [
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
  }  
  /** todoリストを全て返すGetter */
  getAll() {
    return this.todos;
  }
}

/** シングルトンパターン */
const todoStore = new TodoStore;
export default todoStore;
```
- 状態管理をするStoreはそれぞれシングルトンパターンとなるように作成する
- シングルトンパターンな構成になるように、`const todoStore = new TodoStore;`のようにインスタンスを生成してインスタンスをExportしている
- Todosページで管理していたstateをストア側に移行した
- データを返す関数`getAll()`を定義した

- 続いて、`src/js/pages/Todos.js`を編集する
- データの部分を削除して、Todoストアからデータをインポートするように修正する
```javascript:app-flux/src/js/pages/Todos.js
import React from "react";

import Todo from "../components/Todo.js";
/** Todoストアを読み込む */
import TodoStore from "../stores/TodoStore";

/** TodoListのページ */
class Todos extends React.Component {
  constructor() {
    super();
    /** TodoList */
    this.state = {
      /** TodoストアのGetterを呼び出す */
      todos: TodoStore.getAll()
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

## 動的にTodoリストを更新できるようにする

- ストアに`createTodo()`メソッドを作成し、Todoを登録できるように改修する
- この`createTodo()`メソッドは、呼ばれると`change`イベントが発火されView側の処理を呼び出すようにする（イベント駆動型）

```javascript:app-flux/src/js/stores/TodoStore.js
/** 
 * EventEmitterを使用したイベント駆動型のクラスを定義するのに必要
 * TodoStoreクラスをEventEmitterで継承させることで、コンポーネント側からTodoStore.on("change")等でイベントを受け取ったり、
 * TodoStoreクラス内でthis.emit()を行ったりすることができる
*/
import { EventEmitter } from "events";

class TodoStore extends EventEmitter {
  constructor(){
    super();
    /** Todos.jsのstateで管理していたデータを移行 */
    this.todos = [
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
  }
  /** todoリストを全て返すGetter */
  getAll() {
    return this.todos;
  }
  /** todo登録イベント発火用メソッド */
  createTodo(text) {
    const id = Date.now();
    this.todos.push({
      id,
      text,
      complete: false
    });
    this.emit("change");
  }
}

/** シングルトンパターン */
const todoStore = new TodoStore;
export default todoStore;
```

- 続いて、View側であるTodos.jsに初期化処理用の`componentDidMount`メソッドを追加する
- `componentDidMount`はコンポーネントがマウントされた（ツリーに挿入された）直後に呼び出される
- DOMノードを必要とする初期化は`componentDidMount`で行われるべき

```javascript:app-flux/src/js/pages/Todos.js
import React from "react";

import Todo from "../components/Todo.js";
/** Todoストアを読み込む */
import TodoStore from "../stores/TodoStore";

/** TodoListのページ */
class Todos extends React.Component {
  constructor() {
    super();
    /** TodoList */
    this.state = {
      /** TodoストアのGetterを呼び出す */
      todos: TodoStore.getAll()
    };
  }
  /** 初期化処理 */
  componentDidMount() {
    TodoStore.on("change",()=>{
      this.setState({
        todos: TodoStore.getAll()
      })
    })
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

**GoogleChromeのコンソール上からdebugを行うために、TodoStore.jsに下記の処理をインスタンス生成した後に追加する**

- 下記のようにtodoStoreメソッドがグローバルスコープで呼び出せるようにwindow.todoStoreにTodoStoreインスタンスを格納
- `window.todoStore = todoStore;`
- Chromeブラウザの開発者モードでconsoleを開き、下記を実行して動作確認を行う (確認が終わったら削除する)
- `todoStore.createTodo('test')`

- ここまでは、イベント駆動を考慮したStoreへの移行作業になる
- 続いて、Flux思想に基づいたDispatcher経由で上記の仕組みを呼び出すように改修していく

## Dispatcherを作成する

- DispatcherはデータをStoreに受け渡す役割を持つ
- fluxパッケージを使用して、Dispatcherを作成する
- `src/js/dispatcher.js`を作成する

```javascript:app-flux/src/js/dispatcher.js
import { Dispatcher } from "flux";
export default new Dispatcher;
```

- 続いて、TodoStore.jsからDispatcherをimportして、handleActions()をDispatcherに登録する
```javascript:
import { EventEmitter } from "events";
/** dispatcherの読み込み */
import dispatcher from "../dispatcher";

class TodoStore extends EventEmitter {
  constructor(){
    super();
    /** Todos.jsのstateで管理していたデータを移行 */
    this.todos = [
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
  }
  /** todoリストを全て返すGetter */
  getAll() {
    return this.todos;
  }
  /** todo登録イベント発火用メソッド */
  createTodo(text) {
    const id = Date.now();
    this.todos.push({
      id,
      text,
      complete: false
    });
    this.emit("change");
  }
  /** すべてのListenerから利用される */
  handleActions(action){
    /** 受け取ったアクションの確認を行う */
    console.log("TodoStore received an action", action);
    /** 受け取ったアクションをハンドリングする */
    switch(action.type) {
      case "CREATE_TODO": {
        this.createTodo(action.text);
      }
    }
  }
}

/** シングルトンパターン */
const todoStore = new TodoStore;
/** dispatcher.registerで新たにListenerを追加 */
dispatcher.register(todoStore.handleActions.bind(todoStore));
/** debug用 */
window.dispatcher = dispatcher;
// window.todoStore = todoStore;
export default todoStore;
```
- `dispatcher.register` : 新たにListener を追加する
- `dispatcher.dispatch` : Action に対してデータを創出する
- 動作確認のため、dispatcherを一時的にグローバル化 (`window.dispatcher = dispatcher;`)
- Chromeから`dispatcher.dispatch({type: "some event"});`を実行する
- dispatcherが呼び出されることによって自動的にTodoStoreのhandleActionsが呼び出されて、出力結果よりデータが渡っていることがわかる
- 続いて、handleActionsで受け取ったデータをaction type毎に処理をハンドリングするように条件分岐を書く
- Chromeから`dispatcher.dispatch({type: "CREATE_TODO", text: "new todo"});`実行する
- Dispatcher経由でTodoの登録を行うことが確認できる

## Actionsの作成

- Stores,Dispatcherと作成したら最後にActionsを作成する
- Actionの役割はdispatchであり、Todoを作成するCreateTodoと削除するDeleteTodoメソッドを作成する
```javascript:app-flux/src/js/actions/TodoActions.js
import dispatcher from "../dispatcher"

export function createTodo(text) {
  dispatcher.dispatch({
    type: "CREATET_TODO",
    text
  })
}

export function deleteTodo(id) {
  dispatcher.dispatch({
    type: "DELETE_TODO",
    id
  })
}
```

- FluxにおいてViewであるコンポーネントはActionと関係を持つ (View->Action)
- コンポーネントにActionを取り込む必要がある
  - 具体的にはTodoページにActionをimportして、Todoを作成・削除するためのActionを発行するボタンを用意する

```javascript:app-flux/src/js/pages/Todos.js
import React from "react";

import Todo from "../components/Todo.js";
/** Todoストアを読み込む */
import TodoStore from "../stores/TodoStore";
/** Actionsを読み込む */
import * as TodoActions from "../actions/TodoActions";

/** TodoListのページ */
class Todos extends React.Component {
  constructor() {
    super();
    /** TodoList */
    this.state = {
      /** TodoストアのGetterを呼び出す */
      todos: TodoStore.getAll()
    };
  }
  /** 初期化処理 */
  componentDidMount() {
    TodoStore.on("change",()=>{
      this.setState({
        todos: TodoStore.getAll()
      })
    })
  }
  /** Todoを作成する関数 */
  createTodo() {
    TodoActions.createTodo("New Todo")
  }
  render() {
    const { todos } = this.state
    /** Todoコンポーネントをstateに格納されている数分使用する */
    const TodoComponents = todos.map(todo => <Todo key={todo.id} {...todo} />)
    return (
      <div>
        {/** Actionを発行するボタン */}
        <button onClick={this.createTodo.bind(this)}>Create!</button>
        <h1>Todo List</h1>
        {TodoComponents}
      </div>
    )
  };
}

export default Todos;
```

- これでflux思想に沿ったTodoアプリケーションが完成

## Fluxで非同期処理を扱う場合

- 非同期処理を扱う場合とは
  - 例えば、新しいTodoを取得する時に、インターネット経由でREST APIを使用して、非同期にデータを取得して画面をレンダリングする場合などのこと
  - 先ほど作成したTodoアプリケーションに、`reload`ボタンを追加して実装してみる

- Todoページに`reloadTodo()`メソッドを定義して、reloadボタンを作成
```javascript:app-flux/src/js/pages/Todos.js
import React from "react";

import Todo from "../components/Todo.js";
/** Todoストアを読み込む */
import TodoStore from "../stores/TodoStore";
/** Actionsを読み込む */
import * as TodoActions from "../actions/TodoActions";

/** TodoListのページ */
class Todos extends React.Component {
  constructor() {
    super();
    /** TodoList */
    this.state = {
      /** TodoストアのGetterを呼び出す */
      todos: TodoStore.getAll()
    };
  }
  /** 初期化処理 */
  componentDidMount() {
    TodoStore.on("change",()=>{
      this.setState({
        todos: TodoStore.getAll()
      })
    })
  }
  /** Todoを作成する関数 */
  createTodo() {
    TodoActions.createTodo("New Todo")
  }
  /** Todoを新規に取得する関数 */
  reloadTodos() {
    TodoActions.reloadTodos();
  }
  render() {
    const { todos } = this.state
    /** Todoコンポーネントをstateに格納されている数分使用する */
    const TodoComponents = todos.map(todo => <Todo key={todo.id} {...todo} />)
    return (
      <div>
        {/** Createを実行するボタン */}
        <button onClick={this.createTodo.bind(this)}>Create!</button>
        {/** Reloadを実行するボタン */}
        <button onClick={this.reloadTodos.bind(this)}>Reload!</button>
        <h1>Todo List</h1>
        {TodoComponents}
      </div>
    )
  };
}

export default Todos;
```
- 続いて、TodoActions.jsにreloadTodosメソッドを追加の実装を行う
- 本来は、axiosなどを使って非同期に外部のサービスからデータを取得する想定だが、今回は適当な外部サービスが存在しないので、setTimeoutで擬似的に処理を送らせて非同期な処理を実現する
```javascript:app-flux/src/js/actions/TodoActions.js
import dispatcher from "../dispatcher"

export function createTodo(text) {
  dispatcher.dispatch({
    type: "CREATE_TODO",
    text
  })
}

export function reloadTodos() {
  dispatcher.dispatch({
    type: "FETCH_TODO"
  })
  // 本来なら
  // axios("https://xxx").then((data)=> {
  //   console.log("got the data!", data);
  // })
  setTimeout(()=>{
    dispatcher.dispatch({
      type: "RECEIVE_TODOS",
      todos: [
        {
          id: 1000,
          text: "Go Shop Again",
          complete: false
        },
        {
          id: 2000,
          text: "Sleep",
          complete: false
        }
      ]
    })
  },1000)
}
```

- つづいて、TodoStore.jsにRECEIVE_TODOSを受け取った時にTodoを更新するメソッド(`receiveTodos()`)を追加
- そして、`receiveTodos()`を実行するActionTypeをhandleActionsに追加
```javascript:app-flux/src/js/stores/TodoStore.js

/** 
 * EventEmitterを使用したイベント駆動型のクラスを定義するのに必要
 * TodoStoreクラスをEventEmitterで継承させることで、コンポーネント側からTodoStore.on("change")等でイベントを受け取ったり、
 * TodoStoreクラス内でthis.emit()を行ったりすることができる
*/
import { EventEmitter } from "events";

import dispatcher from "../dispatcher";

class TodoStore extends EventEmitter {
  constructor(){
    super();
    /** Todos.jsのstateで管理していたデータを移行 */
    this.todos = [
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
  }
  /** todoリストを全て返すGetter */
  getAll() {
    return this.todos;
  }
  /** todo登録イベント発火用メソッド */
  createTodo(text) {
    const id = Date.now();
    /** ストアの更新 */
    this.todos.push({
      id,
      text,
      complete: false
    });
    /** データが更新されたことをViewに伝える */
    this.emit("change");
  }
  /** 非同期でデータを受け取るイベント発火用メソッド */
  receiveTodos(todos) {
    this.todos = todos;
    /** データが更新されたことをViewに伝える */
    this.emit("change");
  }
  /** すべてのListenerから利用される */
  handleActions(action){
    /** 受け取ったアクションの確認を行う */
    console.log("TodoStore.js", action);
    /** 受け取ったアクションをハンドリングする */
    switch(action.type) {
      case "CREATE_TODO": {
        /** データ登録メソッドを実行 */
        this.createTodo(action.text);
      }
      case "RECEIVE_TODOS": {
        /** データ受け取りメソッドを実行 */
        this.receiveTodos(action.todos)
      }
    }
  }
}

/** シングルトンパターン */
const todoStore = new TodoStore;
/** dispatcher.registerで新たにListenerを追加 */
dispatcher.register(todoStore.handleActions.bind(todoStore));
/** debug用 */
window.dispatcher = dispatcher;
// window.todoStore = todoStore;

export default todoStore;
```

## 補足：メモリリーク
- イベントやリスナのunbind忘れや失敗により、メモリが溜まってメモリリークを起こすことがある
- まず、メモリリークがどんなものなのかを再現する
  - Todoページは新しいTodoを表示するたびに新しくレンダリングされ、コンポーネントの分だけメモリを消費する
  - Todoページは、`componentDidMount`にListerを追加する処理を記述したが、このメソッドはレンダリングされるたびに呼ばれるメソッドである
  - 例えば、ナビゲーションメニューからTodosを押してTodoページを表示するたびにListenerが蓄積されていく
  - 試しに、TodoStore (EventEmitter) の`listenerCount`を使用して、現在のListener数を確認してみる

```javascript:app-flux/src/js/pages/Todos.js
   componentDidMount() {
     TodoStore.on("change", () => {
       this.setState({
         todos: TodoStore.getAll()
       });
     });
     /** 下記を追加して、changeがどれくらい蓄積されているのかを確認する */
     console.log("count", TodoStore.listenerCount("change"));
   }
```
- 何度かTodos メニューを表示させてから、reloadボタンをおすとunmountされていないコンポーネントのメソッドが呼ばれようとしたことにより出るエラーが発生する
- componentWillUnmountメソッドで使わなくなったListenerをunmountしてあげる必要がある

```javascript:
import React from "react";

import Todo from "../components/Todo.js";
/** Todoストアを読み込む */
import TodoStore from "../stores/TodoStore";
/** Actionsを読み込む */
import * as TodoActions from "../actions/TodoActions";

/** TodoListのページ */
class Todos extends React.Component {
  constructor() {
    super();
    this.getTodos = this.getTodos.bind(this);
    /** TodoList */
    this.state = {
      /** TodoストアのGetterを呼び出す */
      todos: TodoStore.getAll()
    };
  }
  /** 初期化処理 */
  componentDidMount() {
    TodoStore.on("change", this.getTodos);
    console.log("count", TodoStore.listenerCount("change"));
  }
  componentWillUnmount() {
    TodoStore.removeListener("change", this.getTodos);
  }
  /**  */
  getTodos() {
    this.setState({
      todos: TodoStore.getAll()
    })
  }
  /** Todoを作成する関数 */
  createTodo() {
    TodoActions.createTodo("New Todo")
  }
  /** Todoを新規に取得する関数 */
  reloadTodos() {
    TodoActions.reloadTodos();
  }
  render() {
    const { todos } = this.state
    /** Todoコンポーネントをstateに格納されている数分使用する */
    const TodoComponents = todos.map(todo => <Todo key={todo.id} {...todo} />)
    return (
      <div>
        {/** Createを実行するボタン */}
        <button onClick={this.createTodo.bind(this)}>Create!</button>
        {/** Reloadを実行するボタン */}
        <button onClick={this.reloadTodos.bind(this)}>Reload!</button>
        <h1>Todo List</h1>
        {TodoComponents}
      </div>
    )
  };
}

export default Todos;
```

## Fluxおさらい

<details>
<summary>一通りFlux思想でアプリケーションを作成したので、Fluxについておさらい（長いので折り畳んでいる）</summary>

**Fluxとは**

- クライアントサイドのデータフローの設計パターン
- 下記のようなイメージ図
```
                  +-------------+
       +----------|  Actions    |<---------+
       |          +-------------+          |
       |                                   |
       |                                   |
       |                                   |
       ▾                                   |
+-------------+   +-------------+   +------+------+
| Dispatcher  |-->|    Stores   |-->|    View     |
+-------------+   +-------------+   +-------------+
```
- データの流れを一方向に強制する
- この一方向のデータの流れは**イベント駆動**で実現される
- それぞれの役割を以下
  - ボタンクリックなどのトリガーにして
  - Actionと呼ばれるイベントとデータのかたまりが
  - Dispatcherと呼ばれるイベントハブに集約され
  - Dispatcherに登録されたコールバックによってStoreの状態が更新され
  - Storeの変更を検知したViewが自身を更新

**Dispatcher**

- DispatcherはFliuxのコアであり、アプリケーション全体で唯一のイベントハブ
- アプリケーション全体で唯一のイベントハブなので、シングルトンで実装される
- Fluxのデータフローを支えるために、２つの要件を満たす必要がある
- １つ目の要件は、**イベントが発生したらすべてのCallbackを実行する**
  - `addEventListener`のような特定のイベントに特定のコールバックを紐づけるのではなく、何らかのイベントがdispatchされたら登録済の全てのコールバックを実行する
  - コールバックには`Payload`とよばれる「イベントの情報を持つオブジェクト」を引数として渡す
- Dispatcherとは、**「コールバックを登録して、イベントがdispatchされたら登録済のコールバックにPayloadを渡して実行する」もの**
```javascript:
class Dispatcher {
    constructor() {
        this.callbacks = []
    }
    /** コールバックを登録 */
    register(callback) {
        this.callbacks.push(callback)
    }
    /** 全てのコールバックにPayloadを渡して実行 */
    dispatch(payload) {
        this.callbacks.forEach((callback) => { callback(payload) })
    }
}
/** シングルトンパターン */
const dispatcher = new Dispatcher
export default dispatcher
```
- ２つ目の要件は、**コールバックの実行順序を制御できる**
  - Storeを更新する際に実行順序を意識する必要がある場面がある
  - 「ユーザの設定を更新して、それに応じて表示する情報を更新する」と行ったケース
  - Flux Utilsで実例を確認してみると、Dispatcher.jsには`waitFor`という関数が定義されている
  - これがCallbackの実行順序を制御している
  - waitForはCallbackの中から呼び出して、「あのコールバックの実行を待ってから次のコールバックを実行する」といった制御が可能になる

```javascript:
const callback1 = (payload)=> {
    UserSettingStore.hoge = payload.hoge
}
/**
 * Callbackの登録
 * 登録すると識別IDが発行される
*/
const callbackId1 = dispatcher.register(callback1)
const callback2 = (payload)=> {
    /** UsdrSettingStoreの更新を待つ */
    dispatcher.waitFor([callbackId1])
    /** UserSettingStoreの更新後に最新の状態を取得 */
    const userSetting = UserSettingStore.getState()
    /** 最新状態のUserSettingに対して処理を施す */
}
const callbackId2 = dispatcher.register(callback2)
```

**Action**

- Actionはそのアプリケーション内でどのようなユーザオペレーション（登録やログインなど）が起きるかを定義する
- **ユースケース**を定義するもの
- 要件は以下の通りである
  - プレーンなオブジェクトであること
  - オブジェクトにはユースケースを表す`typeプロパティ`を持っていること
- `typeプロパティ`は一般的にActionTypeと呼ばれる
- また、ActionにはTypeプロパティ以外に、ユースケースを実行するための値を持たせることができる
```javascript:
const todoAction = {
    type: "CREATE_TODO",
    text: "Go Shopping !"
}
/** ActionがDispatcherに渡されることでデータフローが開始される */
dispatcher.dispatch(todoAction)
```

**ActionCreator**

- 実際のコードでは、Action生成からのDispatcherへ渡すまでの流れは、その一連の処理を行うヘルパーメソッドとして実装することが一般的
- このヘルパーメソッドをActionCreatorと呼ぶ

```javascript:
import ActionTypes from "./ActionTypes"
import dispatcher from "./dispatcher"

/** ActionCreator */
const addTodo = (text)=>{
    dispatcher.dispatch({
        type: ActionTypes.CREATE_TODO,
        text: text
    })
}
```

**Flux Standard Action**

- flux思想のライブラリであるReduxでは、「Actionはこう実装するべき」という指標が提示されている
- これをFSAと呼ぶ
- 表示んのActionの２つの要件に加えて下記の４つのルールが追加されている
  - Actionはpayloadプロパティを持つことができる
  - Actionはerrorプロパティを持つことができる
  - Actionはmetaプロパティを持つことができる
  - Actionはtype, payload, error, meta以外のプロパティを持ってはいけない
- typeプロパティはActionTypeのこと
- FSAにおけるpayloadは、今まで説明していたpayloadよりも狭義である
  - 今までのpayloadは、**Dispatcherに渡されるもの、すなわちActionオブジェクトそのもの**
  - FSAにおけるpayloadは、**Actionに必要な値のみ、今までの説明でいうところの text にあたる**
  ```javascript:
  {
      type: ActionTypes.CREATE_TODO,
      payload: {
          text: "Go Shopping !"
      }
  }
  ```
- FSAにおけるerrorプロパティは、エラーが起きたことを通知するためにtrueをセットして使う
  - 「エラーであることを正常時と同じ方法で伝達する」という点でPromise.rejectに似ている
  - ただし、error: true のときはpayloadにエラーオブジェクトを詰めるのが一般的な用法
- FSAにおけるmetaプロパティは、payloadに詰めるべきでないものを持つための補助的なもの

**Store**

- StoreはアプリケーションのState(状態)と、それを操作するロジックを持つ
- Getterを持つ
- Setterは持たない
- Setterの代わりにStoreが持つstateを更新するための関数を持ち、DispatcherのCallbackとして登録する
  - handleActionsをdispatcherに登録するなど
- Storeの値が変更されたら、イベントを発火し変更をViewに伝える
  - emit("change")のようにコンポーネント側に変更を伝える

```javascript:
import ActionTypes from "../ActionTypes"
import dispatcher from "../Dispatcher"

class TodoStore {
    constructor() {
        this.state = {
            todo: [],
            done: []
        }
        /**
         * TodoStoreに定義しているStoreが持つstateを更新するための関数をDispatcherのCallbackとして登録
        */
        dispatcher.register(this.update.bind(this))
    }
    /** Getterを持つ */
    getState() {
        return this.state
    }
    /** Storeが持つstateを更新するための関数 */
    update(action) {
        switch(action.type) {
            case ActionTypes.CREATE_TODO:
                const nextState = Object.assign({}, this.state)
                nextState.todo.push(action.text)
                this.state = nextState
                break;
        }
        /** Store内のStateが更新されたらイベントを発火 */
        this.emit()
    }
}

```

- 上記の例のように、Stateを直接変更するSetterを持たない
- どのような条件で、どのようにStateを更新するかを定義している関数（update）が実装されている

**InitialStateの実装**

- ViewはStateを取得するためにStoreのgetterを叩く
- ただ、初期描画時にはStoreが空っぽなので、初期値を定義しておく必要がある
- 先の例では、constructorの中で初期値を定義してるが、別の関数としてくくり出しておくのが一般的
  ```javascript:
  class TodoStore {
    getInitialState() {
        return {
            todo: [],
            done: []
        }
    }
    getState() {
        return this.state || this.getInitialState();
    }
  }
  ```

**Reduceの実装、そしてImmutableState**

- Stateを更新するCallbackの実装方法においても、一般的に良しとされているパターンがあり、それをReduce関数と呼ぶ
- Reduce関数は現在のStateとPayloadを受け取り、新しいStateを返す純粋関数
  ```javascript:
    class TodoStore {
        reduce(currentState, action) {
            switch(action.type) {
                case ActionTypes.ADD_TODO:
                    const nextState = Object.assign({}, currentState);
                    // do something
                    return nextState;
                default:
                    return currentState;
            }
        }
    }
  ```
- Reduce関数を用意することで、テストがしやすかったり、データ更新ロジックの周りで不整合が起きづらいことが期待される
- Reduce関数と併せて、StateをImmutableにする実装パターンもよく使われる（Reduce関数以外のところで意図せずStateが書き換えられてしまうことを防げる）
- Flux UtilsのFluxReduceStore.jsは、これらのパターンを組み込んだStoreを実装するためのライブラリである


**ここまでのまとめ**

- 何らかのActionがDispatcherに渡されると
- Dispatcherに登録されているすべてのCallbackが実行され
- そのCallbackが各々のStoreを更新していく

- *補足
- 実際にはStoreがViewの状態を持つ場面が必要だったりする
- Storeには、「アプリケーションの状態を保持するStore」と「Viewの状態を保持するStore」がある

**View**

- FluxにおけるViewの役割は２つある
  - 状態を持たないViews（役割としてViewと分けるために複数形）
  - Storeとのパイプラインになり、状態を受け取りController-Views

- 状態を持たないView
  - **外から状態を受け取り、テンプレートにはめ込み表示するのみ
  - ReactComponentで表現すると、Stateを持たないPropsを受け取るだけの`Functional Component`
  ```javascript:
  function TodoComponent(props) {
      return <input type="checkbox" checked="{props.isDone}" >{props.text}
  } 
  ```
  - このように関数でコンポーネントを定義する
  - 従来のClassコンポーネントとは違い、stateを持ったりインスタンス変数を持たず、propsを受け取るだけのコンポーネント
  - 状態を持たせて、コンポーネント内で完結する「表示に関わる状態」を持たせたい場合は、`Class Component`として実装する
  ```javascript:
  class TodoListComponent extends React.Component {
      constructor() {
          super()
          this.state = {
              isEmtpy: false
          }
      }
  }
  ```
  - これらを組み合わせて、Reactの一般的なViewsが構築されていく
  - ツリーの上から下へとpropsのバケツリレーで状態を渡して画面に表示していく

- Storeとのパイプラインとなり状態を受け取るController-Views
  - Viewsだけでは、Storeの情報を受け取る仕組みがない
  - これを担うのが、ツリー最上部に配置される（つまりは、ルートコンポーネント）Controller-Viewsであり、具体的な要件は２つ
    - Storeの変更を監視する
    - StoreからStateを取得して、Viewsに流し込むStateを形成する
  - Flux UtilsではController-ViewsをContainerと呼んでいる
  - ReactComponentをベースにContainerを生成するFluxContanier.jsが用意されています。
  ```javascript:
  import TodoStore from "./TodoStore"
  import HogeStore from "./HogeStore"
  class RootCompoent extends React.Component {
      /** 変更監視対象のStoreを列挙 */
      static getStores() {
          return [TodoStore, HogeStore]
      }
      /** Viewsに流し込むStateを形成 */
      static calculateState() {
          return {
              todoStore: TodoStore.getState(),
              hogeStore: HogeStore.getState(),
          }
      }
      /** viewsのpropsにStateを流し込む */
      render() {
          <ChildComponent {...this.state}>
      }
  }
  /** Container化する */
  export default Container.create(RootComponent);
  ```
  - FluxContainerとFluxStoreを繋ぎ込むために、２つのstaticメソッドが用意される
    - getStores(): 変更を監視するためのStoreを決める
    - calculateState(): Storeが変更されたら呼び出され、Viewsに流し込むStateを形成
  - このStateはComponentのstateにセットされるので、あとは通常のReactComponentのようにRender関数で子Componentへ渡せばOK
  - Storeの変更を監視するロジックは[こちら](https://github.com/facebook/flux/blob/master/src/container/FluxContainerSubscriptions.js)

**Viewのまとめ**

- 役割
- 状態を持たないViews
  - 原則stateを持たないReactComponent
  - Functinal Componentで実装することが推奨
  - 表示に関する状態を持つ場合はClass Componentで実装す
- Storeとのパイプラインとなり状態を受け取るController-Views
  - 要件①「Storeの変更を監視する」
  - 要件②「StoreからStateを取得し、Viewsに流し込むStateを形成する」
  - Flux UtilsではController-Viewsを「Container」と呼ぶ
  - FluxContainer.jsを利用してController-Viewsを実装できる
  - getStoresで監視するStoreを決める
  - calculateStateで流し込むStateを形成する

</details>