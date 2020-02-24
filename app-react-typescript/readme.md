### React+Redux+TypeScript

## ReactアプリをTypeScriptで作る

- `create-react-app`を使用してReactアプリをTypeScriptで構築してみる

## プロジェクト作成
- `--typescript`オプションでTypeScript版のReactアプリが作成できる
```sh:
apple@appurunoMacBook-Pro 2020-02-DockerReact % docker-compose exec app-react-typescript sh
/app # npx create-react-app react-app --typescript
```

## Reduxの導入
- `redux`,`react-redux`をプロジェクトにインストールする
- Reduxの型定義ファイル`@types/react-redux`も忘れずにインストール
```sh:
/app # cd react-app
/app/react-app # npm install --save typescript redux react-redux
/app/react-app # npm install -D @types/react-redux
```

## typescript-fsaの導入

- `typescript-fsa`とはFSAにTypeScriptで型をつけることで、Action作成関数とReducerの実装を型安全に行えるようにするライブラリ
<details>
<summary>typescript-fsaについて</summary>

- ActionのDispatch時の引数とReducerでのpayloadの型をつけられるので強力
- reduxにおいてActionは概念として重要なものだがその実態はtypeプロパティを持つobjectでしかないので、TypeScriptにおいてどの様にActionを定義するべきか指針となる情報がない
```ts:
export type Action =
{
    type: 'INIT';
    payload: undefined;
} |
{
    type: 'FETCH_MAIN_FEEDS';
    payload: undefined;
} |
```
- この書き方は[F8App](https://github.com/fbsamples/f8app/blob/master/js/actions/types.js)に準拠しており、reducerを書く時に有効
- でもこの書き方だとactionCreatorを作るのがしんどくなる
- 上記の書き方だと変更があった場合にactionCreatorとActionの両方の修正が必要となり冗長
- そこで、`typescript-fsa`を使うことで下記のように完結に描けるようになる
```ts:
import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory();

export const init = actionCreator('INIT');
export const fetchMainFeeds = actionCreator('FETCH_MAIN_FEEDS');
```
</details>

```sh:
/app/react-app # npm install --save typescript-fsa typescript-fsa-reducers
```

## Actionの実装

- `src/actions`でディレクトリを切ってActionを定義する
```ts:
import actionCreatorFactory from "typescript-fsa"

const actionCreator = actionCreatorFactory()

export const hogeActions = {
  updateName: actionCreator<string>('ACTIONS_UPDATE_NAME'),
  updateEmail: actionCreator<string>('ACTIONS_UPDATE_EMAIL'),
}
```

## Reducerの実装

- `src/states`でディレクトリを切ってReducerを定義する
```ts:
import { reducerWithInitialState } from "typescript-fsa-reducers"
import { hogeActions } from "../actions/hogeActions"

export interface HogeState {
  name: string
  email: string
}

const initialState: HogeState = {
  name: '',
  email: ''
}

export const hogeReducer = reducerWithInitialState(initialState)
  .case(hogeActions.updateName, (state, name) => {
    return Object.assign({}, state, { name })
  })
  .case(hogeActions.updateEmail, (state, email) => {
    return Object.assign({}, state, { email })
  })
```

## Storeの実装

- `src直下`にStoreを定義する
```ts:
import { createStore, combineReducers } from 'redux'
import { hogeReducer, HogeState } from './states/hogeState'

export type AppState = {
  hoge: HogeState
}

const store = createStore(
  combineReducers<AppState>({
    hoge: hogeReducer
  })
)

export default store
```

## コンポーネントの実装について

- Presentational/Containerコンポーネントのパターンで実装
- PresentatonalとContainerは責務の観点から粗結合性を担保するためにビューをふたつのレイヤに分けるもの
- Presentational: 
  - 役割: 「見た目」を実装
  - 状態: 持たない
  - Reduxへの依存: なし
- Container:
  - 役割: 「振る舞い」を実装
  - 状態: 持つ
  - Reduxへの依存: ある
- ContainerでReduxとの依存（ステートの状態やアクションの実行）などをラップ
- ComponentはContainerによってラップされた振る舞いのみを知るだけでよい

## Conatinerの実装

- `src/containers`でディレクトリを切って実装
```ts:
import { Action } from "typescript-fsa"
import { Dispatch } from "redux"
import { connect } from "react-redux"

import { AppState } from "../store"

import { hogeActions } from "../actions/hogeActions"

import { HogeComponent } from "../components/hogeComponent"

export interface HogeActions {
  updateName: (v: string) => Action<string>
  updateEmail: (v: string) => Action<string>
}

function mapDispatchToProps(dispatch: Dispatch<Action<string>>) {
  return {
    updateName: (v: string) => dispatch(hogeActions.updateName(v)),
    updateEmail: (v: string) => dispatch(hogeActions.updateEmail(v))
  }
}

function mapStateToProps(appState: AppState) {
  return Object.assign({}, appState.hoge)
}

export default connect(mapStateToProps, mapDispatchToProps)(HogeComponent)
```

<details>
<summary>mapDispatchToPropsとmapStateToPropsの概念</summary>

- `mapStateToProps`と`mapDispatchToProps`はどちらも、**Propsとして使うことができるようにする**という概念
  - mapStateToProps: 「State」を「ToProps」 -> State情報をPropsとして扱うことができる
  - mapDispatchToProps: 「Dispatch（Action関数）」を「ToProps」 -> Action関数をPropsとして扱うことができる
- ※ 直接コンポーネントのなかでdispatchを呼んでいるのと同じなので、mapDispatchToPropsの中でbindActionCreatorsを使うのはよくない（= Containerレイヤを置く意味がない）

**おさらい**
### まずReduxとは
- アプリケーションの状態(State)管理を容易にするためのフレームワーク
- 単一方向の状態管理を実装するためのStoreという層を提供しているのが特徴
- Stateの更新はReducerが行うが、Reducerが働いてもらうにはActionをStoreにDispatchし、StateはStoreからgetState()で取得する
```
                     +--------------------- Redux Store ---------------------------+ 
  +----------------+ |   2  +----------------+    +-----------------------------+  |
  | Action Creator | |   →  |    Dispatch    |  → |    Dispatch (Middleware)    |  |
  +----------------+ |      +----------------+    +-----------------------------+  |
          ↑ 1        |                                          ↓                  |
  +----------------+ |   4  +----------------+  3 +-----------------------------+  |  
  |      View      | |   ←  |    State       |  ← |          Reducer            |  |
  +----------------+ |      +----------------+    +-----------------------------+  |
                     +-------------------------------------------------------------+ 
```
- 1.View(画面)のInputをもとに、ActionCreatorを使ってactionを生成
  - ActionCreatorの例
  ```js:
  function addTodo(text) {
    return { type: 'ADD_TODO', text }
  }
  ```
- 2.Storeに対してactionをDispatch
- 3.ReducerがDispatchに反応して、actionをもとにStateを更新
- 4.ViewはStoreからStateを参照する（getStateと言う取得関数がある）

### ReactとReduxを繋ぐのがContainer
- ReactとReduxを繋ぐComponentをContainerComponentと呼ぶ
- 上図の「View」を「Container（ReactComponent）」に置き換えたもの
  - 1の部分で`this.props.anyAction()`のように、actionを発行できるようになる
  - 4の部分で`this.props.anyState`のように、Stateを参照できるようになる
  - これをコードにすると
  ```js:
    import React from 'react'
    import { connect } from 'react-redux'
    import { addTodo } from '../actions'

    class MyContainer extends React.Component {
      // 省略
    }

    const mapStateToProps = (state, ownProps) => {
      return {
        todos: state.todos
      }
    }

    const mapDispatchToProps = { // あえて関数ではなくオブジェクトにしてる
        addTodo
    }

    export default connect(
      mapStateToProps,
      mapDispatchToProps
    )(MyContainer)
  ```
### mapStateToPropsとmapDispatchToProps

- `connect(mapStateToProps, mapDispatchToProps)`はReduxのStoreをReactComponentの世界に持ち込んでくれる
- mapStateToPropsは、Store.getState()のような役割でComponentのpropsにStateの中身を詰め込む
- mapDispatchToPropsは、ActionCreatorをラップした、actionをStoreにDispatchしてくれる関数をComponentのpropsに詰め込む

</details>


## Componentの実装

- Presentationalなコンポーネントには状態を与えるのはよくない
- ロジックはContainer側で定義すべき
- `src/components`でディレクトリを切って実装
- ここは原則として状態を持たない場所なので、React.SFCを使うのが適切
```tsx:
import * as React from 'react'
import { HogeState } from '../states/hogeState'
import { HogeActions } from '../containers/hogeContainer'

interface OwnProps {}

type HogeProps = OwnProps & HogeState & HogeActions

export const HogeComponent: React.SFC<HogeProps> = (props: HogeProps) => {
  return (
    <div>
      <div className="field">
        <input
          type="text"
          placeholder="name"
          value={props.name}
          onChange={(e) => props.updateName(e.target.value)}
        />
      </div>
      <div className="field">
        <input
          type="email"
          placeholder="email"
          value={props.email}
          onChange={(e) => props.updateEmail(e.target.value)}
        />
      </div>
    </div>
  )
}
```

## app.tsxへの追加

- src以下にApp.tsxというファイルがあるので、そこでHogeComponentを表示させるようにする
```tsx:
import * as React from 'react'
import HogeContainer from '../src/containers/hogeContainer'

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <HogeContainer />
      </div>
    )
  }
}

export default App
```

## index.tsxの更新
- 実際にReactのrootコンポーネントをマウントしているところである、index.tsxでstoreを使うように書き換える
```tsx:
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import Store from './store'
import App from './App'
import './index.css'

ReactDOM.render(
  <Provider store={Store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement
)
```

## tsconfig.jsonの編集
```json:
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react",
    "noImplicitAny": false // 標準のものにこの行を追加した
  },
  "include": [
    "src"
  ]
}
```

## 開発Portの変更とホットリロードの適用
- .envファイルをプロジェクト直下に配置する
```.env
PORT=8001
CHOKIDAR_USEPOLLING=true
```

## 起動
```sh:
npm start
```