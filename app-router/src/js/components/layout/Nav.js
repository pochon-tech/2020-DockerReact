import React from "react";
import { Link } from "react-router-dom";

export default class Nav extends React.Component {
  constructor() {
    super();
    this.state = {
      collapsed: true
    };
  }
  /**  Bootstrapのナビゲーションバーの再現を行うための関数
   *   (data-toggle="collapse" data-target="#bs-example-navbar-collapse-1"） */
  toggleCollapse() {
    const collapsed = !this.state.collapsed;
    this.setState({collapsed});
  }
  render() {
    const { location } = this.props; // Layoutコンポーネントから渡ってくるlocation情報
    const { collapsed } = this.state; // 
    const featuredClass = location.pathname === "/" ? "active" : ""; // アクセスパスが/の時は、featuredクラスをアクティブ状態
    const archivesClass = location.pathname.match(/^\/archives/) ? "active" : ""; // アクセスパスが/archivesの時は、archivesクラスをアクティブ状態
    const settingsClass = location.pathname.match(/^\/settings/) ? "active" : ""; // アクセスパスが/settingsの時は、settingsクラスをアクティブ状態
    const navClass = collapsed ? "collapse" : "";
    return (
      <nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
        <div class="container">
          <div class="navbar-header">
            {/** onClick = data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" */}
            <button type="button" class="navbar-toggle" onClick={this.toggleCollapse.bind(this)}>
              <span class="sr-only">Toggle navigation</span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
            </button>
          </div>
          <div class={"navbar-collapse " + navClass} id="bs-example-navbar-collapse-1">
            <ul class="nav navbar-nav">
              {/** アクセスパスによってactive状態のliが変化する */}
              <li class={featuredClass}>
                {/** onClick = icon-barとの対応付 */}
                <Link to="/" onClick={this.toggleCollapse.bind(this)}>Featured</Link>
              </li>
              <li class={archivesClass}>
                <Link to="/archives/news?date=today&filter=none" onClick={this.toggleCollapse.bind(this)}>Archives</Link>
              </li>
              <li class={settingsClass}>
                <Link to="/settings" onClick={this.toggleCollapse.bind(this)}>Settings</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}