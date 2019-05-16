import React from 'react';
import ReactDOM from 'react-dom';

import Start from './opcomponent/start';
import End from './opcomponent/end';
import Stop from './opcomponent/stop';
import Wheel from './opcomponent/wheel';
import Waitmsecs from './opcomponent/waitmsecs';
import BranchDistSensor from './opcomponent/branchdistsensor';
import Readability from "./opcomponent/readability";

import Line from './line'
import Graph from './graph'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mouseX: 0,
            mouseY: 0,
            clickFrom: -1,
            clickTo: 0,
            isMouseDown: false,
            graph: new Graph(),
            toppositions: [[0, 0], [0, 0]],
            bottompositions: [[0, 0], [0, 0]],
            sensordata: {
                dist: 0,
                left: 0,
                right: 0,
            },
            dragcomp: 0,
            currentnode: 0,
            timercount: 0,
            interval: null,
            sendinterval: null,
            carstate: {
                left: 3,
                right: 3
            },
            isrunning: false,
        };

        // 動かしている最中のオブジェクトnumber
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

    onOpen(event) {
        console.log("Connect successful!");
        this.sendinterval = setInterval(this.sendOperation, 100);
    }

    onMessage(event) {
        let sensorarray = event.data.split(",").map(x => parseInt(x, 10));
        this.setState({
            sensordata: {
                dist: sensorarray[0],
                left: sensorarray[1],
                right: sensorarray[2],
            }
        });
    }

    addComponent(node_name) {
        const new_toppositions = Object.assign([], this.state.toppositions);
        const new_bottompositions = Object.assign([], this.state.bottompositions);
        new_toppositions.push([0, 0]);
        if (node_name !== "BranchDistSensor") {
            new_bottompositions.push([0, 0]);
        } else {
            new_bottompositions.push([[0, 0], [0, 0]]);
        }
        this.setState({
            toppositions: new_toppositions,
            bottompositions: new_bottompositions,
            graph: this.state.graph.addComponent(node_name),
        });
    }

    _onMouseMove(e) {
        if (this.dragComp !== -1 && this.dragComp !== undefined) {
            this.setOpCompPosition(this.dragComp);
        }
        this.setState({mouseX: e.clientX, mouseY: e.clientY});
    }

    _onMouseClick(e) {
        this.setState({isMouseDown: true});
    }

    setOpCompPosition(id) {
        let new_toppositions = this.state.toppositions;
        let new_bottompositions = this.state.bottompositions;

        new_toppositions[id] = this.opobj[id].getTopPosition();
        if (this.state.graph.nodes[id] !== "BranchDistSensor") {
            new_bottompositions[id] = this.opobj[id].getBottomPosition();
        } else {
            new_bottompositions[id][0] = this.opobj[id].getBottomAbovePosition();
            new_bottompositions[id][1] = this.opobj[id].getBottomBelowPosition();
        }

        this.setState({
            toppositions: new_toppositions,
            bottompositions: new_bottompositions,
        });
    }

    setCompFrom(comp) {
        console.log("From:" + comp.number);

        this.setOpCompPosition(comp.number);

        this.setState({
            clickFrom: comp.number,
            isMouseDown: true,
        });
    }


    setCompTo(comp) {
        console.log("From:" + this.state.clickFrom);
        console.log("To:" + comp.number);
        if (this.state.clickFrom === -1 || comp.number === this.state.clickFrom) {
            this.setState({
                isMouseDown: false,
            });
        } else {
            if ((this.state.graph.nodes[this.state.clickFrom] !== "BranchDistSensor" && this.state.graph.edges[this.state.clickFrom].length === 0) ||
                (this.state.graph.nodes[this.state.clickFrom] === "BranchDistSensor" && this.state.graph.edges[this.state.clickFrom].length <= 1)) {
                if (this.state.graph.nodes[this.state.clickFrom] === "BranchDistSensor") {
                    this.opobj[this.state.clickFrom].setBranch(comp.number);
                }
                this.setOpCompPosition(comp.number);

                this.setState({
                    clickTo: comp.number,
                    isMouseDown: false,
                    graph: this.state.graph.addEdge(this.state.clickFrom, comp.number),
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
        this.setState({
            isrunning: true,
        });
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
                this.setState({
                    isrunning: false,
                });
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
                if (dist > this.state.sensordata.dist) {
                    nextnode = this.opobj[currentnode].belowdstnode;
                } else {
                    nextnode = this.opobj[currentnode].abovedstnode;
                }
                break;
            case "Readability":
                nextnode = nextedge[0];
                console.log("fuga");
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
        this.dragComp = obj.number;
        console.log("start drag:" + obj.number);
    }

    onStopDrag(obj) {
        this.dragComp = -1;
    }

    stopProgram() {
        clearInterval(this.interval);
        this.setState({
            currentnode: 0,
            isrunning: false,
        });
    }


    setOpComponentAttribute(id, attr) {
        const new_graph = this.state.graph.setAttribute(id, attr);
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
                case "Readability":
                    return (<Readability key={index} number={index} running={running} funcs={this.funcs}/>);
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
                    let pos1 = [0, 0];
                    if (this.state.graph.nodes[node_from] !== "BranchDistSensor") {
                        pos1 = this.state.bottompositions[node_from];
                    } else {
                        if (node_to === this.opobj[node_from].abovedstnode) {
                            pos1 = this.state.bottompositions[node_from][0];
                        } else {
                            pos1 = this.state.bottompositions[node_from][1];
                        }
                    }

                    let pos2 = [0, 0];
                    pos2 = this.state.toppositions[node_to];
                    return (
                        <Line key={this.nodes_num * node_from + index} x1={pos1[0]} y1={pos1[1]} id1={node_from}
                              x2={pos2[0]} y2={pos2[1]}
                              id2={node_to} thickness={1} color="black"/>
                    );
                }));
        });
    }

    renderDebugWindow() {
        const {mouseX, mouseY, currentnode, timercount} = this.state;
        const isMouseDown = this.state.isMouseDown.toString();
        const distsensordata = this.state.sensordata.dist;
        const leftsensordata = this.state.sensordata.left;
        const rightsensordata = this.state.sensordata.right;

        const leftspeed = this.state.carstate.left;
        const rightspeed = this.state.carstate.right;
        const opobj = this.opobj;

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
                <div>toppositions: {this.state.toppositions.toString()}</div>
                <div>bottompositions: {this.state.bottompositions.toString()}</div>
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
            position: "static",
            border: "solid",
            padding: "0 16px",
            margin: "0 auto"
        };

        let selectedcomppos = [0, 0];
        if (this.state.clickFrom !== -1 && this.state.clickFrom !== undefined) {
            if (this.state.graph.nodes[this.state.clickFrom] !== "BranchDistSensor") {
                selectedcomppos = this.state.bottompositions[this.state.clickFrom];
            } else {
                if (this.opobj[this.state.clickFrom].selected_above) {
                    selectedcomppos = this.state.bottompositions[this.state.clickFrom][0];
                } else {
                    selectedcomppos = this.state.bottompositions[this.state.clickFrom][1];
                }
            }
        }

        const {mouseX, mouseY} = this.state;

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
                        <button onClick={() => {
                            this.addComponent("Readability");
                        }}>Readability
                        </button>
                    </div>
                    {this.renderEdges()}
                    {(() => {
                        if (this.state.isMouseDown) {
                            return (<Line x1={selectedcomppos[0]} y1={selectedcomppos[1]} id1={-1} x2={mouseX}
                                y2={mouseY} id2={-1} thickness={1} color="black" />);
                        }
                    })()}
                    {this.renderOpComponents()}
                </div>
                <button onClick={this.runProgram.bind(this)} disabled={this.state.isrunning}>実行</button>
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