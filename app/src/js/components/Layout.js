import React from "react";

export default class Layout extends React.Component {
    constructor() {
        super();
        this.title = 'Sample Layout'
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