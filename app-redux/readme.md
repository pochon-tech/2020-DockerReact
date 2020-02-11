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
