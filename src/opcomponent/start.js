import React from 'react';
import OpComponent from './opcomponent'
import Panel from 'muicss/lib/react/panel';

export default class Start extends OpComponent {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
        };
        this.boxstyle.height = 50;
        this.boxstyle.left = 20;
        this.boxstyle.top = 10;
        this.boxstyle.position = "absolute";

        this.bottomstyle = {
            ...this.bottomstyle,
            width: 100,
            height: 10,
        };

        this.textstyle = {
            textAlign: "center",
            position: "relative",
            top: "30%",
        };
    }

    getTopPosition() {
        return [0,0];
    }

    render() {
        return (
            <strong className="no-cursor">
                <Panel style={this.boxstyle} className="box">
                    <div style={this.textstyle}>
                        スタート
                    </div>
                    <div ref='bottom' style={this.bottomstyle}
                        onMouseDown={() => {
                            this.setCompFrom(this);
                        }}>
                    </div>
                </Panel>
            </strong>
        );
    }
}