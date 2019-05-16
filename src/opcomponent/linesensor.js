import React from 'react';
import OpComponent from './opcomponent'

export default class LineSensor extends OpComponent {
    constructor(props) {
        super(props);
        this.state = {
            isright: 0,
        };
        this.selected_above = false;
        this.abovedstnode = null;
        this.belowdstnode = null;

        this.props.funcs.setOpComponentAttribute(this.number, {dist: this.state.dist});
        this.setBranch = this.setBranch.bind(this);

        this.boxstyle.height = 100;
        this.topstyle = {
            ...this.topstyle,
            width: 70,
            height: 10,
        };

        this.textstyle = {
            position: "absolute",
            top: "35%",
        };

        this.bottomleftstyle = {
            ...this.bottomstyle,
            width: 50,
            height: 20,
            border: "none",
            color: "#fff",
            left: 0,
            right: "auto",
            borderRadius: 2,
        };

        this.bottomrightstyle = {
            ...this.bottomstyle,
            width: 50,
            height: 20,
            border: "none",
            color: "#fff",
            left: "auto",
            right: 0,
            borderRadius: 2,
        };

    }

    setIsright(e) {
        this.setState({isright: e.target.value,});
        this.props.funcs.setOpComponentAttribute(this.number, {isright: e.target.value});
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
            <div style={this.boxstyle} className="box">
                <strong className="no-cursor">
                    <div ref='top' style={this.topstyle} onMouseUp={() => {
                        this.setCompTo(this);
                    }}></div>
                </strong>
                <div style={this.textstyle}>
                    <select name="isright" defaultValue={true} onChange={this.setIsright.bind(this)}>
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
            </div>
        );
    }
}

