import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"

/** ページ(<div id="app"></div>内)全体のレイアウト */
import Layout from "./components/Layout"
import store from "./store"

/** SPAを埋め込む場所 */
const app = document.getElementById('app')

/** Layoutコンポーネントをレンダリングする */
// ReactDOM.render(<Layout />, app)
ReactDOM.render(
  <Provider store={ store }>
    <Layout />
  </Provider>, app)