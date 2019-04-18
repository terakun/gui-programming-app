import React from 'react';
import Draggable from 'react-draggable';

export default class Wheel extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      number: this.props.number,
      setCompFrom: props.funcs.setCompFrom,
      setCompTo: props.funcs.setCompTo,
    };

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
            <select name="direction">
            <option value="1" selected>左</option>
            <option value="2">右</option>
            </select>
            タイヤを
            <select name="direction">
            <option value="1" selected>前</option>
            <option value="2">後</option>
            </select>
            に
            <select name="power">
            <option value="1" selected>強</option>
            <option value="2">中</option>
            <option value="3">弱</option>
            <option value="4">止</option>
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


