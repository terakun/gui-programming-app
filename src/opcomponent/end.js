import React from 'react';
import OpComponent from './opcomponent'
import Panel from 'muicss/lib/react/panel';

export default class End extends OpComponent {
    constructor(props) {
        super(props);
        this.state = {
        };

        this.boxstyle.height = 50;
        this.boxstyle.right = 80;
        this.boxstyle.bottom = 100;
        this.boxstyle.position = "absolute";

        this.topstyle = {
            ...this.topstyle,
            width: 100,
            height: 10,
        };

        this.textstyle = {
            position: "relative",
            textAlign: "center",
            top: "30%",
        };

    }

    getBottomPosition() {
        return [0,0];
    }


    renderOpComp() {
        return (
            <strong className="no-cursor">

                <Panel style={this.boxstyle} className="box">
                    <div ref='top' style={this.topstyle} onMouseUp={() => {
                        this.setCompTo(this);
                    }}></div>
                    <div style={this.textstyle}>
                        エンド
                    </div>
                </Panel>
            </strong>
        );
    }
}