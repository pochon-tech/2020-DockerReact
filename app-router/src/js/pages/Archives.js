import React from "react";

export default class Archives extends React.Component {
  render() {
    // withRouterで囲まれたコンポーネント(Layout)のpropsに渡されるlocationを引数にURLSearchParamsオブジェクトを作成する
    const query = new URLSearchParams(this.props.location.search)
    let message
      = (this.props.match.params.article
        ? 'URLパラメータ：' + this.props.match.params.article + ", "
        : "")
      + "クエリストリング： date=" + query.get("date") + ", filter=" + query.get("filter");
    return (
      <div>
        <h1>Archives</h1>
        <div> {message}</div>
      </div>
    );
  }
}