import React, {Component} from "react";
import OpComponent from './opcomponent'
import ReactDOM from 'react-dom'
import Panel from 'muicss/lib/react/panel';

export default class Readability extends OpComponent {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
        };
        // override style
        this.boxstyle = {
            ...this.boxstyle,
            width: 20,
            height: 60,
            padding: 0
        };

        this.topstyle = {
            marginLeft: "auto",
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#f2df6b",
            border: "none",
            backgroundColor: "#f2df6b",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            margin: "auto",
        };
        this.bottomstyle = {
            marginLeft: "auto",
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#e174bb",
            border: "none",
            backgroundColor: "#e174bb",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            margin: "auto",
        };
        this.props.funcs.setOpComponentAttribute(this.number, null);
    }

    renderOpComp() {
        if (this.props.running) {
            this.boxstyle.background = "#00f";
        } else {
            this.boxstyle.background = "#fff";
        }
        return (
            <Panel style={this.boxstyle} className="box">
                <strong className="no-cursor">
                    <div ref='bottom' style={this.bottomstyle} onMouseDown={() => {
                        this.setCompFrom(this);
                    }}></div>
                    <div ref='top' style={this.topstyle} onMouseUp={() => {
                        this.setCompTo(this);
                    }}></div>
                </strong>
            </Panel>
        );
    }
}