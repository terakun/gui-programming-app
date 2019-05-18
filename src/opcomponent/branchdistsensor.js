import React from 'react';
import OpComponent from './opcomponent'
import Panel from 'muicss/lib/react/panel';

export default class BranchDistSensor extends OpComponent {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            dist: 0,
        };
        this.selected_above = false;
        this.abovedstnode = null;
        this.belowdstnode = null;

        this.props.funcs.setOpComponentAttribute(this.number, {dist: this.state.dist});
        this.setBranch = this.setBranch.bind(this);

        this.boxstyle.width = 160;
        this.boxstyle.height = 65;
        this.topstyle = {
            ...this.topstyle,
            width: 70,
            height: 10,
        };

        this.textstyle = {
            position: "relative",
            textAlign: "center",
            top: "30%",
        };

        this.bottomleftstyle = {
            ...this.bottomstyle,
            width: 60,
            height: 20,
            border: "none",
            color: "#fff",
            left: 0,
            right: "auto",
            borderRadius: 2,
        };

        this.bottomrightstyle = {
            ...this.bottomstyle,
            width: 60,
            height: 20,
            border: "none",
            color: "#fff",
            left: "auto",
            right: 0,
            borderRadius: 2,
        };

    }

    setDist(e) {
        let dist = parseInt(e.target.value,10);
        this.setState({dist: dist});
        this.props.funcs.setOpComponentAttribute(this.number, {dist: dist});
    }

    setBranch(id) {
        if (this.selected_above) {
            this.abovedstnode = id;
            console.log("above:" + id);
        } else {
            this.belowdstnode = id;
            console.log("below:" + id);
        }
        this.selected_above = false;
    }

    getBottomBelowPosition() {
        let rect = this.refs.below.getBoundingClientRect();
        let compX = rect.x + rect.width / 2;
        let compY = rect.y + rect.height / 2;
        return [compX, compY]
    }

    getBottomAbovePosition() {
        let rect = this.refs.above.getBoundingClientRect();
        let compX = rect.x + rect.width / 2;
        let compY = rect.y + rect.height / 2;
        return [compX, compY]
    }

    renderOpComp() {
        if (this.props.running) {
            this.boxstyle.background = "#0f0";
        } else {
            this.boxstyle.background = "#fff";
        }

        return (
            <Panel style={this.boxstyle} className="box">
                <strong className="no-cursor">
                    <div ref='top' style={this.topstyle} onMouseUp={() => {
                        this.setCompTo(this);
                    }}></div>
                </strong>
                <div style={this.textstyle}>
                    距離センサーが
                    <strong className="no-cursor">
                        <input style={{width: 40}} value={this.state.dist} onChange={this.setDist.bind(this)}/>
                    </strong>
                    cm
                </div>
                <strong className="no-cursor">
                    <div ref='above' style={this.bottomleftstyle} onMouseDown={() => {
                        this.selected_above = true;
                        this.setCompFrom(this);
                    }}>以上
                    </div>
                </strong>
                <strong className="no-cursor">
                    <div ref='below' style={this.bottomrightstyle} onMouseDown={() => {
                        this.selected_above = false;
                        this.setCompFrom(this);
                    }}>以下
                    </div>
                </strong>
            </Panel>
        );
    }
}

