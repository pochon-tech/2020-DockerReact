import React from "react";

export default class Footer extends React.Component {
  render() {
    const footerStyles = {
      marginTop: "30px"
    };
    return (
      <footer style={footerStyles}>
        <div class="row">
          <div class="row">
            <p>Copyright &copy; Sample.com</p>
          </div>
        </div>
      </footer>
    );
  }
}