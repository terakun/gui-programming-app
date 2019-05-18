import React from 'react';
import OpComponent from './opcomponent'
import Panel from 'muicss/lib/react/panel';

export default class Wheel extends OpComponent {
  constructor(props){
    super(props);
    this.state = {
      ...this.state,
      wheel: 0,
      direction: 0,
      power: 3,
    };
    this.props.funcs.setOpComponentAttribute(this.number,this.getAttribute());
    this.boxstyle.width = 180;

      this.topstyle = {
          ...this.topstyle,
          width: 70,
          height: 10,
      };

    this.textstyle = {
      position: "relative",
      textAlign: "center",
      top: 20,
    };

      this.bottomstyle = {
          ...this.bottomstyle,
          width: 70,
          height: 10,
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
    attr.wheel = parseInt(e.target.value,10);
    this.props.funcs.setOpComponentAttribute(this.number,attr);
  }
  setDirection(e) {
    this.setState({ direction: e.target.value, });
    let attr = this.getAttribute();
    attr.direction = parseInt(e.target.value,10);
    this.props.funcs.setOpComponentAttribute(this.number,attr);
  }
  setPower(e) {
    this.setState({ power: e.target.value, });
    let attr = this.getAttribute();
    attr.power = parseInt(e.target.value,10);
    this.props.funcs.setOpComponentAttribute(this.number,attr);
  }

  renderOpComp() {
    if(this.props.running){
      this.boxstyle.background = "#00f";
    } else {
      this.boxstyle.background = "#fff";
    }



    return (
        <Panel style={this.boxstyle} className="box">
          <strong className="no-cursor">
          <div ref='top' style={this.topstyle} onMouseUp={() => {this.setCompTo(this);}}></div>
          </strong>
          <div style={this.textstyle}>
            <select name="wheel" defaultValue={this.state.wheel} onChange={this.setWheel.bind(this)}>
            <option value={0}>左</option>
            <option value={1}>右</option>
            </select>
            タイヤを
            <select name="direction" defaultValue={this.state.direction} onChange={this.setDirection.bind(this)}>
            <option value={0}>前</option>
            <option value={1}>後</option>
            </select>
            に
            <select name="power" defaultValue={this.state.power} onChange={this.setPower.bind(this)}>
            <option value={3}>強</option>
            <option value={2}>中</option>
            <option value={1}>弱</option>
            <option value={0}>止</option>
            </select>
          </div>
          <strong className="no-cursor">
          <div ref='bottom' style={this.bottomstyle} onMouseDown={() => {this.setCompFrom(this);}}></div>
          </strong>
        </Panel>
    );
  }
}


