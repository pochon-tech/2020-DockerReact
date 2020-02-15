### ReduxによるReact開発

## Reduxとは

- Reduxとは、Javascriptアプリケーションのための状態管理ライブラリ
- SPAが生まれてから、フロントエンド側での状態管理が重要になってくる
- Reduxを使うことにより安定して一貫性のある動作の実現とテストタブルなコードが作成できる
- 非同期な処理は、ReduxのMiddlewaresという概念を利用することで、非同期処理の実行とその処理結果のミューテーションの両立をしながらの状態管理の複雑性に対応することができる
- Reduxが担う役割と特徴を理解するために、Reduc単体っでの動きを確認して、Reactと組み合わせたアプリケーションの作成を進めていく

## Reduxの構造

<details>
<summary>図を確認する場合はこちらをクリック</summary>

```
       +---------------------------------------------------+
       |                                                   |
  +- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
  |    |                                                   |                              |
       |                                                   ↓
  |  +-+-------------+                +---------+        +-+-----------------------+      |
     | Actions       |                | API     |<-------| Middlewares             |
  |  +-+-------------+                |         |------->|                         |      |
       ↑                              +---------+      +-| Dispatcher(middlewares) |-+
  |    |                                               | +-+-----------------------+ |    |
  +- - - - - - - - - - - - - - - - - - - - - - - -+    |   |                         |
       |                                          |    |   |  One Store     +---+    |    |
       |                                               |   ↓                ↓   |    |
       |                                          |    | +--------------------+ |    |    |  Redux area
       |                                               | | Reducer(s)         | |    |
       |                                          |    | +-+------------------+ |    |    |
    +--+---------------------+                         |   |                    |    |
    | View (Rendered state)  |                    |    |   |                    |    |    |
    | +--------------------+ |                         |   ↓                    |    |
    | | Presentational     | |                    |    | +--------------------+ |    |    |
    | | Components         | |                         | | State              +-+    |
    | +-+------------------+ |                    |    +-|                    |------+    |
    |   ↑                   |                           +----------+---------+
    |   |                    |                    |                 |                     |
    |  Pass Data as Props    |                                      |
    |   |                    |                    +- - - - - - - - -|- - - - - - - - - - -+
    | +-+------------------+ |       Re-Render                      |
    | | Container          |<-----     when      -------------------+
    | | Components         | |     Store Changes
    | +--------------------+ |
    +------------------------+

// ※ Provider Component, Smart Components, Dumb Components はReact内の要素
```

</details>

- 図の説明

**One Store**
- ReduxのStoreの特徴として、Fluxとは異なり１つのStoreのみ存在すること
- 全ての状態データを一箇所で管理することでシンプル性を維持する
- 画面およびアプリケーションの初期化はStoreから始まる
  - 例えば、TODOアプリケーションのStoreであれば、Fluxであれば、TodoListStoreやSettingStore等のStorega必要なコンポーネントとして上がってくるが、Reduxではそれらを一つの巨大なObjectに入れて管理する
- またReduxのStoreの性質として、immutableであり、一度作成されてStoreに格納されたデータは外からの手によって直接変更されることは無く、データは常に新く生成されたデータを置き換える形で更新させる
  - 注意点として、JavaScriptではネイティブでimmutableな性質を持たないため、Storeのデータを更新する場合は擬似的にこの性質を実現させる必要がある
  

**State**
- One Storeの中に存在し、アプリケーションの様々な要素の状態
- Stateはブラウザのローカルストレージ内に持たせたりすることもできるが、ReduxにおいてはStateを一つのJavaScriptオブジェクト内に保管する
- そのオブジェクト内には例えば現在どのページが表示されているのか、どのアイテムが設定されているのか、どのユーザで操作しているのかといったStateを保持している
- 状態(State)らJSONのようなもので状態を保存して別のブラウザでその状態をロードすれば同じアプリケーションがレンダリングされる
- 例えばカウンターアプリケーションでは、Stateは次のようなJSON形式で保存される
```javascript:
var initialState = {counter: 0};
```

**View (Renderred state)**
- 状態をレンダリングする
- Reactがそれに該当するが、その他のViewフレームワークでも可能であり、plainなJavascriptでも問題ない
- もしPlainなJavascriptで実現するならば以下のようになる
  - hoge_page.htmlのようなHTMLを用意
  ```html:
  <div id="counter"></div>
  ```
  -rendering.jsのようなJSを用意
  ```js:
  function render(state) {
      document.getElementById('counter').textContent = state.counter
  }
  ```

