### FluxによるReact開発

- dockerコンテナ起動
```zsh:
apple@appurunoMacBook-Pro project % docker-compose up -d
```

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



