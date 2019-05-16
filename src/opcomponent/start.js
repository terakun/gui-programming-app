import React from 'react';
import OpComponent from './opcomponent'

export default class Start extends OpComponent {
    constructor(props) {
        super(props);
        this.state = {};
        this.boxstyle.left = 10;
        this.boxstyle.top = 40;
        this.bottomstyle = {
            ...this.bottomstyle,
            width: 100,
            height: 10,
        }
    }

    getTopPosition() {
        return [0,0];
    }

    render() {
        let textstyle = {
            textAlign: "center",
            position: "absolute",
            top: "35%",
        };

        return (
            <div style={this.boxstyle} className="box">
                <div style={textstyle}>
                    スタート
                </div>
                <strong className="no-cursor">
                    <div  ref='bottom' style={this.bottomstyle} onMouseDown={() => {
                        this.setCompFrom(this);
                    }}></div>
                </strong>
            </div>
        );
    }
}