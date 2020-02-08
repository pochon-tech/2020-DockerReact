import React from "react";
import { Link, withRouter } from "react-router-dom" // withRouterを追加

// withRouterでLayputClassを囲む必要があるのでexport defaultを消す
class Layout extends React.Component {
  /** / に遷移する関数 */
  navigate() {
    console.log(this.props.history);
    this.props.history.push("/");
  }
  render() {
    return (
      <div>
        <h1>Sample</h1>
         {this.props.children}
         <Link to="/archives/some-other-articles?date=yesterday&filter=none" class="btn btn-warning">archives (some-other-articles)</Link>
  <Link to="/archives?date=today&filter=hot" class="btn btn-danger">archives</Link>         <Link to="/settings/nomal"><button class="btn btn-success">settings (Nomal)</button></Link>
         <Link to="/settings/hard"><button class="btn btn-success">settings (Hard)</button></Link>
         <button class="btn btn-info" onClick={this.navigate.bind(this)}>featured</button>
      </div>
    );
  }
}
// withRouterでLayputClassを囲む
export default withRouter(Layout);

