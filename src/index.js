import React from 'react';
import ReactDOM from 'react-dom';

import Start from './opcomponent/start'
import End from './opcomponent/end'
import Stop from './opcomponent/stop'
import Wheel from './opcomponent/wheel'
import Waitmsecs from './opcomponent/waitmsecs'
import BranchDistSensor from './opcomponent/branchdistsensor'

import Line from './line'

// プログラムを表現するクラス
class Graph {
  constructor() {
    this.edges = [[],[]];
    this.start_node = 0;
    this.end_node = 1;
    this.nodes = [ "Start" , "End" ];
    this.nodes_num = this.edges.length;
  }

  addComponent(component) {
    this.edges.push( [] );
    this.nodes.push( component );
    this.nodes_num++;
    return this;
  }

  checkConnectStartToEnd() {
    let node = this.start_node;
    let stack = [node];
    let visited = new Array(this.nodes_num).fill( false );
    console.log( visited.length );
    console.log("dfs");
    while( stack.length > 0 ) {
      let node = stack.pop();
      visited[ node ] = true;
      console.log( this.nodes[node] );
      if( node !== this.end_node && this.edges[node].length === 0 ) {
        return false;
      }
      for(let next_node of this.edges[ node ]) {
        if( !visited[ next_node ] ) stack.push( next_node );
      }
    }
    return true;
  }

  addEdge(from,to) {
    console.log(from);
    console.log(to);
    this.edges[from].push(to);
    return this;
  }
}

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      mouseX: 0,
      mouseY: 0,
      clickFrom: 0,
      clickTo: 0,
      isMouseDown: false,
      graph: new Graph(),
      positions: [[0,0],[0,0]],
    };

    this.funcs = {
      setCompFrom: this.setCompFrom.bind(this),
      setCompTo: this.setCompTo.bind(this),
    };
  }

  addComponent(node_name) {
    const new_positions = Object.assign([], this.state.positions);
    new_positions.push([0,0]);
    this.setState({
      positions: new_positions,
      graph: this.state.graph.addComponent(node_name),
    });
  }

  _onMouseMove(e) {
    this.setState({ mouseX: e.pageX, mouseY: e.pageY });
    if(this.state.isMouseDown) this.refs.line.set2(this.state.mouseX,this.state.mouseY);
  }
  _onMouseClick(e) {
    this.setState({ isMouseDown: true });
  }

  setCompFrom(comp) {
    console.log("From:"+comp.state.number);
    this.setState({ clickFrom: comp.state.number , isMouseDown: true });
  }
  setCompTo(comp) {
    console.log("To:"+comp.state.number);
    if( comp.state.number === this.state.clickFrom ){
      this.setState({
        isMouseDown: false ,
      });
    }else{
      this.setState({
        clickTo: comp.state.number ,
        isMouseDown: false ,
        graph: this.state.graph.addEdge(this.state.clickFrom , comp.state.number),
      });
    }
  }

  runProgram() {
    if( !this.state.graph.checkConnectStartToEnd() ){
      console.log("disconnected");
      return false;
    }
    console.log("connected");
    return true;
  }

  render() {
    const style = {
      width: 640,
      height: 480,
      border: "solid",
      padding: "0 16px",
    };
    const mouseX = this.state.mouseX;
    const mouseY = this.state.mouseY;
    const isMouseDown = this.state.isMouseDown.toString();
 
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
            {
              this.state.graph.nodes.map((node_name, index) => {
                switch (node_name) {
                  case "Start":
                    return  ( <Start key={index} number={index} funcs={this.funcs} handleDrag={this.props.handleDrag} /> );
                  case "End":
                    return ( <End key={index} number={index} funcs={this.funcs} handleDrag={this.props.handleDrag} /> );
                  case "Wheel":
                    return ( <Wheel key={index} number={index} funcs={this.funcs} handleDrag={this.props.handleDrag} /> );
                  case "Waitmsecs":
                    return ( <Waitmsecs key={index} number={index} funcs={this.funcs} handleDrag={this.props.handleDrag} /> );
                  case "BranchDistSensor":
                    return ( <BranchDistSensor key={index} number={index} funcs={this.funcs} handleDrag={this.props.handleDrag} /> );
                  case "Stop":
                    return ( <Stop key={index} number={index} funcs={this.funcs} handleDrag={this.handleDrag} /> );
                  default:
                    return (<div>Error</div>);
                }
              })
            }

            <div>
              {
                // 2つの部品をつなぐときに描画する線の処理
                (() => {
                  if (this.state.isMouseDown) {
                    return (
                      <Line ref='line' x1={100} y1={100} x2={mouseX} y2={mouseY} thickness={1} color="black" />
                    );
                  }
                })()
              }
            </div>
            <div>
              {
                // 接続された部品間の線を描画する際の処理
                this.state.graph.edges.map((nodes, node_from) => {
                  return (
                    nodes.map((node_to) => {
                      let [x1, y1] = [this.state.positions[node_from][0], this.state.positions[node_from][1]];
                      let [x2, y2] = [this.state.positions[node_to][0], this.state.positions[node_to][1]];
                      console.log("edge:" + node_from + " " + node_to);
                      return (
                        <Line x1={x1} y1={y1} x2={x2} y2={y2} thickness={1} color="black" />
                      );
                    }));
                })
              }
            </div>
          </div>
          <div>
          </div>
        </div>

        <button onClick={this.runProgram.bind(this)}>実行</button>
        <button>やめる</button>

        <div>
          Debug Information
        <div>{mouseX} {mouseY} {isMouseDown}</div>
          <div className="NodesInfo">
            Nodes Information
          <ol start="0">
              {this.state.graph.nodes.map((node, index) => <li key={index}>{node}</li>)}
            </ol>
          </div>
          <div className="EdgesInfo">
            Edges Information
          <ol start="0">
              {this.state.graph.edges.map((edges, index) => <li key={index}>{edges}</li>)}
            </ol>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

