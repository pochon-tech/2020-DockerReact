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