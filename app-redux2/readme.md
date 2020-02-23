## React+Reduxでアプリケーションを作成してみる

### プロジェクトの作成

```sh:
apple@appurunoMacBook-Pro 2020-02-DockerReact % docker-compose exec app-redux2 sh
/app # npm init -y
/app # npm install --save-dev @babel/core babel-loader \
>         @babel/plugin-proposal-decorators @babel/preset-env @babel/preset-react \
>         webpack webpack-cli webpack-dev-server \
>         react react-dom react-redux react-router react-router-dom \
>         redux redux-logger redux-promise-middleware redux-thunk \
>         axios
```
- 前回からの追加で導入しているパッケージ`@babel/plugin-proposal-decorators`は、ES6のdecorator構文を使用するため
- webpack-dev-serverが起動するようにpackage.json に以下のように追記
```json:
  "start": "webpack-dev-server --hot --inline --watch-content-base --content-base src",
```
- `webpack.config.js`を作成する
  <details>
  <summary>webpack.config.js</summary>

  ```js:
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
  ```
  </details>

### Reduxエリア部分を作成する

- `src/index.html`の作成を作成する
- アプリのトップページとなる
  <details>
  <summary>src/index.html</summary>

  ```html:
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
  </details>

- `src/js/client.js`を作成する
  <details>
  <summary>src/js/client.js</summary>

  ```js:
  import React from "react"
  import ReactDOM from "react-dom"

  /** ページ(<div id="app"></div>内)全体のレイアウト */
  import Layout from "./components/Layout"

  /** SPAを埋め込む場所 */
  const app = document.getElementById('app')

  /** Layoutコンポーネントをレンダリングする */
  ReactDOM.render(<Layout />, app)
  ```
  </details>

- `src/js/components/Layout.js`を作成する
  <details>
  <summary>src/js/components/Layout.js</summary>

  ```js:
  import React from "react"

  export default class Layout extends React.Component {
    render () {
      /** 仮でnullを返すようにしている何もないコンポーネント */
      return null
    }
  }
  ```
  </details>

- `src/js/store.js`を作成する
- storeはアプリケーションに一つだけ存在する
  <details>
  <summary>src/js/store.js</summary>

  ```js:
  import { createStore, applyMiddleware } from "redux"

  /** logを記録するReduxミドルウェア */
  import { createLogger } from "redux-logger"
  /** Actionsをプレーンなオブジェクトではなく関数を与えられるようにする */
  import thunk from "redux-thunk"
  /** Promiseの処理をきれいに描けるようにする */
  import { createPromise } from 'redux-promise-middleware'
  const promise = createPromise({ type: { fulfilled:'success' }})

  /** Reducerおさらい: Actionをを引数として受取り、stateをどう更新するかを定義 */
  import reducer from "./reducers"

  /** applyMiddlewareは可変長引数を受け取れるのでいくつでもMiddlewareを引数に取れる */
  const middleware = applyMiddleware(promise, thunk, createLogger())

  /** StoreにReducerとMiddlewareを登録する */
  export default createStore(reducer, middleware)
  ```
  </details>

- `src/js/reducers/index.js`を作成する
- 複数のReducerを読み込み、統合するファイル
  <details>
  <summary>src/js/reducers/index.js</summary>

  ```js:
  import { combineReducers } from "redux"

  import tweetsReducer from "./tweetsReducer"
  import userReducer from "./userReducer"

  export default combineReducers({
    tweetsReducer,
    userReducer
  })
  ```
  </details>

- `src/js/reducers/tweetsReducer.js`と`src/js/reducers/userReducer.js`を作成する
- それぞれ、与えられたActionTypeからどのようにStateをを変更していくかを定義していく
- immutableを意識して、新しい値を設定する場合は常に新しいObjectを生成して返すようにする
  <details>
  <summary>src/js/reducers/tweetsReducer.js</summary>

  ```js:
  export default function reducer(state={
    tweets: [],
    fetching: false,
    fetched: false,
    error: null,
  }, action) {

    switch (action.type) {

      case "FETCH_TWEETS": {
        return { ...state, fetching: true }
      }
      case "FETCH_TWEETS_REJECTED": {
        return { ...state, fetching: false, error: true}
      }
      case "FETCH_TWEETS_FULFILLED": {
        return {
          ...state,
          fetching: false,
          fetched: true,
          tweets: action.payload
        }
      }
      case "ADD_TWEET": {
        return {
          ...state,
          tweets: [ ...state.tweets, action.payload ]
        }
      }
      case "UPDATE_TWEET": {
        const { id, text } = action.payload
        const newTweets = [ ...state.tweets ]
        const tweetToUpdate = newTweets.findIndex(tweet => tweet.id === id)
        newTweets[tweetToUpdate] = action.payload
        return {
          ...state,
          tweets: newTweets
        }
      }
      case "DELETE_TWEET": {
        return {
          ...state,
          tweets: state.tweets.filter(tweet => tweet.id !== action.payload )
        }
      }
      
    }
  }
  ```
  </details>
  <details>
  <summary>src/js/reducers/userReducer.js</summary>

  ```js:
  export default function reducer(state = {
    user: {
      id: null,
      name: null,
      age: null,
    },
    fetching: false,
    fetched: false,
    error: null,
  }, action) {

    switch (action.type) {
      case "FETCH_USER": {
        return { ...state, fetching: true }; å
      }
      case "FETCH_USER_REJECTED": {
        return { ...state, fetching: false, error: action.payload };
      }
      case "FETCH_USER_FULFILLED": {
        return {
          ...state,
          fetching: false,
          fetched: true,
          user: action.payload
        };
      }
      case "SET_USER_NAME": {
        return {
          ...state,
          user: { ...state.user, name: action.payload }
        };
      }
      case "SET_USER_AGE": {
        return {
          ...state,
          user: { ...state.user, age: action.payload }
        };
      }
    }

    return state;
  }
  ```
  </details>


- `src/js/actions/userActions.js`と`src/js/actions/tweetsActions.js`を作成する
- Actionにはstateを変更するための関数が用意されている
- ※今回、fetchUser関数の返り値は固定にしているが、本来なら外部のAPIから取得したものを返す
- これらのファイルには複数の関数を定義する予定なので、`named exports`で定義している
  - `named exports`: モジュールは前言の先頭にexportとつけることで、複数のモジュールをexportすることができる
    ```js:lib.js
      export const sqrt = Math.sqrt // 平方根を返す標準ライブラリ
      export function square(x) { return x * x }
      export function diag(x,y) { return sqrt(square(x) + square(y)) }
    ```
    ```js:main.js
      // それぞれの関数をインポートするやり方
      import { square. diag } from "lib"
      console.log(square(11)) 
      console.log(diag(3,4)) 
      // モジュール全体をインポートして、プロパティ表記法で参照するやり方
      import * as lib from "lib"
      console.log(lib.square(11)) 
      console.log(lib.diag(3,4)) 
    ```
    - [詳しくみる](https://qiita.com/senou/items/a2f7a0f717d8aadabbf7)

  <details>
  <summary>src/js/actions/userActions.js</summary>

  ```js:
  export function fetchUser() {
    return {
      type: "FETCH_USER_FULFILLED",
      payload: {
        id: 0,
        name: 'admin',
        age: 39
      }
    }
  }

  export function setUserName(name) {
    return {
      type: "SET_USER_NAME",
      payload: name
    }
  }

  export function setUserAge(age) {
    return {
      type: "SET_USER_AGE",
      payload: age
    }
  }
  ```
  </details>

  <details>
  <summary>src/js/actions/tweetsActions.js</summary>

  ```js:
  import axios from "axios"

  export function fetchTweets() {
    return function (dispatch) {
      dispatch({ type: "FETCH_TWEETS" })
      
      axios.get("http://localhost:18080")
        .then((response) => {
          dispatch({type: "FETCH_TWEETS_FULFILLED", payload: response.data})
        })
        .catch((err) => {
          dispatch({type: "FETCH_TWEETS_REJECTED", payload: err})
        })
    }
  }

  export function addTweet(id, text) {
    return {
      type: "ADD_TWEET",
      payload: { id, text }
    }
  }

  export function updateTweet(id, text) {
    return {
      type: "UPDATE_TWEET",
      payload: { id, text }
    }
  }

  export function deleteTweet(id) {
    return { type: 'DELETE_TWEET', payload: id};
  }
  ```
  </details>

### Reduxに接続する

- Reduxに接続するためには`react-redux`をインストールしておく必要がある
- インストールしたら、トップレベルコンポーネント(`src/js/client.js`)を下記のように修正する
```js:

```


