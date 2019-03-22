import React from 'react';
import ReactDOM from 'react-dom';

class OpComponent extends React.Component {
  constructor(props,id) {
    super(props);
    this.id = id;
    this.name = "";
  }
}

class Start extends OpComponent {
  constructor(props,id){
    super(props,id);
    this.name = "Start";
  }
  render() {
    return (
      <div> START </div>
    );
  }
}

class End extends OpComponent {
  constructor(props,id){
    super(props,id);
    this.name = "End";
  }
  render() {
    return (
      <div> END </div>
    );
  }

}

class RightWheel extends OpComponent {
  constructor(props,id) {
    super(props,id);
    this.dir = 0;
    this.strength = 0;
    this.name = "RightWheel";
  }
  render() {
    return ( 
      <div>RightWheel <input type="text" name="name"/> </div>
    );
  }
}

class LeftWheel extends OpComponent {
  constructor(props,id) {
    super(props,id);
    this.dir = 0;
    this.strength = 0;
    this.name = "LeftWheel";
  }
  render() {
    return (
      <div>RightWheel <input type="text" name="name"/> </div>
    );
  }
}

class Waitmsecs extends OpComponent {
  constructor(props,id) {
    super(props,id);
    this.wait_msecs = 0;
    this.name = "Waitmsecs";
  }
  render() {
    return (
      <div>Waitmsecs <input type="text" name="name"/> </div>
    );
  }
}

class BranchDistSensor extends OpComponent {
  constructor(props,id) {
    super(props,id);
    this.dist_cm = 0;
    this.name = "BranchDistSensor";
  }
  render() {
    return (
      <div>BranchDistSensor <input type="text" name="name"/> </div>
    );
  }
}

class Stop extends OpComponent {
  constructor(props,id) {
    super(props,id);
    this.name = "Stop";
  }
  render() {
    return (
      <div>Stop</div>
    );
  }

}

class Graph {
  constructor() {
    this.edges = [[],[],[]];
    this.nodes = [ new Start(0) , new End(1) , new RightWheel(2) ];
    this.nodes_num = this.edges.length;
  }

  add_component(component) {
    this.edges.push( [] );
    component.id = this.nodes_num;
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
      { this.props.graph.nodes.map((node,index) => {
        switch (node.name) {
          case "Start":
            return (<Start key={index}/>);
          case "End":
            return (<End key={index}/>);
          case "RightWheel":
            return (<RightWheel key={index}/>)
          case "LeftWheel":
            return (<LeftWheel key={index}/>)
          case "Waitmsecs":
            return (<Waitmsecs key={index}/>)
          case "BranchDistSensor":
            return (<BranchDistSensor key={index}/>)
          case "Stop":
            return (<Stop key={index}/>)
          default:
            return (<div>Error</div>);
        }
      }) }
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
      from: "",
      to: "",
      code: "",
    };
    this.add_rightwheel = this.add_rightwheel.bind(this);
    this.add_leftwheel = this.add_leftwheel.bind(this);
    this.add_waitmsecs = this.add_waitmsecs.bind(this);
    this.add_branchdistsensor = this.add_branchdistsensor.bind(this);
    this.add_stop = this.add_stop.bind(this);
    this.add_edge = this.add_edge.bind(this);
    this.handleonChange = this.handleonChange.bind(this);
    this.serialize = this.serialize.bind(this);
  }

  add_rightwheel() {
    this.setState((prevState, props) => ({
      graph: this.state.graph.add_component(new RightWheel()),
    }));
  }
  add_leftwheel() {
    this.setState((prevState, props) => ({
      graph: this.state.graph.add_component(new LeftWheel()),
    }));
  }
  add_waitmsecs() {
    this.setState((prevState, props) => ({
      graph: this.state.graph.add_component(new Waitmsecs()),
    }));
  }
  add_branchdistsensor() {
    this.setState((prevState, props) => ({
      graph: this.state.graph.add_component(new BranchDistSensor()),
    }));
  }
  add_stop() {
    this.setState((prevState, props) => ({
      graph: this.state.graph.add_component(new Stop()),
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
              <button onClick={this.add_rightwheel}>RightWheel</button>
              <button onClick={this.add_leftwheel}>LeftWheel</button>
              <button onClick={this.add_waitmsecs}>Waitmsecs</button>
              <button onClick={this.add_branchdistsensor}>BranchDistSensor</button>
              <button onClick={this.add_stop}>Stop</button>
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
          <EditWindow graph={this.state.graph} serialize={this.serialize} code={this.state.code}/>
        </div>
      </div>
    );
  }
}


ReactDOM.render(<App />, document.getElementById('root'));

