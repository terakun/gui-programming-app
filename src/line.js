import React from 'react';
import ReactDOM from 'react-dom';

export default class Line extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      x1: this.props.x1,
      y1: this.props.y1,
      x2: this.props.x2,
      y2: this.props.y2,
      thickness: this.props.thickness,
      color: this.props.color,
    };

  }

  set2(x,y) {
    this.setState({
      x2:x,
      y2:y,
    });
  }
  render() {
    let x1 = this.state.x1;
    let y1 = this.state.y1;
    let x2 = this.state.x2;
    let y2 = this.state.y2;
    let thickness = this.state.thickness;
    let color = this.state.color;

    const length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
    const cx = ((x1 + x2) / 2) - (length / 2);
    const cy = ((y1 + y2) / 2) - (thickness / 2);
    const angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI);

    const style={
      padding:0,
      margin:0,
      height: thickness,
      backgroundColor:color,
      lineHeight:1,
      position:"absolute",
      left:cx,
      top:cy,
      width:length,
      MozTransform:`rotate(${angle}deg)`,
      WebkitTransform:`rotate(${angle}deg)`,
      OTransform:`rotate(${angle}deg)`,
      msTransform:`rotate(${angle}deg)`,
      transform:`rotate(${angle}deg)`,
    };
    return ( 
      <div style={style}/>
    );
  }
}


