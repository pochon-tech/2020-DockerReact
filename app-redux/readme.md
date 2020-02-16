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

## 非同期アプリケーション

- middlewareには非同期処理を入れることができる
- src/js/client.jsを新規に作り直す
- 練習として、`redux-logger`というDispatchされたActionをconsole上に出力するMiddlewareを使用する
```sh:
  /app # npm install --save-dev redux-logger
```
```js:
import { applyMiddleware, createStore } from "redux"
import { createLogger } from "redux-logger"

const reducer = (state={}, action) => {
  return state
}

const middleware = applyMiddleware(createLogger())
const store = createStore(reducer, middleware)

store.dispatch({ type: "FOO" })
```
- Consoleを確認してみると、Actionが起動したときに変更前のstateと変更後のstateを確認することができる

- 続いて、dispatcherを改修する
- 今までのdispatcherは、データをdispatchしていたが、今回は関数をdispatchする
- 関数のdispatchにより、先の処理で非同期処理が組み込まれた関数が実行されるような作りにする
```js:
import { applyMiddleware, createStore } from "redux"
import { createLogger } from "redux-logger"

const reducer = (state={}, action) => {
  return state
}

const middleware = applyMiddleware(createLogger())
const store = createStore(reducer, middleware)

store.dispatch((dispatch)=>{
  dispatch({ type: "START" })
  // async処理
  dispatch({ type: "END" })
})
```
- しかし、このままでは下記のようなエラーが発生する
  - `Actions must be plain objects. Use custom middleware for async actions.`
  - dispatcherは単純なObjectsが渡されてることを期待しているエラーである
  - 前回のFluxのおさらいで述べたようにActionはtypeプロパティを持つオブジェクトが期待されているからである
  - この問題を解消するために、`redux-thunk`を使用する
- `redux-thunk`とは、ReduxのMiddlewareの一つで、Actionオブジェクトの代わりに関数を返す処理を呼び出すことができるようにするためのMiddlewareである
- thunkは、storeのdispatchメソッドを受け取り、Actionオブジェクトの代わりに渡された非同期関数処理が官僚した後に、通常の同期処理アクションをディスパッチするために利用される
```sh:
/app # npm install --save-prod redux-thunk
```
```js:
import { applyMiddleware, createStore } from "redux"
/** state監視のLogger */
import { createLogger } from "redux-logger"
/** Actionオブジェクトの代わりに関数を呼べるようにする */
import thunk from "redux-thunk"

const reducer = (state={}, action) => {
  return state
}

const middleware = applyMiddleware(thunk, createLogger())
const store = createStore(reducer, middleware)

store.dispatch((dispatch)=>{
  dispatch({ type: "START" })
  // async処理
  dispatch({ type: "END" })
})
```
- エラー解消されたことを確認できる

## 非同期処理を実装してみる

- 動作確認用のダミーサーバを起動して非同期処理の実装を行う
- 別ターミナルを立ち上げてダミーサーバーを構築する
- ダミーサーバー用のソースコードは以下
```js:
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
  setTimeout(() => res.end('{age: 30, id: 0, name: "foo", age: 25, id: 1, name: "bar"}'), 1000);
}).listen(18080);
```
- client.jsを下記のように修正する
```js:
import { applyMiddleware, createStore } from "redux"
import axios from "axios"
/** state監視のLogger */
import { createLogger } from "redux-logger"
/** Actionオブジェクトの代わりに関数を呼べるようにする */
import thunk from "redux-thunk"

const initState = {
  fetching: false,
  fetched: false,
  users: [],
  error: null
}

const reducer = (state = initState, action) => {
  switch (action.type) {
    case "START":
      return { ...state, fetching: true }
    case "ERROR":
      return { ...state, fetching: false, error: action.payload }
    case "RECEIVE":
      return { ...state, fetching: false, fetched: true, users:action.payload }
  }
  return state
}

const middleware = applyMiddleware(thunk, createLogger())
const store = createStore(reducer, middleware)

store.dispatch((dispatch)=>{
  dispatch({ type: "START" })
  // async処理
  axios.get("http://localhost:18080").then((res)=>{
    dispatch({type: "RECEIVE", payload: res.data })
  }).catch((e)=>{
    dispatch({type: "ERROR", payload: e })
  })
})
```
- HTTP Clientとして`axios`を使用している
- stateの初期値の定義を追加している
- Reducerに各Actionタイプごとにstateを書き換える処理を追加している
  - 実際のアプリケーション開発では時間のかかる非同期処理に対し"START"(処理中)と"RECEIVE"(処理完了)の２つのActionを用いることで、処理完了までのプログレスバーを表示させるような事も実現できる

**Tips DockerのEXPOSEについて**

