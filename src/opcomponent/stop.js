import React from 'react';
import OpComponent from './opcomponent';

export default class Stop extends OpComponent {
  constructor(props){
    super(props);
    this.state = {};

    this.topstyle = {
      width: 100,
      height: 10,
      border: "solid",
      color: "#239",
      background: "#239",
      position: "absolute",
      top: -1,
    };

    this.textstyle = {
      position: "absolute",
      top: "25%",
    };

    this.bottomstyle = {
      width: 100,
      height: 10,
      border: "solid",
      color: "#239",
      background: "#239",
      position: "absolute",
      bottom: -1,
    };
  }

  renderOpComp() {
    return (
      <div style={this.boxstyle} className="box">
        <strong className="no-cursor">
          <div refs='top' style={this.topstyle} onMouseUp={() => { this.setCompTo(this); }}></div>
        </strong>
        <div style={this.textstyle}>
          ストップ
          </div>
        <strong className="no-cursor">
          <div refs='bottom' style={this.bottomstyle} onMouseDown={() => { this.setCompFrom(this); }}></div>
        </strong>
      </div>
    )
  }
}


