import React from 'react';
import OpComponent from './opcomponent'
import Panel from 'muicss/lib/react/panel';

export default class LineSensor extends OpComponent {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            isright: true,
        };
        this.selected_above = false;
        this.abovedstnode = null;
        this.belowdstnode = null;

        this.props.funcs.setOpComponentAttribute(this.number, {isright: this.state.isright});
        this.setBranch = this.setBranch.bind(this);

        this.boxstyle.width = 160;
        this.boxstyle.height = 65;
        this.topstyle = {
            ...this.topstyle,
            width: 160,
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

    setIsright(e) {
        let isright = e.target.value === 'true';
        this.setState({isright: isright,});
        this.props.funcs.setOpComponentAttribute(this.number, {isright: isright});
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
                    <select name="isright" defaultValue={this.state.isright} onChange={this.setIsright.bind(this)}>
                        <option value={false}>左</option>
                        <option value={true}>右</option>
                    </select>
                    のセンサーが
                </div>
                <strong className="no-cursor">
                    <div ref='above' style={this.bottomleftstyle} onMouseDown={() => {
                        this.selected_above = true;
                        this.setCompFrom(this);
                    }}>暗い
                    </div>
                </strong>
                <strong className="no-cursor">
                    <div ref='below' style={this.bottomrightstyle} onMouseDown={() => {
                        this.selected_above = false;
                        this.setCompFrom(this);
                    }}>明るい
                    </div>
                </strong>
            </Panel>
        );
    }
}

