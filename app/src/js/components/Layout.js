import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default class Layout extends React.Component {
    constructor() {
        super();
        this.title = 'Sample Layout'
    }
    render() {
        return (
            <div>
                <Header />
                <h1>{this.title}</h1>
                <h2>It's: {((num) => { return num + 1 })(3)}</h2>
                <Footer />
            </div>
        );
    }
}