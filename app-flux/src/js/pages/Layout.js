import React from "react";
import { Link, withRouter } from "react-router-dom";

/** ヘッダとフッダのコンポーネント */
import Nav from "../components/Layout/Nav";
import Footer from "../components/Layout/Footer"

class Layout extends React.Component {
  render() {
    /** historyオブジェクトのlocationを取得 */
    const { location } = this.props;
    const containerStyle = {
      marginTop: "60px"
    };
    console.log('this.props.children', this.props.children)
    return (
      <div>
        {/** Navコンポーネントにlocation情報を渡す */}
        <Nav location={location} />
        <div class="container" style={containerStyle}>
          <div class="row">
            <div class="col-lg-12">
              {/** client.jsでLayoutコンポーネントでラップされた子コンポーネントを表示する */}
              {this.props.children}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }
}
export default withRouter(Layout)