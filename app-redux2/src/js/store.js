import { createStore, applyMiddleware } from "redux"

/** logを記録するReduxミドルウェア */
import { createLogger } from "redux-logger"
/** Actionsをプレーンなオブジェクトではなく関数を与えられるようにする */
import thunk from "redux-thunk"
/** Promiseの処理をきれいに描けるようにする */
import { createPromise } from 'redux-promise-middleware'
const promise = createPromise({ type: { fulfilled:'success' }})

/** Reducerおさらい: Actionをを引数として受取り、stateをどう更新するかを定義 */
import reducer from "./reducers"

/** applyMiddlewareは可変長引数を受け取れるのでいくつでもMiddlewareを引数に取れる */
const middleware = applyMiddleware(promise, thunk, createLogger())

/** StoreにReducerとMiddlewareを登録する */
export default createStore(reducer, middleware)