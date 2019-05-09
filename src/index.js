import React from 'react';
import ReactDOM from 'react-dom';

import Start from './opcomponent/start'
import End from './opcomponent/end'
import Stop from './opcomponent/stop'
import Wheel from './opcomponent/wheel'
import Waitmsecs from './opcomponent/waitmsecs'
import BranchDistSensor from './opcomponent/branchdistsensor'

import Line from './line'
import Graph from './graph'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mouseX: 0,
      mouseY: 0,
      clickFrom: 0,
      clickTo: 0,
      isMouseDown: false,
      graph: new Graph(),
      positions: [[0, 0], [0, 0]],
      sensordata: 0,
      currentnode: 0,
      timercount: 0,
      carstate: {
        left: {
          power: 0,
          direction: 0,
        },
        right: {
          power: 0,
          direction: 0,
        }
      }
    };

    this.opobj = [];

    this.connection = new WebSocket("ws:127.0.0.1:8000");
    this.connection.onopen = this.onOpen.bind(this);
    this.connection.onmessage = this.onMessage.bind(this);

    this.runProgram = this.runProgram.bind(this);
    this.stepProgram = this.stepProgram.bind(this);
    this.stopProgram = this.stopProgram.bind(this);

    this.funcs = {
      setCompFrom: this.setCompFrom.bind(this),
      setCompTo: this.setCompTo.bind(this),
      setOpComponentAttribute: this.setOpComponentAttribute.bind(this),
      addOpObj: this.addOpObj.bind(this),
    };
  }

  addOpObj(obj){
    this.opobj.push(obj);
  }

  onOpen(event) {
    console.log("Connect successful!");
  }

  onMessage(event) {
    this.setState({ sensordata: parseInt(event.data,10), })
  }

  addComponent(node_name) {
    const new_positions = Object.assign([], this.state.positions);
    new_positions.push([0, 0]);
    this.setState({
      positions: new_positions,
      graph: this.state.graph.addComponent(node_name),
    });
  }

  _onMouseMove(e) {
    this.setState({ mouseX: e.pageX, mouseY: e.pageY });

    let rect = ReactDOM.findDOMNode(this.opobj[0]).getBoundingClientRect();
    // console.log(rect);
    if (this.state.isMouseDown) this.refs.line.set2(this.state.mouseX, this.state.mouseY);
  }

  _onMouseClick(e) {
    this.setState({ isMouseDown: true });
  }

  setCompFrom(comp) {
    console.log("From:" + comp.state.number);
    if( this.state.graph.nodes[comp.state.number] === "BranchDistSensor" ) {

    }
    this.setState({ clickFrom: comp.state.number, isMouseDown: true });
  }

  setCompTo(comp) {
    console.log("To:" + comp.state.number);
    if (comp.state.number === this.state.clickFrom) {
      this.setState({
        isMouseDown: false,
      });
    } else {
      if ((this.state.graph.nodes[this.state.clickFrom] !== "BranchDistSensor" && this.state.graph.edges[this.state.clickFrom].length === 0) ||
        (this.state.graph.nodes[this.state.clickFrom] === "BranchDistSensor" && this.state.graph.edges[this.state.clickFrom].length <= 1)) {
        if(this.state.graph.nodes[this.state.clickFrom] === "BranchDistSensor") {
          this.opobj[this.state.clickFrom].setCompTo(comp.state.number);
        }
        this.setState({
          clickTo: comp.state.number,
          isMouseDown: false,
          graph: this.state.graph.addEdge(this.state.clickFrom, comp.state.number),
        });
      }
    }
  }

  runProgram() {
    if (!this.state.graph.checkConnectStartToEnd()) {
      console.log("disconnected");
      return false;
    }
    this.interval = setInterval(this.stepProgram, 10);
    console.log("connected");
    return true;
  }

  stepProgram() {
    const currentnode = this.state.currentnode;
    const nextedge = this.state.graph.edges[currentnode];
    let nextnode = null;
    const attr = this.state.graph.attributes[currentnode];
    let carstate = this.state.carstate;

    switch (this.state.graph.nodes[currentnode]) {
      case "Start":
        nextnode = nextedge[0];
        break;
      case "End":
        clearInterval(this.interval);
        nextnode = 0;
        console.log("Program Terminated");
        this.connection.send("s");
        break;
      case "Wheel":
        let wheel = parseInt(attr.wheel,10);
        let direction = parseInt(attr.direction,10);
        let power = parseInt(attr.power,10);
        if( wheel === 0 ) { // 左
          if( direction === 0){ // 順転
            let speed = 3+power;
            this.connection.send("l"+speed);
          }else{ // 反転
            let speed = 3-power;
            this.connection.send("l"+speed);
          }
          carstate.left = {
            power: power,
            direction: direction,
          };
        } else {
          if(direction === 0){ // 順転
            let speed = 3+power;
            this.connection.send("r"+speed);
          }else{ // 反転
            let speed = 3-power;
            this.connection.send("r"+speed);
          }
          carstate.right = {
            power:power,
            direction: direction,
          };
        }
        nextnode = nextedge[0];
        break;
      case "Waitmsecs":
        if( this.state.timercount*10 > attr.time ) {
          nextnode = nextedge[0];
          this.setState({
            timercount : 0,
          });
        } else {
          nextnode = currentnode;
          this.setState({
            timercount : this.state.timercount + 1,
          });
        }
        break;
      case "BranchDistSensor":
        let dist = parseInt(attr.dist,10);
        if( dist > this.state.sensordata ) {
          nextnode = this.opobj[currentnode].belowdstnode;
        } else {
          nextnode = this.opobj[currentnode].abovedstnode;
        }
        break;
      case "Stop":
        this.connection.send("s");
        carstate.left = {
          power: 0,
          direction: 0,
        };
        carstate.right = {
          power: 0,
          direction: 0,
        };
        break;
      default:
    }
    this.setState({
      currentnode: nextnode,
      carstate: carstate,
    });
  }

  stopProgram() {
    clearInterval(this.interval);
  }

  setOpComponentAttribute(id, attr) {
    let new_graph = this.state.graph.setAttribute(id, attr);
    this.setState({
      graph: new_graph,
    });
  }

  renderOpComponents() {
    return this.state.graph.nodes.map((node_name, index) => {
      let running = (this.state.currentnode === index);
      switch (node_name) {
        case "Start":
          return (<Start key={index} number={index} running={running} funcs={this.funcs} handleDrag={this.props.handleDrag} />);
        case "End":
          return (<End key={index} number={index}  running={running} funcs={this.funcs} handleDrag={this.props.handleDrag} />);
        case "Wheel":
          return (<Wheel key={index} number={index}  running={running} funcs={this.funcs} handleDrag={this.props.handleDrag} />);
        case "Waitmsecs":
          return (<Waitmsecs key={index} number={index}  running={running} funcs={this.funcs} handleDrag={this.props.handleDrag} />);
        case "BranchDistSensor":
          return (<BranchDistSensor key={index} number={index}  running={running} funcs={this.funcs} handleDrag={this.props.handleDrag} />);
        case "Stop":
          return (<Stop key={index} number={index}  running={running} funcs={this.funcs} handleDrag={this.handleDrag} />);
        default:
          return (<div>Error</div>);
      }
    });
  }

  renderEdges() {
    // 接続された部品間の線を描画する際の処理
    return this.state.graph.edges.map((nodes, node_from) => {
      return (
        nodes.map((node_to, index) => {
          let [x1, y1] = [this.state.positions[node_from][0], this.state.positions[node_from][1]];
          let [x2, y2] = [this.state.positions[node_to][0], this.state.positions[node_to][1]];
          return (
            <Line keys={this.nodes_num * node_from + index} x1={x1} y1={y1} x2={x2} y2={y2} thickness={1} color="black" />
          );
        }));
    });
  }

  renderDebugWindow() {
    const mouseX = this.state.mouseX;
    const mouseY = this.state.mouseY;
    const isMouseDown = this.state.isMouseDown.toString();
    const currentnode = this.state.currentnode;
    const sensordata = this.state.sensordata;
    const timercount = this.state.timercount;
    const opobj = this.opobj;
    const positions = this.state.positions;
    return (
      <div>
        Debug Information
        <div>{mouseX} {mouseY} {isMouseDown}</div>
        <div>currentnode: {currentnode}</div>
        <div>sensordata: {sensordata}</div>
        <div>timercount: {timercount}</div>
        <div>opobj: {opobj.toString()}</div>
        <div>positions: {positions}</div>
        <div className="NodesInfo">
          Nodes Information
          <ol start="0">
            {this.state.graph.nodes.map((node, index) => <li key={index}>{node}:{JSON.stringify(this.state.graph.attributes[index], null, '\t')}</li>)}
          </ol>
        </div>
        <div className="EdgesInfo">
          Edges Information
          <ol start="0">
            {this.state.graph.edges.map((edges, index) => <li key={index}>{edges}</li>)}
          </ol>
        </div>
      </div>
    );
  }

  render() {
    const style = {
      width: 640,
      height: 480,
      border: "solid",
      padding: "0 16px",
    };

    const selectedcompX = this.state.positions[this.state.clickFrom][0];
    const selectedcompY = this.state.positions[this.state.clickFrom][1];

    const mouseX = this.state.mouseX;
    const mouseY = this.state.mouseY;

    return (
      <div>
        <div onMouseMove={this._onMouseMove.bind(this)} onMouseUp={() => { this.setState({ isMouseDown: false }) }} style={style}>
          <div>
            <button onClick={() => { this.addComponent("Wheel"); }}>Wheel</button>
            <button onClick={() => { this.addComponent("Waitmsecs"); }}>Waitmsecs</button>
            <button onClick={() => { this.addComponent("BranchDistSensor"); }}>BranchDistSensor</button>
            <button onClick={() => { this.addComponent("Stop"); }}>Stop</button>
          </div>

          <div>
            {this.renderOpComponents()}
            <div>
              {(() => {
                if (this.state.isMouseDown) {
                  return (<Line ref='line' x1={selectedcompX} y1={selectedcompY} x2={mouseX} y2={mouseY} thickness={1} color="black" />);
                }
              })()}
            </div>
            <div> {this.renderEdges()} </div>
          </div>
        </div>
        <button onClick={this.runProgram.bind(this)}>実行</button>
        <button onClick={this.stopProgram.bind(this)}>やめる</button>
        {this.renderDebugWindow()}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));