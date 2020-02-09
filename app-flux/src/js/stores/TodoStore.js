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
/** debug用 */
window.todoStore = todoStore;
export default todoStore;