**Actions**
- アプリケーション状態が変更される時、Actionが発動
- Actionの種類としては、ユーザのアクション、非同期アクション、スケジュールされたアクションなどがある
- わかりやすい例としては画面にボタンを表示することで、ボタンが押されたタイミングでActionを発動する等
```html:
<button id="button">Increment</button>
```
```js:
document.getElementById('button').addEventListener('click', incrementCounter)
```

**Store and Reducer**
- Actionsは状態を直接変更することはない
- Reduxのstoreがその役割を担う
- Storeに対してActionデータを送出するときはdispatchを行う
```js:
/** dispatchを使ってデータを送出 */
var store = Redux.createStore(reducer, initialState);
function incrementCounter() { // (1)
  store.dispatch(
    type: 'INCREMENT'
  )
}
```
- Redux Storeは現在の状態を保持し、Actionに対して反応
- Actionがdispatchされた時(上記コードの(1)の部分)、Storeは現在のstateと現在のActionデータから必要に応じて計算を行い、stateを決定する
- またこの時、サーバや外部API等との通信が必要な場合はそれを非同期処理を使って行い、それが終わるのに時間がかかる場合は"処理中"のようなstateをひとまずは発行し、APIからのコールバックによって"処理完了(場合によってはエラー)" といったstateを作成するようにする
- そしてreducerが返却した値によってstateは更新される
```js:
/** reduerの記述例 */
function reducer(state, action) {
  if (action.type === 'INCREMENT') {
    state = Object.assign({}, state, {counter: state.counter + 1})
  }
  return state
}
```
- 前回のFluxのおさらいで述べた、「Reduceの実装、そしてImmutableState」の箇所に該当する
- stateが変更されたら、直ちに画面の再レンダリングを行うようにする
```js:
store.subscribe(function(){
    render(store.getState())
})
```
- React.jsを使えば、まさにその名のとおりであるrender()メソッドをReactコンポーネントは持っているので、それを呼び出せばOK

## Reduxによる問題解決

- 「ユーザが何のデータをいているか」「どのデータを取得しているのか」「エラーあるのか？どうゆう状態なのか」など、StateはJavascriptのあらゆところに存在し、それは単純なオブジェクトの中に保持される
- React自身であってもComponentは単純なオブジェクトであり、State保持しており、setState()を使ってコンポーネントが持つStateを操作したりできる
- これは、アプリケーションが複雑になるにつれて、状態を遷移させたり戻ったりさせることで管理できなくなる可能性がある
- React単体のフロントエンドは複雑な状態管理といったビジネスロジックを持たせるべきではない
- その代わりとなるもとして、Reduxが存在する

## immutabilityなJavaScript

- JavaScriptは標準でimmutabilityなコードを書くにはあまり気の利く言語ではない
- immutabilityとは簡単に言うと我々の手によって変化させられることの無い性質のこと
- 新しいデータをnewする(配列やオブジェクトを完全に新しく生成する)ことでのみデータを入れ替えることができる

**JavaScript でimmutable なデータを扱う方法について練習**

- データを変更されたくない場合はその値を持つ新しいデータの部品(object)を作れば良い
- もしデータを更新したいなら、その部品の中の値を変更するのではなく、部品そのものを新しく作成して取り替えてしまえば良いという考え方
- NodeJSを利用してそれを実感してみる

- Dockerコンテナを起動してコンテナの中に入る
```zsh:
apple@appurunoMacBook-Pro 2020-02-DockerReact % docker-compose up -d
apple@appurunoMacBook-Pro 2020-02-DockerReact % docker-compose exec app-redux sh
```

- nodeコマンドを実行しnameとその値を格納するObjectを作成
```zsh:
/app # node
> var a = { name: "foo" };
undefined
```

- この値"Foo"を"Bar"変更するために、変数aのnameに値を代入
```zsh:
> a.name = "Bar";
'Bar'
> a
{ name: 'Bar' }
```
- 実行すると、aのnameが"Foo"ではなく"Bar"に代わり、{name: "Foo"}のObjectは変更され失われてしまった
- この状態はimmutableではない
- JavaScriptには２つのデータ型`プリミティブ(primitive)型と参照(reference)型`を持っている
- プリミティブ(primitive)型
  - 数字、文字列、bool、その他にはnull, undefined, symbol等
- 参照(reference)型
  - Object, 配列等
  
