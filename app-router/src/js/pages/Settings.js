import React from "react";

export default class Settings extends React.Component {
  render() {
    // VeryHard はこのコンポーネントが呼ばれることはない
    console.log(this.props)
    const type = (this.props.match.params.mode == "hard"? " (for hard)": "");
    return (
      <h1>Settings { type } </h1>
    );
  }
}