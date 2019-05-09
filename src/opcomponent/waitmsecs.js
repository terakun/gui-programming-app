import React from 'react';
import Draggable from 'react-draggable';

export default class Waitmsecs extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      number: this.props.number,
      setCompFrom: props.funcs.setCompFrom,
      setCompTo: props.funcs.setCompTo,
      time: 0,
    };
    this.props.funcs.setOpComponentAttribute(this.state.number,{ time: this.state.time });
  }

  setTime(e) {
    this.setState({ dist: e.target.value, });
    this.props.funcs.setOpComponentAttribute(this.state.number,{ time: e.target.value });
  }

  render() {
    let boxstyle = {
      width: 100,
      height: 80,
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
      top: 30,
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
          <div style={topstyle} onMouseDown={() => {this.state.setCompFrom(this);}} onMouseUp={() => {this.state.setCompTo(this);}}></div>
          </strong>
            <div style={textstyle}>
              <strong className="no-cursor">
                <input style={{width:40,}} onChange={this.setTime.bind(this)}/>
              </strong>
              ms 待つ
            </div>
          <strong className="no-cursor">
          <div style={bottomstyle} onMouseDown={() => {this.state.setCompFrom(this);}} onMouseUp={() => {this.state.setCompTo(this);}}></div>
          </strong>
        </div>
      </Draggable>
    );
  }
}

