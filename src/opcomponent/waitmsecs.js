import React from 'react';
import OpComponent from './opcomponent'

export default class Waitmsecs extends OpComponent {
  constructor(props){
    super(props);
    this.state = {
      time: 0,
    };

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
      top: 30,
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

    this.boxstyle.height = 80;
    this.props.funcs.setOpComponentAttribute(this.number,{ time: this.state.time });
  }

  setTime(e) {
    this.setState({ time: e.target.value, });
    console.log(e.target.value);
    this.props.funcs.setOpComponentAttribute(this.number,{ time: e.target.value });
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
          <div style={this.topstyle} onMouseDown={() => { this.setCompFrom(this); }} onMouseUp={() => { this.setCompTo(this); }}></div>
        </strong>
        <div style={this.textstyle}>
          <strong className="no-cursor">
            <input style={{ width: 40, }} onChange={this.setTime.bind(this)} />
          </strong>
          ms 待つ
            </div>
        <strong className="no-cursor">
          <div style={this.bottomstyle} onMouseDown={() => { this.setCompFrom(this); }} onMouseUp={() => { this.setCompTo(this); }}></div>
        </strong>
      </div>
    );
  }
}

