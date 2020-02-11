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