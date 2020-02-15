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
