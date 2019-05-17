import React from 'react';
import ReactDOM from 'react-dom';
import Button from 'muicss/lib/react/button';
import Panel from 'muicss/lib/react/panel';

import Start from './opcomponent/start';
import End from './opcomponent/end';
import Stop from './opcomponent/stop';
import Wheel from './opcomponent/wheel';
import Waitmsecs from './opcomponent/waitmsecs';
import BranchDistSensor from './opcomponent/branchdistsensor';
import LineSensor from './opcomponent/linesensor';
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
                left: {
                    forward: true,
                    power: 0,
                },
                right: {
                    forward: true,
                    power: 0,
                }
            },
            isrunning: false,
        };

        // 動かしている最中のオブジェクトnumber
        this.dragComp = -1;

        this.opobj = [];

        this.pwm= {
            left: [0,150, 200, 255],
            right: [0,150, 200, 255],
        };

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
        if (node_name !== "BranchDistSensor" && node_name !== "LineSensor") {
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
        if (this.state.graph.nodes[id] !== "BranchDistSensor" && this.state.graph.nodes[id] !== "LineSensor") {
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
            let compname = this.state.graph.nodes[this.state.clickFrom];
            if ((compname !== "BranchDistSensor" && compname !== "LineSensor" && this.state.graph.edges[this.state.clickFrom].length === 0) ||
                (( compname === "BranchDistSensor" || compname === "LineSensor" )&& this.state.graph.edges[this.state.clickFrom].length <= 1)) {
                if (compname === "BranchDistSensor" || compname === "LineSensor") {
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
            alert("繋がっていないパーツがあるよ");
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
        let leftstate = this.state.carstate.left;
        let rightstate = this.state.carstate.right;
        if ( leftstate.power === 0 && rightstate.power === 0) {
            this.connection.send("s");
            console.log("s");
        } else {
            let left_speed = this.pwm.left[leftstate.power];
            if(!leftstate.forward) left_speed = -left_speed;

            let right_speed = this.pwm.right[rightstate.power];
            if(!rightstate.forward) right_speed = -right_speed;

            this.connection.send("r" + right_speed.toString());
            this.connection.send("l" + left_speed.toString());
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
                carstate.left.power = 0;
                carstate.right.power = 0;
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
                let dir_power = {
                    forward: (direction === 0),
                    power: power,
                };
                if (wheel === 0) { // 左
                    carstate.left = dir_power;
                } else {
                    carstate.right = dir_power;
                }
                nextnode = nextedge[0];
                console.log("Wheel:"+power);
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
            case "LineSensor":
                let isright = attr.isright;
                console.log(isright);
                if(isright){
                    if (this.state.sensordata.right > this.linesensor_threshold) {
                        nextnode = this.opobj[currentnode].belowdstnode;
                    } else {
                        nextnode = this.opobj[currentnode].abovedstnode;
                    }
                } else {
                    if (this.state.sensordata.left > this.linesensor_threshold) {
                        nextnode = this.opobj[currentnode].belowdstnode;
                    } else {
                        nextnode = this.opobj[currentnode].abovedstnode;
                    }
                }
                break;
            case "Readability":
                nextnode = nextedge[0];
                console.log("fuga");
                break;
            case "Stop":
                carstate.left.power = 0;
                carstate.right.power = 0;
                nextnode = nextedge[0];
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
            timercount: 0,
            carstate: {
                left: {
                    forward: true,
                    power: 0,
                },
                right: {
                    forward: true,
                    power: 0,
                }
            },
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
                case "LineSensor":
                    return (<LineSensor key={index} number={index} running={running} funcs={this.funcs}/>);
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
                    if (this.state.graph.nodes[node_from] !== "BranchDistSensor" && this.state.graph.nodes[node_from] !== "LineSensor") {
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
                              id2={node_to} thickness={1} color="black" />
                    );
                }));
        });
    }

    setPWMvalue(idx,e) {

    }

    renderDebugWindow() {
        const {mouseX, mouseY, currentnode, timercount} = this.state;
        const isMouseDown = this.state.isMouseDown.toString();
        const distsensordata = this.state.sensordata.dist;
        const leftsensordata = this.state.sensordata.left;
        const rightsensordata = this.state.sensordata.right;
        const leftspeed = this.pwm.left[this.state.carstate.left.power];
        const rightspeed = this.pwm.right[this.state.carstate.right.power];
        const opobj = this.opobj;

        return (
            <div>
                Debug Information

                <div>タイヤ右
                    <div>弱<input value={this.pwm.right[1]} onChange={(e)=>{ this.pwm.right[1]=parseInt(e.target.value,10); }} /></div>
                    <div>中<input value={this.pwm.right[2]} onChange={(e)=>{ this.pwm.right[2]=parseInt(e.target.value,10); }} /></div>
                    <div>強<input value={this.pwm.right[3]} onChange={(e)=>{ this.pwm.right[3]=parseInt(e.target.value,10); }} /></div>
                </div>

                <div>タイヤ左
                    <div>弱<input value={this.pwm.left[1]} onChange={(e)=>{ this.pwm.left[1]=parseInt(e.target.value,10); }} /></div>
                    <div>中<input value={this.pwm.left[2]} onChange={(e)=>{ this.pwm.left[2]=parseInt(e.target.value,10); }} /></div>
                    <div>強<input value={this.pwm.left[3]} onChange={(e)=>{ this.pwm.left[3]=parseInt(e.target.value,10); }} /></div>
                </div>

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
            height: "90vh",
            position: "static",
            background: "#f0f0f0",
            border: "solid",
            padding: "0 16px",
            margin: "0 auto"
        };

        let selectedcomppos = [0, 0];
        if (this.state.clickFrom !== -1 && this.state.clickFrom !== undefined) {
            if (this.state.graph.nodes[this.state.clickFrom] !== "BranchDistSensor" &&
                this.state.graph.nodes[this.state.clickFrom] !== "LineSensor" ) {
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
                <Panel onMouseMove={this._onMouseMove.bind(this)} onMouseUp={() => {
                    this.setState({isMouseDown: false})
                }} style={style}>
                    <div>
                        <Button color="primary" onClick={() => {
                            this.addComponent("Wheel");
                        }}>車を動かす
                        </Button>
                        <Button color="primary" onClick={() => {
                            this.addComponent("Waitmsecs");
                        }}>待つ
                        </Button>
                        <Button color="primary" onClick={() => {
                            this.addComponent("BranchDistSensor");
                        }}>距離を測る
                        </Button>
                        <Button color="primary" onClick={() => {
                            this.addComponent("LineSensor");
                        }}>明るさを測る
                        </Button>
                        <Button color="primary" onClick={() => {
                            this.addComponent("Stop");
                        }}>車を止める
                        </Button>
                        <Button color="primary" onClick={() => {
                            this.addComponent("Readability");
                        }}>見やすくする
                        </Button>
                    </div>
                    {this.renderEdges()}
                    {(() => {
                        if (this.state.isMouseDown) {
                            return (<Line x1={selectedcomppos[0]} y1={selectedcomppos[1]} id1={-1} x2={mouseX}
                                y2={mouseY} id2={-1} thickness={1} color="black" />);
                        }
                    })()}
                    {this.renderOpComponents()}
                </Panel>
                <div style={{textAlign: "right"}}>
                    <Button color="primary" variant="fab" onClick={this.runProgram.bind(this)} disabled={this.state.isrunning}>実行</Button>
                    <Button color="danger" variant="fab" onClick={this.stopProgram.bind(this)}>やめる</Button>
                    <Button color="accent" variant="fab" onClick={() => {
                        this.connection = new WebSocket("ws:127.0.0.1:8000");
                    }}>再接続
                    </Button>
                </div>
                <div>{this.renderDebugWindow()}</div>
            </div>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));