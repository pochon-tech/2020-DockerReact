import React from "react";
import { withRouter } from "react-router-dom";

import Footer from "../components/layout/Footer";
import Nav from "../components/layout/Nav";

class Layout extends React.Component {
  render() {
    const { location } = this.props;
    const containerStyle = {
      marginTop: "60px"
    };
    return (
      <div>
        <Nav location={location} />
        {/** 中央に記事を出力するようにcontainerStyleを指定する */}
        <div class="container" style={containerStyle}>
          <div class="row">
            <div class="col-lg-12">
              <h1>Sample</h1>
              {/** client.jsでLayoutコンポーネントでwrapしている子コンポーエントを表示する */}
              {this.props.children}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }
}
export default withRouter(Layout);