import dispatcher from "../dispatcher"

export function createTodo(text) {
  dispatcher.dispatch({
    type: "CREATE_TODO",
    text
  })
}

export function reloadTodos() {
  dispatcher.dispatch({
    type: "FETCH_TODO"
  })
  // 本来なら
  // axios("https://xxx").then((data)=> {
  //   console.log("got the data!", data);
  // })
  setTimeout(()=>{
    dispatcher.dispatch({
      type: "RECEIVE_TODOS",
      todos: [
        {
          id: 1000,
          text: "Go Shop Again",
          complete: false
        },
        {
          id: 2000,
          text: "Sleep",
          complete: false
        }
      ]
    })
  },1000)
}

export function deleteTodo(id) {
  dispatcher.dispatch({
    type: "DELETE_TODO",
    id
  })
}