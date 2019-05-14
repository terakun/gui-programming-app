import React from 'react';
import OpComponent from './opcomponent'

export default class BranchDistSensor extends OpComponent {
  constructor(props){
    super(props);
    this.state = {
      dist: 0,
    };
    this.selected_above = false;
    this.abovedstnode = null;
    this.belowdstnode = null;

    this.props.funcs.setOpComponentAttribute(this.number,{ dist: this.state.dist });
    this.setBranch = this.setBranch.bind(this);

    this.boxstyle.height = 100;
    this.topstyle = {
      marginLeft: "auto",
      width:100,
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
      top: "35%",
    };

    this.bottomleftstyle = {
      marginLeft: "auto",
      width:50,
      height:20,
      border: "none",
      color: "#fff",
      position: "absolute",
      bottom: 0,
      background: "#239",
      left:0,
      margin:"auto",
    };

    this.bottomrightstyle = {
      marginLeft: "auto",
      width:50,
      height:20,
      border: "none",
      color: "#fff",
      position: "absolute",
      bottom: 0,
      background: "#239",
      right:0,
      margin:"auto",
    };

  }

  setDist(e) {
    this.setState({ dist: e.target.value, });
    this.props.funcs.setOpComponentAttribute(this.number,{ dist: e.target.value });
  }

  setBranch(id) {
    if(this.selected_above){
      this.abovedstnode = id;
      console.log("above:"+id);
    } else {
      this.belowdstnode = id;
      console.log("below:"+id);
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
    if(this.props.running){
      this.boxstyle.background = "#0f0";
    } else {
      this.boxstyle.background = "#fff";
    }

    return (
        <div style={this.boxstyle} className="box">
          <strong className="no-cursor">
            <div ref='top' style={this.topstyle} onMouseUp={() => { this.setCompTo(this); }}></div>
          </strong>
          <div style={this.textstyle}>
            距離センサーが
            <strong className="no-cursor">
              <input style={{ width: 40 }} value={this.state.dist} onChange={this.setDist.bind(this)} />
            </strong>
            cm
          </div>
          <strong className="no-cursor">
            <div ref='above' style={this.bottomleftstyle} onMouseDown={() => { this.selected_above = true;this.setCompFrom(this); }}>以上</div>
          </strong>
          <strong className="no-cursor">
            <div ref='below' style={this.bottomrightstyle} onMouseDown={() => { this.selected_above = false;this.setCompFrom(this); }}>以下</div>
          </strong>
        </div>
    );
  }
}