- 次に、下記のようなコマンドを実行してみる
```sh:
> var a = {name: "Foo"};
undefined
> var b = a;
undefined
> b.name = "Bar";
'Bar'
> a
{ name: 'Bar' }
```
- 結果をみると、`変数a`に`Object`を格納後、`変数b`に`変数a`を代入しているが、この時点で`変数a`が参照している`Object`と`変数b`が参照しているオブジェクトは同じものであることがわかる

- 次に以下のようなコマンドを実行してみる
```sh:
> var a = {name: "Foo"};
undefined
> a = {name: "Foo", age: 35};
{ name: 'Foo', age: 35 }
> var b = Object.assign({}, a, {name: "Bar"});
undefined
> b
{ name: 'Bar', age: 35 }
> a
{ name: 'Foo', age: 35 }
```
- 結果をみると、`Object.assign`を使用することで最終的に`変数a`のオブジェクトの変更無しに`変数b`のオブジェクトを変更することができた
- このような性質はObject だけでなく、配列に関しても同様であり、`Array.prototype.concat()`を使う方法がある
```sh:
> var a = {name: "Foo", things: [0, 1, 2]};
undefined
> var b = Object.assign({}, a, {name: "Bar"});
undefined
> b.things = a.things.concat(3);
[ 0, 1, 2, 3 ]
> a
{ name: 'Foo', things: [ 0, 1, 2 ] }
> b
{ name: 'Bar', things: [ 0, 1, 2, 3 ] }
```

- プリミティブ型対しては単純な代入、参照型に対しては新しいObjectや配列を作成する関数を使用して変更することで、immutabilityを実現する
- 他にも**spread演算子**を使う方法がある
```sh:
> var a = { name: "Foo", age:35 }
undefined
> var b = { ...a, name: "Bar" }
undefined
> a
{ name: 'Foo', age: 35 }
> b
{ name: 'Bar', age: 35 }
```

## Redux単体の動きを確認する

- プロジェクトの作成
```sh:
/app # npm init -y
/app # npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-loader babel-plugin-react-html-attrs webpack webpack-cli webpack-dev-server
/app # npm install --save-dev redux
```
- 注意： "webpack-cli": "^4.0.0-beta.2", Error: Cannot find module 'webpack-cli/bin/config-yargs' （2020-02-11 18:00現在）
- package.jsonの修正
```json:package.json
  "scripts": {
    "start": "webpack-dev-server --hot --inline --watch-content-base --content-base src",
```
- webpack.config.jsの作成
```js:webpack.config.js
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
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};
```
- src/index.htmlと空のsrc/js/client.jsファイルを作成
```html:src/index.html
<!DOCTYPE html>
<html>
  <head>
    <title>Redux Tutorials</title>
  </head>
  <body>
    <script src="client.min.js"></script>
  </body>
</html>
```
- 開発サーバ実行を実行して、Chromeのコンソールを開い状態にしておく

**ReducerとStore**

- `src/js/client.js`でreduxをimportして、ReducerとStoreを作成する
```js:app-redux/src/js/client.js
import { createStore } from "redux";

const reducer = () => {
  console.log("reducer has been called.");
}

const store = createStore(reducer, 1);
```
- `createStore`にReducerとデータの初期値を渡す
- client.jsを保存してコンソールを確認すると初期値を設定するためにReducerが呼ばれたことが確認できる

**subscribeとdispatch**

- 続いて、`src/js/client.js`内に下記を追加する
  - Storeが変更された時に呼ばれるsubscribeメソッド
  - StoreにActionを送信するdispatchメソッドを追加
```js:app-redux/src/js/client.js
import { createStore } from "redux";

const reducer = () => {
  console.log("reducer has been called.");
}

const store = createStore(reducer, 1);

store.subscribe(() => {
  console.log("store changed", store.getState());
})

store.dispatch({type: "INC"});
```
- コンソールを確認すると、dispatchするところでも同様にReducerが呼ばれていることが確認できる
  - reducerは初期処理時とdispatch時の2回呼ばれている
  - その後に、Storeが変更されたことを検知してsubscribeメソッドが実行されている

