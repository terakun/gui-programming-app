import React from 'react';
import OpComponent from './opcomponent'

export default class End extends OpComponent {
    constructor(props) {
        super(props);
        this.state = {
        };

        this.boxstyle.right = 10;
        this.boxstyle.bottom = 50;
        this.boxstyle.position = "absolute";

        this.topstyle = {
            width: 100,
            height: 10,
            border: "solid",
            color: "#000",
            background: "#239",
            position: "absolute",
            top: -1,
        };

        this.textstyle = {
            textAlign: "center",
            position: "absolute",
            top: "35%",
        };

    }

    getBottomPosition() {
        return [0,0];
    }


    renderOpComp() {
        if (this.props.running) {
            this.boxstyle.background = "#0f0";
        } else {
            this.boxstyle.background = "#fff";
        }

        return (
            <div style={this.boxstyle} className="box">
                <strong className="no-cursor">
                    <div ref='top' style={this.topstyle} onMouseUp={() => {
                        this.setCompTo(this);
                    }}></div>
                </strong>
                <div style={this.textstyle}>
                    エンド
                </div>
            </div>
        );
    }
}