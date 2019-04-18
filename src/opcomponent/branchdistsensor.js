import React from 'react';
import Draggable from 'react-draggable';

export default class BranchDistSensor extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      number: this.props.number,
      setCompFrom: props.funcs.setCompFrom,
      setCompTo: props.funcs.setCompTo,
      dist: 0,
    };
    this.props.funcs.setOpComponentAttribute(this.state.number,{ dist: this.state.dist });
  }

  setDist(e) {
    this.setState({ dist: e.target.value, });
    this.props.funcs.setOpComponentAttribute(this.state.number,{ dist: e.target.value });
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

    let textstyle = {
      position: "absolute",
      top: "35%",
    };

    let bottomleftstyle = {
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

    let bottomrightstyle = {
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

    return (
      <Draggable cancel="strong" >
        <div style={boxstyle} className="box">
          <strong className="no-cursor">
            <div style={topstyle} onMouseUp={() => { this.state.setCompTo(this); }}></div>
          </strong>

          <div style={textstyle}>
            距離センサーが
            <strong className="no-cursor">
              <input style={{ width: 40 }} value={this.state.dist} onChange={this.setDist.bind(this)} />
            </strong>
            cm
          </div>


          <strong className="no-cursor">
            <div style={bottomleftstyle} onMouseDown={() => { this.state.setCompFrom(this); }}>以上</div>
          </strong>

          <strong className="no-cursor">
            <div style={bottomrightstyle} onMouseDown={() => { this.state.setCompFrom(this); }}>以下</div>
          </strong>

        </div>
      </Draggable>
    );
  }
}