**Action**
- ReducerでActionを受け取り、ActionのTypeごとに処理を分岐させる
```js:
import { createStore } from "redux";

const reducer = (state = 0, action) => {
  console.log("reducer has been called.", state);
  switch (action.type) {
    case "INC":
      return state + 1
    case "DEC":
      return state - 1
  }
  return state;
}
const store = createStore(reducer, 1);

store.subscribe(() => {
  console.log("store changed", store.getState());
})

store.dispatch({ type: "INC" });
store.dispatch({ type: "INC" });
store.dispatch({ type: "DEC" });
```
- dispatch実行 -> reducerで新stateが返される -> subscribeがstateの変更を検知する流れを確認できる
- 続いて、Actionを拡張してpayloadを追加し、Reducerの中でpayloadで指定した数だけインクリメントやデクリメントできるような処理に改修する
```js:
import { createStore } from "redux";

const reducer = (state = 0, action) => {
  console.log("reducer has been called.", state);
  switch (action.type) {
    case "INC":
      return state + action.payload
    case "DEC":
      return state - action.payload
  }
  return state;
}
const store = createStore(reducer, 1);

store.subscribe(() => {
  console.log("store changed", store.getState());
})

store.dispatch({ type: "INC", payload: 3 });
store.dispatch({ type: "INC", payload: 4 });
store.dispatch({ type: "DEC", payload: 3 });
```

- 上記のようにReduxの基本的な流れは以下の通りである
  - Reducerを作成する
  - Storeを作成する
  - ActionをDispatchする
  - 単一のReducerもしくは複数のReducerが単一のStoreに対して処理を行う

## 複数のReducer
- Reduxでは複数のReducerを準備して、そのReducerを統合することもできる
- `src/js/client.js`を複数のReducerで実装しなおしてみる
```js:
import { combineReducers, createStore } from "redux"

/** それぞれのReducer */
const userReducer = (state = {}, action) => {
  console.log('userReducer', action)
  switch(action.type) {
    case "CHANGE_NAME":
      state.name = action.payload
      break;
    case "CHANGE_AGE":
      state.age = action.payload
      break;
  }
  return state
}
const tweetsReducer = (state = [], action) => {
  console.log('tweetsReducer', action)
  switch (action.type) {
    case "ADD_TWEET":
      state = state.concat({ id: Date.now(), text: action.payload })
      break;
  }
  return state
}

/** Reducerを統合する */
const reducers = combineReducers({
  user: userReducer,
  tweets: tweetsReducer
})

/** Storeの作成 */
// stateデータ例：user: { name: "Tarou", age: 35 } , twiits: []
const store = createStore(reducers)

/** Subscribeの作成 */
store.subscribe(() => {
  console.log("store change", store.getState())
})

/** Dispatcher */
store.dispatch({type: "CHANGE_NAME", payload: "Tsutomu"});
store.dispatch({type: "CHANGE_AGE", payload: 35});
store.dispatch({type: "ADD_TWEET", payload: "TEST"});
store.dispatch({type: "ADD_TWEET", payload: "SAMPLE"});
```
- 上記のように、`userReducer`と`tweetsReducer`を作成
- `combineReducers`を使用して、２つのReducerを統合している
- `combineReducers`には、変更しようとしているStateデータを記述
  - 今回の場合は、Stateデータはnameとageをもつuser Objectとツイート内容を格納するtweet配列
  - userReducerとtweetsReducerによって変更される
- うまく実装できているように見えるが、上記の実装のままだと期待した動作にはならない
- １回目のuserReducerでreturnしているオブジェクトと、２回目のuserReducerでreturnしているオブジェクトが完全に同一のオブジェクトであるためである
- また、JavaScriptの非同期性の特性から、`store.subscribe`内にある`console.log`が呼ばれる時点で、userとageがすでに設定されてしまっている
- つまり、完全に同じオブジェクトを出力してしまっているのである
- 解決策としては、１回目のuserReducerと２回目のuserReducerで完全に異なるオブジェクトを返してあげるようにすればよい
- つまり、immutableなJavaScriptが必要になってくる
  - `state.name = action.payload` のところを `state = {...state, name: action.payload}`に
  - `state.age = action.payload`のところを`state = { ...state, age: action.payload }`に変更すればよい
- また、上記の２つのReducerはdispatchが行われるたびに、シーケンシャルに呼ばれていることがログから確認できる
- `tweersReducer`には処理が実装されていないが、store.dispatchが呼ばれるたびに呼ばれている

## middleware

- Reducerを呼ぶ前に処理をいくつか追加したい要望がある場合に使用する
  - 例えば、REST APIで動いているバックエンドから、Reducerで処理するためのJSONデータを取得したり、Reducerの処理に入る前後にログ出力など
