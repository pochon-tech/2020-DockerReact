import React from "react"
import ReactDOM from "react-dom"

/** ページ(<div id="app"></div>内)全体のレイアウト */
import Layout from "./components/Layout"

/** SPAを埋め込む場所 */
const app = document.getElementById('app')

/** Layoutコンポーネントをレンダリングする */
ReactDOM.render(<Layout />, app)