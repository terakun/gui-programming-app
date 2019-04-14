import React from 'react';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';

export class OpComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name:props.name,
    };
  }
}

export class Start extends OpComponent {
  constructor(props){
    super(props);
  }
  render() {
    const style = {
      lineHeight: "32px",
      width: 64,
      height: 32,
      borderRadius: 4,
      border: "none",
      padding: "0 16px",
      color: "#fff",
      background: "#639"
    };
    return (
      <Draggable onDrag={() => { this.props.handleDrag(this); }}>
        <div className="Start" style={style}> START </div>
      </Draggable>
    );
  }
}

export class End extends OpComponent {
  constructor(props){
    super(props);
    this.name = "End";
  }
  render() {
    const style = {
      lineHeight: "32px",
      width: 64,
      height: 32,
      borderRadius: 4,
      border: "none",
      padding: "0 16px",
      color: "#fff",
      background: "#639"
    };

    return (
      <Draggable onDrag={() => { this.props.handleDrag(this); }}>
        <div style={style}> END </div>
      </Draggable>
    );
  }

}

export class RightWheel extends OpComponent {
  constructor(props) {
    super(props);
    this.state = {
      dir : 0,
      strength : 0,
    };
  }
  render() {
    return ( 
      <Draggable onDrag={() => { this.props.handleDrag(this); }}>
        <div>RightWheel <input type="text" name="name"/> </div>
      </Draggable>
    );
  }
}
export class LeftWheel extends OpComponent {
  constructor(props) {
    super(props);
    this.state = {
      dir : 0,
      strength : 0,
    };
  }
  render() {
    return (
      <Draggable onDrag={() => { this.props.handleDrag(this); }}>
        <div>RightWheel <input type="text" name="name"/> </div>
      </Draggable>
    );
  }
}
export class Waitmsecs extends OpComponent {
  constructor(props) {
    super(props);
    this.state = {
      wait_msecs : 0,
    };
  }
  render() {
    return (
      <Draggable onDrag={() => { this.props.handleDrag(this); }}>
        <div>Waitmsecs <input type="text" name="name"/> </div>
      </Draggable>
    );
  }
}
export class BranchDistSensor extends OpComponent {
  constructor(props) {
    super(props);
    this.state = {
      dist_cm: 0,
    };
  }
  render() {
    return (
      <Draggable onDrag={() => { this.props.handleDrag(this); }}>
        <div>BranchDistSensor <input type="text" name="name"/> </div>
      </Draggable>
    );
  }
}
export class Stop extends OpComponent {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Draggable onDrag={() => { this.props.handleDrag(this); }}>
        <div>Stop</div>
      </Draggable>
    );
  }
}


