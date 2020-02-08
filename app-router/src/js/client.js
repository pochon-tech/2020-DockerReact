import React from "react";
import ReactDOM from "react-dom";
// react-routerの読み込み
import { BrowserRouter as Router, Route } from "react-router-dom";

import Layout from "./pages/Layout";
// 各ヘッダコンポーネントの読み込み
import Featured from "./pages/Featured";
import Archives from "./pages/Archives";
import Settings from "./pages/Settings";

const app = document.getElementById('app');

// ReactDOM.render(<Layout />, app);
// <Router>コンポーネントで囲む
ReactDOM.render(
  <Router>
    <Layout>
      <Route exact path="/" component={Featured}></Route>
      <Route exact path="/archives" component={Archives}></Route>
      <Route path="/archives/:article" component={Archives}></Route>
      <Route path="/settings/:mode(nomal|hard)" component={Settings}></Route>
    </Layout>
  </Router>,
app);