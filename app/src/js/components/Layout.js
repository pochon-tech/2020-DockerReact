import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default class Layout extends React.Component {
    constructor() {
        super();
        this.title = 'Sample Layout'
        this.state = { name: '' }
    }
    render() {
        setTimeout(
            () => { this.setState({ name: 'Jack' }) }, 1000
        )
        return (
            <div>
                <Header />
                <h1>{this.title}</h1>
                <h2>Hello {this.state.name}</h2>
                <Footer />
            </div>
        );
    }
}