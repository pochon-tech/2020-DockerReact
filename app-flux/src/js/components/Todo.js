import React from 'react';

export default class Todo extends React.Component {
  constructor(props) {
    /** propsなしのsuper()呼び出しでも、render()や他のメソッド内でthis.propsにアクセスできる */
    super();
  }
  render() {
    const { edit, text, complete } = this.props;
    /** デザイン的にiconを定義してみる */
    const icon = complete ? "\u2714" : "\u2716";
    console.log("Todo.js(Component)");

    if (edit) {
      return (<li><input value={text} focus="focused" /></li>)
    }
    return (
      <li>
        <span>{text}</span>
        <span>{icon}</span>
      </li>
    );
  }
}