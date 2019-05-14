import React from 'react';
import Draggable from 'react-draggable';

export default class Stop extends React.Component {
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

    const topstyle = {
      width: 100,
      height: 10,
      border: "solid",
      color: "#239",
      background: "#239",
      position: "absolute",
      top: -1,
    };

    const textstyle = {
      position: "absolute",
      top: "25%",
    };


    const bottomstyle = {
      width: 100,
      height: 10,
      border: "solid",
      color: "#239",
      background: "#239",
      position: "absolute",
      bottom: -1,
    };

    return (
      <Draggable cancel="strong" onDrag={() => { }}>
        <div style={boxstyle} className="box">
          <strong className="no-cursor">
            <div style={topstyle} onMouseUp={() => {this.state.setCompTo(this);}}></div>
          </strong>
          <div style={textstyle}>
            ストップ
          </div>
          <strong className="no-cursor">
            <div style={bottomstyle} onMouseDown={() => {this.state.setCompFrom(this);}}></div>
          </strong>
        </div>
      </Draggable>
    );
  }
}


