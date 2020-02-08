import React from "react";

export default class Settings extends React.Component {
  render() {
    return (
      <h1>Settings ({ this.props.match.params.mode }) </h1>
    );
  }
}