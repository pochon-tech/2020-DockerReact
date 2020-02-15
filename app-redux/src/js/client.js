import { applyMiddleware, createStore } from "redux"
import axios from "axios"
/** state監視のLogger */
import { createLogger } from "redux-logger"
/** Actionオブジェクトの代わりに関数を呼べるようにする */
import thunk from "redux-thunk"

const initState = {
  fetching: false,
  fetched: false,
  users: [],
  error: null
}

const reducer = (state = initState, action) => {
  switch (action.type) {
    case "START":
      return { ...state, fetching: true }
    case "ERROR":
      return { ...state, fetching: false, error: action.payload }
    case "RECEIVE":
      return { ...state, fetching: false, fetched: true, users:action.payload }
  }
  return state
}

const middleware = applyMiddleware(thunk, createLogger())
const store = createStore(reducer, middleware)

store.dispatch((dispatch)=>{
  dispatch({ type: "START" })
  // async処理
  axios.get("http://localhost:18080").then((res)=>{
    dispatch({type: "RECEIVE", payload: res.data })
  }).catch((e)=>{
    dispatch({type: "ERROR", payload: e })
  })
})