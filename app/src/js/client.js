import React from "react";
import ReactDOM from "react-dom";

class Layout extends React.Component {
  render() {
    return (
      <div>
        <h1>Sample</h1>
        <h2>It's: {((num) => { return num + 1 })(3)}</h2>
      </div>
    );
  }
}

const app = document.getElementById('app');
ReactDOM.render(<Layout />, app);