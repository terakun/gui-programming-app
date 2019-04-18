import React from 'react';

export default class Start extends React.Component {
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
      height: 50,
      left: 10,
      top: 10,
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
    const bottomstyle = {
      width: 100,
      height: 10,
      border: "solid",
      background: "#239",
      position: "absolute",
      bottom: -1,
    };
    let textstyle = {
      textAlign: "center",
      position:"absolute",
      top:"35%",
    };

    return (
        <div style={boxstyle} className="box">
          <div style={textstyle}>
            スタート
          </div>
          <strong className="no-cursor">
            <div style={bottomstyle} onMouseDown={() => {this.state.setCompFrom(this);}}></div>
          </strong>
        </div>
    );
  }
}


