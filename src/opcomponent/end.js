import React from 'react';

export default class End extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      number: this.props.number,
      setCompFrom: props.funcs.setCompFrom,
      setCompTo: props.funcs.setCompTo,
    };
    props.funcs.addOpObj(this);
  }

  render() {
    let boxstyle = {
      width: 100,
      height: 50,
      left: 500,
      top: 340,
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
      boxstyle.background = "#0f0";
    }

    if(this.props.x !== undefined){
      boxstyle.left = this.props.x;
      boxstyle.top = this.props.y;
    }

    const topstyle = {
      width: 100,
      height: 10,
      border: "solid",
      color: "#000",
      background: "#239",
      position: "absolute",
      top: -1,
    };

    let textstyle = {
      textAlign: "center",
      position:"absolute",
      top:"35%",
    };

    return (
      <div style={boxstyle} className="box">
        <strong className="no-cursor">
          <div style={topstyle} onMouseUp={() => {this.state.setCompTo(this);}}></div>
        </strong>
        <div style={textstyle}>
          エンド 
        </div>
      </div>
    );
  }
}