- 別ターミナルを起動し、ダミーサーバーを以下のように立ち上げる
```sh:
apple@appurunoMacBook-Pro 2020-02-DockerReact % docker-compose exec app-redux sh
/app # node
> var http = require('http');
undefined
> http.createServer(function (req, res) {
...   res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
...   setTimeout(() => res.end('{age: 30, id: 0, name: "foo", age: 25, id: 1, name: "bar"}'), 1000);
... }).listen(18080);
```
- さらに別ターミナルを起動して、ダミーサーバーが起動しているかcurlで確認してみる
```sh:
apple@appurunoMacBook-Pro 2020-02-DockerReact % docker-compose exec app-redux sh
/app # curl localhost:18080
{age: 30, id: 0, name: "foo", age: 25, id: 1, name: "bar"}
```
- では、ブラウザから確認してみたときはどうか？
```
GET http://localhost:18080/ net::ERR_CONNECTION_REFUSED
```
- 接続エラーが起きてしまっている
- この接続エラーは、外部（ホスト側ブラウザ）からのアクセスを許可しておく必要があるためである
- 下記のようにdocker-compose.ymlを修正して立ち上げ直すことで解決する
```yaml:docker-compose.yml
  app-redux:
    build: ./
    logging: *default-logging
    volumes:
      - ./app-redux/:/app/
    command: sh
    tty: true
    ports: 
      - "8001:8001"
      - "18080:18080"
```
- portsには、ホスト・ゲスト間で通信が必要な場合はポートを指定する

**DockerfileのEXPOSE命令は必要はない？**
- 結論からいうと、どのポートに接続するのかを明示しておけば、このイメージでは何番ポートが実行されているか利用者に分かりやすい点で考えるなら記述しても良いが別にいらない
- DockerfileのEXPOSE命令は実際に何かのポートを開けているわけではない
- Docker Documentation のEXPORTの項目に下記のような記載がある
> The EXPOSE instruction does not actually publish the port. 
> It functions as a type of documentation between the person who builds the image and the person who runs the container, 
> about which ports are intended to be published. To actually publish the port when running the container,
> use the -p flag on docker run to publish and map one or more ports, or the -P flag to publish all exposed ports and map them to high-order ports.
- つまり、EXPOSE命令は文書（docker inspectで確認できる）であり実際には開放していない (記述しなくてもポートは公開できる)
- また、実際の開放（ホストとのマッピング）は、docker-compose.ymlのportsで行っている
- 下記の理由からEXPOSEは省略してしまってよいと考える
  - 環境の利用者が限られる
  - この環境はdocker-compose.ymlによる環境で構築されているのでコンテナ間のリンクもサービス名指定で問題ない
  - Dockerfileを単独で使用することはない

## redux-promiseを使う

- ReduxでActionを処理に非同期処理、ajaxを使おうとすると書き方が複雑になってしまう
- `redux-promise`というミドルウェアを使うときれいに書くことができる
```sh:
/app # npm install --save-dev redux-promise-middleware
```
- **注意点:ver6から書き方が変更になっている**
- 以前の書き方
```js:
import { applyMiddleware, createStore } from "redux"
import axios from "axios"
import { createLogger } from "redux-logger"
import promise from "redux-promise-middleware"

const initState = {
  fetching: false,
  fetched: false,
  users: [],
  error: null
}

const reducer = (state = initState, action) => {
  switch (action.type) {
    case "FETCH_PENDING":
      return { ...state, fetching: true }
    case "FETCH_REJECTED":
      return { ...state, fetching: false, error: action.payload }
    case "FETCH_FULFILLED":
      return { ...state, fetching: false, fetched: true, users:action.payload }
  }
  return state
}

const middleware = applyMiddleware(promise(), createLogger())
const store = createStore(reducer, middleware)

store.dispatch({
  type:"FETCH",
  payload: axios.get("http://localhost:18080")
})
```
- 以前の書き方では、`store.dispatch`で指定したActionTypeをPrefixにして下記のようなsuffixを追加してActionTypeを発行
  - *_PENDING(非同期処理未完了状態)
  - *_ERROR(非同期処理エラー)
  - *_FULFILLED(非同期処理正常終了)
- Ver6以降は下記のような書き方に統一された
```js:
import { applyMiddleware, createStore } from "redux"
import axios from "axios"
import { createLogger } from "redux-logger"
import { createPromise } from "redux-promise-middleware"

const initState = {
  fetching: false,
  fetched: false,
  users: [],
  error: null
}

const reducer = (state = initState, action) => {
  switch (action.type) {
    case "FETCH_PENDING":
      return { ...state, fetching: true }
    case "FETCH_REJECTED":
      return { ...state, fetching: false, error: action.payload }
    case "FETCH_FULFILLED":
      return { ...state, fetching: false, fetched: true, users:action.payload }
  }
  return state
}

const promise = createPromise({ type: { fulfilled: 'success' } })
const middleware = applyMiddleware(promise, createLogger())
const store = createStore(reducer, middleware)

store.dispatch({
  type:"FETCH",
  payload: axios.get("http://localhost:18080")
})
```