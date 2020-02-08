import React from "react";
import Article from "../components/Article";

/** アーカイブページ */
export default class Archives extends React.Component {
  render() {
    /** クエリストリングを取得するためのURLSearchParamsオブジェクトを作成する */
    const query = new URLSearchParams(this.props.location.search)
    /** URLパラメータを取得する */
    const { article } = this.props.match.params;
    const date = query.get("date");
    const filter = query.get("filter");

    /** 記事テンプレートにタイトルを渡して記事コンポーネントを作成する */
    const Articles = [
      "Some Article",
      "Some Other Article",
      "Yet Another Article",
      "Still More",
      "Fake Article",
      "Partial Article",
      "American Article",
      "Mexican Article"
    ].map((title, i) => <Article key={i} title={title} />);

    return (
      <div>
        <h1>Archives</h1>
        article: {article}, date: {date}, filter: {filter}
        <div class="row">{Articles}</div>
      </div>
    );
  }
}