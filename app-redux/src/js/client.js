import { applyMiddleware, createStore } from "redux"
import axios from "axios"
import { createLogger } from "redux-logger"
import { createPromise } from "redux-promise-middleware"

const initState = {
  fetching: false,
  fetched: false,
  users: [],
  error: null
}

const reducer = (state = initState, action) => {
  switch (action.type) {
    case "FETCH_PENDING":
      return { ...state, fetching: true }
    case "FETCH_REJECTED":
      return { ...state, fetching: false, error: action.payload }
    case "FETCH_FULFILLED":
      return { ...state, fetching: false, fetched: true, users:action.payload }
  }
  return state
}

const promise = createPromise({ type: { fulfilled: 'success' } })
const middleware = applyMiddleware(promise, createLogger())
const store = createStore(reducer, middleware)

store.dispatch({
  type:"FETCH",
  payload: axios.get("http://localhost:18080")
})