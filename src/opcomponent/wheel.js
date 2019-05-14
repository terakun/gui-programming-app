import React from 'react';
import OpComponent from './opcomponent'

export default class Wheel extends OpComponent {
  constructor(props){
    super(props);
    this.state = {
      wheel: 0,
      direction: 0,
      power: 0,
    };
    this.props.funcs.setOpComponentAttribute(this.number,this.getAttribute());
    this.boxstyle.height = 100;

    this.topstyle = {
      marginLeft: "auto",
      width:50,
      height:20,
      borderRadius: 4,
      border: "none",
      color: "#fff",
      position: "absolute",
      top: 0,
      background: "#239",
      left:0,
      right:0,
      margin:"auto",
    };

    this.textstyle = {
      position: "absolute",
      top: 20,
    };

    this.bottomstyle = {
      marginLeft: "auto",
      width:50,
      height:20,
      borderRadius: 4,
      border: "none",
      color: "#fff",
      position: "absolute",
      bottom: 0,
      background: "#239",
      left:0,
      right:0,
      margin:"auto",
    };
  }

  getAttribute() {
    return {
      wheel: this.state.wheel,
      direction: this.state.direction,
      power: this.state.power,
    }
  }

  setWheel(e) {
    this.setState({ wheel: e.target.value, });
    let attr = this.getAttribute();
    attr.wheel = e.target.value;
    this.props.funcs.setOpComponentAttribute(this.number,attr);
  }
  setDirection(e) {
    this.setState({ direction: e.target.value, });
    let attr = this.getAttribute();
    attr.direction = e.target.value;
    this.props.funcs.setOpComponentAttribute(this.number,attr);
  }
  setPower(e) {
    this.setState({ power: e.target.value, });
    let attr = this.getAttribute();
    attr.power = e.target.value;
    this.props.funcs.setOpComponentAttribute(this.number,attr);
  }

  renderOpComp() {
    if(this.props.running){
      this.boxstyle.background = "#00f";
    } else {
      this.boxstyle.background = "#fff";
    }



    return (
        <div style={this.boxstyle} className="box">
          <strong className="no-cursor">
          <div ref='top' style={this.topstyle} onMouseUp={() => {this.setCompTo(this);}}></div>
          </strong>
          <div style={this.textstyle}>
            <select name="wheel" defaultValue={0} onChange={this.setWheel.bind(this)}>
            <option value={0}>左</option>
            <option value={1}>右</option>
            </select>
            タイヤを
            <select name="direction" defaultValue={0} onChange={this.setDirection.bind(this)}>
            <option value={0}>前</option>
            <option value={1}>後</option>
            </select>
            に
            <select name="power" defaultValue={0} onChange={this.setPower.bind(this)}>
            <option value={3}>強</option>
            <option value={2}>中</option>
            <option value={1}>弱</option>
            <option value={0}>止</option>
            </select>
          </div>
          <strong className="no-cursor">
          <div ref='bottom' style={this.bottomstyle} onMouseDown={() => {this.setCompFrom(this);}}></div>
          </strong>
        </div>
    );
  }
}


