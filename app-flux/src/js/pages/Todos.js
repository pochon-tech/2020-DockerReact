import React from "react";

import Todo from "../components/Todo.js";

/** TodoListのページ */
class Todos extends React.Component {
  constructor() {
    super();
    /** TodoList */
    this.state = {
      todos: [
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
    };
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