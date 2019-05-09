import React from 'react';
import Draggable from 'react-draggable';

export default class Wheel extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      number: this.props.number,
      setCompFrom: props.funcs.setCompFrom,
      setCompTo: props.funcs.setCompTo,
      wheel: 0,
      direction: 0,
      power: 0,
    };
    this.props.funcs.setOpComponentAttribute(this.state.number,this.getAttribute());
    props.funcs.addOpObj(this);
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
    this.props.funcs.setOpComponentAttribute(this.state.number,attr);
  }
  setDirection(e) {
    this.setState({ direction: e.target.value, });
    let attr = this.getAttribute();
    attr.direction = e.target.value;
    this.props.funcs.setOpComponentAttribute(this.state.number,attr);
  }
  setPower(e) {
    this.setState({ power: e.target.value, });
    let attr = this.getAttribute();
    attr.power = e.target.value;
    this.props.funcs.setOpComponentAttribute(this.state.number,attr);
  }

  render() {
    let boxstyle = {
      width: 100,
      height: 100,
      left: "auto",
      top: "auto",
      border: "solid",
      padding: "0 16px",
      color: "#000",
      background: "#fff",
      position: "relative",
      textAlign: "center",
      borderRadius: 4,
      WebkitUserSelect: "none",
    };
    if(this.props.running){
      boxstyle.background = "#00f";
    }

    if(this.props.x !== undefined){
      boxstyle.left = this.props.x;
      boxstyle.top = this.props.y;
    }

    let topstyle = {
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

    let textstyle = {
      position: "absolute",
      top: 20,
    };

    let bottomstyle = {
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

    return (
      <Draggable cancel="strong" >
        <div style={boxstyle} className="box">
          <strong className="no-cursor">
          <div style={topstyle} onMouseUp={() => {this.state.setCompTo(this);}}></div>
          </strong>
          <div style={textstyle}>
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
          <div style={bottomstyle} onMouseDown={() => {this.state.setCompFrom(this);}}></div>
          </strong>
        </div>
      </Draggable>
    );
  }
}


