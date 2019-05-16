import React from 'react';
import OpComponent from './opcomponent';

export default class Stop extends OpComponent {
    constructor(props) {
        super(props);
        this.state = {};

        this.topstyle = {
            ...this.topstyle,
            width: 100,
            height: 10,
            border: "solid",
        };

        this.textstyle = {
            position: "absolute",
            top: "25%",
        };

        this.bottomstyle = {
            ...this.bottomstyle,
            width: 100,
            height: 10,
            border: "solid",
        };
    }

    renderOpComp() {
        return (
            <div style={this.boxstyle} className="box">
                <strong className="no-cursor">
                    <div ref='top' style={this.topstyle} onMouseUp={() => {
                        this.setCompTo(this);
                    }}></div>
                </strong>
                <div style={this.textstyle}>
                    ストップ
                </div>
                <strong className="no-cursor">
                    <div ref='bottom' style={this.bottomstyle} onMouseDown={() => {
                        this.setCompFrom(this);
                    }}></div>
                </strong>
            </div>
        );
    }
}


