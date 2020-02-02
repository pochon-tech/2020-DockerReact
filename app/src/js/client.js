import React from "react";
import ReactDOM from "react-dom";

class Layout extends React.Component {
  constructor() {
    super();
    this.title = 'Sample App'
  }
  render() {
    return (
      <div>
        <h1>{this.title}</h1>
        <h2>It's: {((num) => { return num + 1 })(3)}</h2>
      </div>
    );
  }
}

const app = document.getElementById('app');
ReactDOM.render(<Layout />, app);