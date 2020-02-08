import React from "react";

/** 各ページから呼び出される記事のテンプレート */
export default class Article extends React.Component {
  render() {
    const { title } = this.props;

    return (
      
      <div class="col-md-12">
        <h4>{title}</h4>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe rem nisi accusamus error velit animi non ipsa placeat. Recusandae, suscipit, soluta quibusdam accusamus a veniam quaerat eveniet eligendi dolor consectetur.</p>
        <a class="btn btn-default" href="#">More Info</a>
      </div>
    );
  }
}