- src/js/client.jsをもう一度作り直す
- middlewareを定義したい場合は、`applyMiddleware`をimportすればよい
- `applyMiddleware`関数に引数として関数を渡された関数がmiddlewareとしてReduxに認識されるようになる
```js:
import { applyMiddleware, createStore } from "redux"

/** インクリメントおよびデクリメントを行うReducer */
const reducer = (state = 0, action) => {
  console.log("reducer", action)
  switch (action.type) {
    case "INC":
      state += 1
      break;
    case "DEC":
      state -= 1
      break;
  }
  return state
}

/** logger関数 */
const logger = (store) => (next) => (action) => {
  console.log(action)
}
/** logger関数をmiddlewareとして登録 */
const middleware = applyMiddleware(logger)
/** storeの作成（およびmiddleware渡す） */
const store = createStore(reducer, 1, middleware)
/** storeの変更を検知するsubscribe */
store.subscribe(() => {
  console.log("subscribe",store.getState())
})

store.dispatch({ type: "INC" })
store.dispatch({ type: "INC" })
store.dispatch({ type: "DEC" })
```
- 今回は、dispatchされるタイミングで呼ばれる想定のlogger関数を用意し、middlewareとして登録
- `(store) => (next) => (action) => {`の補足
  ```js:
    function logger(store) {
        return function (next) { /** 無名関数 */
            return function (action) { /** 無名関数 */

            }
        }
    }
  ```
- 上記の実装のままでは、subscribeがまだ実行されずstateの中身が出力されない
  - 理由は、ソースコード上ではまだstoreを変更する処理が入っていないため
- また、dispatchされた後、これまでのサンプルではReducerが呼ばれていたはずなのに呼ばれていない
  - 理由は、middlewareを使う場合は、middlewareが呼ばれた後にreducerが呼ばれるように、処理の最後に`next(action)`を追加する必要があるため
  - next()が呼ばれた時の処理の流れ
  ```
    +--------------+               +--------------+
    | middleware01 | -- next() --> | reducer      |
    +--------------+               +--------------+
  ```
- 正式な実装は以下になる
```js:
import { applyMiddleware, createStore } from "redux"

/** インクリメントおよびデクリメントを行うReducer */
const reducer = (state = 0, action) => {
  console.log("reducer", action)
  switch (action.type) {
    case "INC":
      state += 1
      break;
    case "DEC":
      state -= 1
      break;
  }
  return state
}

/** logger関数 */
const logger = (store) => (next) => (action) => {
  console.log(action)
  // action.type = "DEC"  ※1
  next(action)
}
/** logger関数をmiddlewareとして登録 */
const middleware = applyMiddleware(logger)
/** storeの作成（およびmiddleware渡す） */
const store = createStore(reducer, 1, middleware)
/** storeの変更を検知するsubscribe */
store.subscribe(() => {
  console.log("subscribe",store.getState())
})

store.dispatch({ type: "INC" })
store.dispatch({ type: "INC" })
store.dispatch({ type: "DEC" })
```
- 無事にreducerも呼ばれるようになっていることを確認できる
- ※1のコメントについて
  - 出力結果からわかるように、dispatchが行われると`middleware->reducer`の順番で処理が進む
  - reducerで処理するActionもmiddlewareで見れるようになっている
  - そのため、※1のコメントアウトを外すと、常にデクリメントの処理が実行された時の結果になってしまう
  - このように、middleware内で実施した変更がreducerに対して副作用を持たせないように注意

## 複数のmiddleware

- applyMiddlewareでは複数のmiddlewareを登録できる
- 複数の場合は、第１引数に指定した関数を１番最初に実行した後、その中で`next()`を呼び出していれば第２引数移行の関数を順次実行する
- 最後の関数で`next()`が呼ばれると、処理はreducerに渡される

```js:
import { applyMiddleware, createStore } from "redux"

/** インクリメントおよびデクリメントを行うReducer */
const reducer = (state = 0, action) => {
  console.log("reducer", action)
  switch (action.type) {
    case "INC":
      state += 1
      break;
    case "DEC":
      state -= 1
      break;
    case "ERR":
      throw new Error("error")
  }
  return state
}

/** logger関数 */
const logger = (store) => (next) => (action) => {
  console.log("logger関数", action)
  // action.type = "DEC"
  next(action)
}
/** Error関数 */
const error = (store) => (next) => (action) => {
  console.log("error関数", action)
  try {
    next(action)
  } catch (e) {
    console.log("Error =>", e)
  }
}
/** logger関数をmiddlewareとして登録 */
const middleware = applyMiddleware(logger, error)
/** storeの作成（およびmiddleware渡す） */
const store = createStore(reducer, 1, middleware)
/** storeの変更を検知するsubscribe */
store.subscribe(() => {
  console.log("subscribe",store.getState())
})

store.dispatch({ type: "INC" })
store.dispatch({ type: "INC" })
store.dispatch({ type: "DEC" })
store.dispatch({ type: "ERR" })
```
