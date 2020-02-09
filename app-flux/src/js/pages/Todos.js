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