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
            selectedcompX: 0,
            selectedcompY: 0,
            clickFrom: 0,
            clickTo: 0,
            isMouseDown: false,
            graph: new Graph(),
            positions: [[0, 0], [0, 0]],
            lines: [],
            distsensordata: 0,
            leftsensordata: 0,
            rightsensordata: 0,
            dragcomp: 0,
            currentnode: 0,
            timercount: 0,
            interval: null,
            sendinterval: null,
            carstate: {
                left: 3,
                right: 3
            }
        };
        this.dragComp = -1;

        this.opobj = [];

        this.connection = new WebSocket("ws:127.0.0.1:8000");
        this.connection.onopen = this.onOpen.bind(this);
        this.connection.onmessage = this.onMessage.bind(this);

        this.runProgram = this.runProgram.bind(this);
        this.stepProgram = this.stepProgram.bind(this);
        this.stopProgram = this.stopProgram.bind(this);

        this.sendOperation = this.sendOperation.bind(this);

        this._onMouseMove = this._onMouseMove.bind(this);
        this.funcs = {
            setCompFrom: this.setCompFrom.bind(this),
            setCompTo: this.setCompTo.bind(this),
            setOpComponentAttribute: this.setOpComponentAttribute.bind(this),
            addOpObj: this.addOpObj.bind(this),
            onStartDrag: this.onStartDrag.bind(this),
            onStopDrag: this.onStopDrag.bind(this),
        };
    }

    addOpObj(obj) {
        this.opobj.push(obj);
    }

    addLine(obj) {
        console.log("line:" + obj);
        this.state.lines.push(obj);
    }

    onOpen(event) {
        console.log("Connect successful!");
        this.sendinterval = setInterval(this.sendOperation, 100);
    }

    onMessage(event) {
        let sensorarray = event.data.split(",").map(x => parseInt(x, 10));
        this.setState({
            distsensordata: sensorarray[0],
            leftsensordata: sensorarray[1],
            rightsensordata: sensorarray[2],
        });
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
        this.setState({mouseX: e.pageX, mouseY: e.pageY});
        if (this.dragComp !== -1 && this.dragComp !== undefined) {
            let rect = ReactDOM.findDOMNode(this.opobj[this.dragComp]).getBoundingClientRect();
            let compX = rect.x + rect.width / 2;
            let compY = rect.y + rect.height / 2;

            let new_position = this.state.positions;
            new_position[this.dragComp] = [compX, compY];

            for (let i = 0; i < this.state.lines.length; i += 1) {
                let line = this.state.lines[i];
                if (line.state.id1 === this.dragComp) {
                    line.set1(compX, compY);
                } else if (line.state.id2 === this.dragComp) {
                    line.set2(compX, compY);
                }
            }
        }
        if (this.state.isMouseDown) this.refs.line.set2(this.state.mouseX, this.state.mouseY);
    }

    _onMouseClick(e) {
        this.setState({isMouseDown: true});
    }

    setCompFrom(comp) {
        console.log("From:" + comp.state.number);

        let rect = ReactDOM.findDOMNode(this.opobj[comp.state.number]).getBoundingClientRect();
        let compX = rect.x + rect.width / 2;
        let compY = rect.y + rect.height / 2;

        let new_position = this.state.positions;
        new_position[comp.state.number] = [compX, compY];
        this.setState({
            selectedcompX: compX,
            selectedcompY: compY,
            clickFrom: comp.state.number,
            isMouseDown: true,
            position: new_position,
        });
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
                if (this.state.graph.nodes[this.state.clickFrom] === "BranchDistSensor") {
                    this.opobj[this.state.clickFrom].setCompTo(comp.state.number);
                }
                let rect = ReactDOM.findDOMNode(this.opobj[comp.state.number]).getBoundingClientRect();
                let compX = rect.x + rect.width / 2;
                let compY = rect.y + rect.height / 2;

                let new_position = this.state.positions;
                new_position[comp.state.number] = [compX, compY];

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

    sendOperation() {
        if (this.state.carstate.left === 3 && this.state.carstate.right === 3) {
            this.connection.send("s");
        } else {
            const speed_array = [-255, -200, -150, 0, 150, 200, 255];
            this.connection.send("r" + speed_array[this.state.carstate.right].toString());
            this.connection.send("l" + speed_array[this.state.carstate.left].toString());
        }
    }

    stepProgram() {
        console.log("step");
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
                nextnode = 0;
                carstate.left = 3;
                carstate.right = 3;
                console.log("Program Terminated");
                clearInterval(this.interval);
                break;
            case "Wheel":
                let wheel = parseInt(attr.wheel, 10);
                let direction = parseInt(attr.direction, 10);
                let power = parseInt(attr.power, 10);
                let speed = 0;
                if (direction === 0) { // 順転
                    speed = 3 + power;
                } else { // 反転
                    speed = 3 - power;
                }
                if (wheel === 0) { // 左
                    carstate.left = speed;
                } else {
                    carstate.right = speed;
                }
                nextnode = nextedge[0];
                break;
            case "Waitmsecs":
                if (this.state.timercount * 10 > attr.time) {
                    nextnode = nextedge[0];
                    this.setState({
                        timercount: 0,
                    });
                } else {
                    nextnode = currentnode;
                    this.setState({
                        timercount: this.state.timercount + 1,
                    });
                }
                break;
            case "BranchDistSensor":
                let dist = parseInt(attr.dist, 10);
                if (dist > this.state.distsensordata) {
                    nextnode = this.opobj[currentnode].belowdstnode;
                } else {
                    nextnode = this.opobj[currentnode].abovedstnode;
                }
                break;
            case "Stop":
                carstate.left = 3;
                carstate.right = 3;
                break;
            default:
        }

        this.setState({
            currentnode: nextnode,
            carstate: carstate,
        });
    }

    onStartDrag(obj) {
        this.dragComp = obj.state.number;
        console.log("start drag:" + obj.state.number);
    }

    onStopDrag(obj) {
        this.dragComp = -1;
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
                    return (<Start key={index} number={index} running={running} funcs={this.funcs}/>);
                case "End":
                    return (<End key={index} number={index} running={running} funcs={this.funcs}/>);
                case "Wheel":
                    return (<Wheel key={index} number={index} running={running} funcs={this.funcs}/>);
                case "Waitmsecs":
                    return (<Waitmsecs key={index} number={index} running={running} funcs={this.funcs}/>);
                case "BranchDistSensor":
                    return (<BranchDistSensor key={index} number={index} running={running} funcs={this.funcs}/>);
                case "Stop":
                    return (<Stop key={index} number={index} running={running} funcs={this.funcs}/>);
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
                        <Line keys={this.nodes_num * node_from + index} x1={x1} y1={y1} id1={node_from} x2={x2} y2={y2}
                              id2={node_to} thickness={1} addLine={this.addLine.bind(this)} color="black"/>
                    );
                }));
        });
    }

    renderDebugWindow() {
        const mouseX = this.state.mouseX;
        const mouseY = this.state.mouseY;
        const isMouseDown = this.state.isMouseDown.toString();
        const currentnode = this.state.currentnode;
        const distsensordata = this.state.distsensordata;
        const leftsensordata = this.state.leftsensordata;
        const rightsensordata = this.state.rightsensordata;

        const leftspeed = this.state.carstate.left;
        const rightspeed = this.state.carstate.right;
        const timercount = this.state.timercount;
        const opobj = this.opobj;
        const positions = this.state.positions;
        return (
            <div>
                Debug Information
                <div>{mouseX} {mouseY} {isMouseDown}</div>
                <div>currentnode: {currentnode}</div>
                <div>distsensordata: {distsensordata}</div>
                <div>leftsensordata: {leftsensordata}</div>
                <div>rightsensordata: {rightsensordata}</div>
                <div>leftspeed: {leftspeed}</div>
                <div>rightspeed: {rightspeed}</div>
                <div>timercount: {timercount}</div>
                <div>opobj: {opobj.toString()}</div>
                <div>positions: {positions.toString()}</div>
                <div className="NodesInfo">
                    Nodes Information
                    <ol start="0">
                        {this.state.graph.nodes.map((node, index) => <li
                            key={index}>{node}:{JSON.stringify(this.state.graph.attributes[index], null, '\t')}</li>)}
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
            width: "95vw",
            height: "95vh",
            position: "relative",
            border: "solid",
            padding: "0 16px",
            margin: "0 auto"
        };

        const selectedcompX = this.state.selectedcompX;
        const selectedcompY = this.state.selectedcompY;

        const mouseX = this.state.mouseX;
        const mouseY = this.state.mouseY;

        return (
            <div>
                <div onMouseMove={this._onMouseMove.bind(this)} onMouseUp={() => {
                    this.setState({isMouseDown: false})
                }} style={style}>
                    <div>
                        <button onClick={() => {
                            this.addComponent("Wheel");
                        }}>Wheel
                        </button>
                        <button onClick={() => {
                            this.addComponent("Waitmsecs");
                        }}>Waitmsecs
                        </button>
                        <button onClick={() => {
                            this.addComponent("BranchDistSensor");
                        }}>BranchDistSensor
                        </button>
                        <button onClick={() => {
                            this.addComponent("Stop");
                        }}>Stop
                        </button>
                    </div>

                    <div>
                        <div> {this.renderEdges()} </div>
                        {this.renderOpComponents()}
                        <div>
                            {(() => {
                                if (this.state.isMouseDown) {
                                    return (<Line ref='line' x1={selectedcompX} y1={selectedcompY} id1={-1} x2={mouseX}
                                                  y2={mouseY} id2={-1} thickness={1} color="black"
                                                  addLine={this.addLine.bind(this)}/>);
                                }
                            })()}
                        </div>
                    </div>
                </div>
                <button onClick={this.runProgram.bind(this)}>実行</button>
                <button onClick={this.stopProgram.bind(this)}>やめる</button>
                <button onClick={() => {
                    this.connection = new WebSocket("ws:127.0.0.1:8000");
                }}>再接続
                </button>
                {this.renderDebugWindow()}
            </div>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));