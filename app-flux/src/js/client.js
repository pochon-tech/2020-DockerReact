import React from "react";
import ReactDOM from "react-dom";
/** Routerを使用してページ遷移を行う想定 */
import { BrowserRouter as Router, Route } from "react-router-dom";

/** pages群のコンポーネント */
import Layout from "./pages/Layout"; // Topページ（ベース）
import Todos from "./pages/Todos"; // Todo一覧ページ（/)
import Favorites from "./pages/Favorites"; // Favoriteページ（/favorite）
import Settings from "./pages/Settings"; // Settingsページ（/Settings）

const app = document.getElementById('app');

/** ルーティング設定 */
ReactDOM.render(
  <Router>
    <Layout>
      <Route exact path="/" component={Todos}></Route>
      <Route path="/favorites" component={Favorites}></Route>
      <Route path="/settings" component={Settings}></Route>
    </Layout>
  </Router>,
  app);