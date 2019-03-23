import React from 'react';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';
import {Start,End,RightWheel,LeftWheel,Waitmsecs,BranchDistSensor,Stop} from './opcomponent'

class Graph {
  constructor() {
    this.edges = [[],[],[]];
    this.nodes = [ "Start" , "End" ];
    this.nodes_num = this.edges.length;
  }

  add_component(component) {
    this.edges.push( [] );
    this.nodes.push( component );
    this.nodes_num++;
    return this;
  }

  add_edge(from,to) {
    console.log(from);
    console.log(to);
    this.edges[from].push(to);
    return this;
  }
}

class DebugWindow extends React.Component {
  constructor(props){
    super(props);
    this.state = {
    };
  }
  render() {
    return (
      <div className="DebugWindow">
        <div className="NodesInfo">
          Nodes Information
          <ol start="0">
            { this.props.graph.nodes.map((node,index) => <li key={index}>{node.name}</li>) }
          </ol>
        </div>
        <div className="EdgesInfo">
          Edges Information
          <ol start="0">
            { this.props.graph.edges.map((edges,index) => <li key={index}>{edges}</li>) }
          </ol>
        </div>
      </div>
    );
  }
}

class EditWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    return (
      <div>
      Editor Window
      { this.props.graph.nodes.map((node_name,index) => {
        switch (node_name) {
          case "Start":
            return (<Start id={index} name={node_name} handleDrag={this.props.handleDrag}/>);
          case "End":
            return (<End id={index} name={node_name} handleDrag={this.props.handleDrag}/>);
          case "RightWheel":
            return (<RightWheel id={index} name={node_name} handleDrag={this.props.handleDrag}/>)
          case "LeftWheel":
            return (<LeftWheel id={index} name={node_name} handleDrag={this.props.handleDrag}/>)
          case "Waitmsecs":
            return (<Waitmsecs id={index} name={node_name} handleDrag={this.props.handleDrag}/>)
          case "BranchDistSensor":
            return (<BranchDistSensor id={index} name={node_name} handleDrag={this.props.handleDrag}/>)
          case "Stop":
            return (<Stop id={index} name={node_name} handleDrag={this.handleDrag}/>)
          default:
            return (<div>Error</div>);
        }
      }) }
      <svg width="1000" height="500">
      {
        this.props.graph.edges.map((nodes,node_from) => {
          return (
            nodes.map((node_to) => {
              console.log("edge:" + node_from+ " " + node_to);
              return (
                <line x1={this.props.positions[node_from][0]} y1={this.props.positions[node_from][1]} x2={this.props.positions[node_to][0]} y2={this.props.positions[node_to][1]} stroke="black"/>
              );
            }));
        })
      }
      </svg>
      <button onClick={this.props.serialize}>serialize</button>
      <button onClick={this.props.run}>run</button>
      <button onClick={this.props.stop}>stop</button>
      <input type="text" value={this.props.code} name="code"/>
      </div>
    );
  }
}


class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      graph: new Graph(),
      positions: [[0,0],[100,100],[200,200]],
      from: "",
      to: "",
      code: "",
    };

    this.add_component = this.add_component.bind(this);
    this.add_edge = this.add_edge.bind(this);
    this.handleonChange = this.handleonChange.bind(this);
    this.serialize = this.serialize.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
  }

  handleDrag(node) {
    let rect = ReactDOM.findDOMNode(node).getBoundingClientRect();
    console.log(node.props.name);
    console.log(rect.x);
    let id = parseInt( node.props.id , 10 );
    const positions = this.state.positions.slice();
    console.log("ID:"+id);
    console.log("position:"+positions[id]);
    positions[id][0] = rect.x;
    positions[id][1] = rect.y;

    this.setState({
      positions: positions
    });
  }

  add_component(compname) {
    const positions = this.state.positions.slice();
    positions.push([0,0]);
    this.setState((prevState, props) => ({
      graph: this.state.graph.add_component(compname),
      positions: positions,
    }));
  }

  serialize() {
    this.setState((prevState, props) => ({
      code: this.state.graph.nodes.length,
    }));
  }

  run() {
  }

  stop() {

  }

  handleonChange(e) {
    console.log(e.target.name);
    console.log(e.target.value);
    switch(e.target.name) {
      case "from":
        this.setState({
          from: e.target.value,
        });
        break;
      case "to":
        this.setState({
          to: e.target.value,
        });
        break;
      default:
        console.log("something wrong");
    }
  }

  add_edge() {
    console.log(this.state.positions);
    console.log(this.state.graph.edges);
    let from_id = parseInt(this.state.from,10);
    let to_id = parseInt(this.state.to,10);

    this.setState((prevState, props) => ({
      graph: this.state.graph.add_edge(from_id,to_id),
    }));
  }

  render() {
    return (
      <div>
        <DebugWindow graph={this.state.graph}/>
        <div className="EditWindow">
          <div className="NodeButton">
            Node 
            <div>
              <button onClick={() => { this.add_component("RightWheel"); }}>RightWheel</button>
              <button onClick={() => { this.add_component("LeftWheel"); }}>LeftWheel</button>
              <button onClick={() => { this.add_component("Waitmsecs"); }}>Waitmsecs</button>
              <button onClick={() => { this.add_component("BranchDistSensor"); }}>BranchDistSensor</button>
              <button onClick={() => { this.add_component("Stop"); }}>Stop</button>
            </div>
          </div>
          <div className="EdgeForm">
            Edge
            <div>
              from<input type="text" value={this.state.from} onChange={this.handleonChange} name="from"/>
              to<input type="text" value={this.state.to} onChange={this.handleonChange} name="to"/>
              <button type="submit" onClick={this.add_edge}>add edge</button>
            </div>
          </div>
          <EditWindow graph={this.state.graph} serialize={this.serialize} code={this.state.code} handleDrag={this.handleDrag} positions={this.state.positions}/>
        </div>
      </div>
    );
  }
}


ReactDOM.render(<App />, document.getElementById('root'));

