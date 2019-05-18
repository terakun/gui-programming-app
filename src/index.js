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

class TrashBox extends React.Component {
    constructor(props){
        super(props);
        this.boxstyle = {
            width: 100,
            height: 60,
            left: 40,
            top: 470,
            color: "#fff",
            background: "#333",
            position: "absolute",
            textAlign: "center",
            borderRadius: 4,
            WebkitUserSelect: "none",
        };
    }
    render() {
        return (
            <Panel style={this.boxstyle}>
                ゴミ箱
            </Panel>
        );
    }
}
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
            pwm: {
                left: [0, 150, 200, 255],
                right: [0, 150, 200, 255],
            },
            linesensor_threshold: 512,
            swaplinesensor: 0,
            swapmotor: 0,
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
        if(this.state.swaplinesensor === 0){
            this.setState({
                sensordata: {
                    dist: sensorarray[0],
                    left: sensorarray[1],
                    right: sensorarray[2],
                }
            });
        } else {
            this.setState({
                sensordata: {
                    dist: sensorarray[0],
                    left: sensorarray[2],
                    right: sensorarray[1],
                }
            });
        }
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
        if (!this.isBranchComp(id)) {
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

        if (!this.isBranchComp(comp.number)) {
            if(this.state.graph.edges[comp.number].length===1){
                this.setState({
                    graph:this.state.graph.deleteEdge(comp.number,this.state.graph.edges[comp.number][0]),
                });
            }
        } else {
            if(this.opobj[comp.number].abovedstnode !== null && this.opobj[comp.number].selected_above){
                this.setState({
                    graph: this.state.graph.deleteEdge(comp.number, this.opobj[comp.number].abovedstnode),
                });
                this.opobj[comp.number].abovedstnode = null;
            } else if (this.opobj[comp.number].belowdstnode !== null && !this.opobj[comp.number].selected_above){
                this.setState({
                    graph: this.state.graph.deleteEdge(comp.number, this.opobj[comp.number].belowdstnode),
                });
                this.opobj[comp.number].belowdstnode = null;
            }
        }

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
            if ((!this.isBranchComp(this.state.clickFrom) && this.state.graph.edges[this.state.clickFrom].length === 0) ||
                ( this.isBranchComp(this.state.clickFrom) && this.state.graph.edges[this.state.clickFrom].length <= 1)) {
                if (this.isBranchComp(this.state.clickFrom)) {
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
            let left_speed = this.state.pwm.left[leftstate.power];
            if(!leftstate.forward) left_speed = -left_speed;

            let right_speed = this.state.pwm.right[rightstate.power];
            if(!rightstate.forward) right_speed = -right_speed;

            if(this.state.swapmotor===1){
                this.connection.send("l" + (-right_speed).toString());
                this.connection.send("r" + (-left_speed).toString());
            } else {
                this.connection.send("r" + (-right_speed).toString());
                this.connection.send("l" + (-left_speed).toString());
            }
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
                let wheel = attr.wheel;
                let direction = attr.direction;
                let power = attr.power;
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
                let dist = attr.dist;
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
                    if (this.state.sensordata.right < this.state.linesensor_threshold) {
                        nextnode = this.opobj[currentnode].belowdstnode;
                    } else {
                        nextnode = this.opobj[currentnode].abovedstnode;
                    }
                } else {
                    if (this.state.sensordata.left < this.state.linesensor_threshold) {
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

    isBranchComp(id){
        return (this.state.graph.nodes[id] === "BranchDistSensor" || this.state.graph.nodes[id] === "LineSensor");
    }

    onStopDrag(obj) {
        let rect = ReactDOM.findDOMNode(obj).getBoundingClientRect();
        let rect_trash = ReactDOM.findDOMNode(this.refs.trashbox).getBoundingClientRect();
        let compX = rect.x + rect.width / 2;
        let compY = rect.y + rect.height / 2;
        let deletelist = [];
        let new_graph = this.state.graph;
        if(rect_trash.x <= compX && compX < rect_trash.x+rect_trash.width &&
           rect_trash.y <= compY && compY < rect_trash.y+rect_trash.height){
               let node_from = 0;
               for(let edge of this.state.graph.edges){
                   for(let node_to of edge){
                       if(node_to === obj.number){
                           if(this.isBranchComp(node_from)){
                               if(this.opobj[node_from].abovedstnode === node_to){
                                this.opobj[node_from].abovedstnode = null;
                               } else if(this.opobj[node_from].belowdstnode === node_to){
                                this.opobj[node_from].belowdstnode = null;
                               }
                           }
                           deletelist.push([node_from, node_to]);
                       } else if(node_from === obj.number){
                           deletelist.push([node_from, node_to]);
                       }
                   }
                   node_from++;
               }
               this.opobj[obj.number].disable();
               this.setState({
                   graph: new_graph.deleteEdges(deletelist),
               });
        }
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

    setPWMLeftValue(idx,e) {
        let left = this.state.pwm.left.slice();
        console.log(idx);
        left[idx] = e.target.value;
        this.setState({
            pwm : {
                left : left,
                right : this.state.pwm.right,
            }
        });
    }
    setPWMRightValue(idx,e) {
        let right = this.state.pwm.right.slice();
        right[idx] = e.target.value;
        this.setState({
            pwm : {
                left : this.state.pwm.left,
                right : right,
            }
        });
    }

    renderDebugWindow() {
        const {mouseX, mouseY, currentnode, timercount} = this.state;
        const isMouseDown = this.state.isMouseDown.toString();
        const distsensordata = this.state.sensordata.dist;
        const leftsensordata = this.state.sensordata.left;
        const rightsensordata = this.state.sensordata.right;
        const leftspeed = this.state.pwm.left[this.state.carstate.left.power];
        const rightspeed = this.state.pwm.right[this.state.carstate.right.power];
        const opobj = this.opobj;

        return (
            <div>
                Debug Information

                <div>タイヤ右
                    弱<input value={this.state.pwm.right[1]} onChange={this.setPWMRightValue.bind(this,1)} />
                    中<input value={this.state.pwm.right[2]} onChange={this.setPWMRightValue.bind(this,2)} />
                    強<input value={this.state.pwm.right[3]} onChange={this.setPWMRightValue.bind(this,3)} />
                </div>

                <div>タイヤ左
                    弱<input value={this.state.pwm.left[1]} onChange={this.setPWMLeftValue.bind(this,1)} />
                    中<input value={this.state.pwm.left[2]} onChange={this.setPWMLeftValue.bind(this,2)} />
                    強<input value={this.state.pwm.left[3]} onChange={this.setPWMLeftValue.bind(this,3)} />
                </div>
                <div>タイヤを入れ替える(1にする)<input placeholder={0} onChange={(e)=>{this.setState({swapmotor:parseInt(e.target.value,10)});}}/></div>

                <div>光センサ
                    <div>しきい値<input value={this.state.linesensor_threshold} onChange={(e)=>{this.setState({
                        linesensor_threshold: e.target.value,
                    })}} /></div>
                    <div>左右入れ替え(1にする)<input placeholder={0} onChange={(e)=>{this.setState({swaplinesensor:parseInt(e.target.value,10)});}}/></div>
                </div>
                <div>{mouseX} {mouseY} {isMouseDown}</div>
                <div>currentnode: {currentnode}</div>
                <div>distsensordata: {distsensordata}</div>
                <div>leftsensordata: {leftsensordata}</div>
                <div>rightsensordata: {rightsensordata}</div>
                <div>pwmleft:{this.state.pwm.left}</div>
                <div>pwmright:{this.state.pwm.right}</div>
                <div>threshold:{this.state.linesensor_threshold}</div>
                <div>swapmotor:{this.state.swapmotor}</div>
                <div>swapLineSensor:{this.state.swaplinesensor}</div>
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
            top: 10,
            width: "95vw",
            height: "85vh",
            position: "static",
            background: "#f0f0f0",
            border: "solid",
            padding: "10 16px",
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
                    <div style={{textAlign: "right"}}>
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
                    <TrashBox ref='trashbox'/>
                </Panel>
                <div>
                    <div style={{ textAlign: "right" }}>
                        <Button color="primary" variant="fab" onClick={this.runProgram.bind(this)} disabled={this.state.isrunning}>実行</Button>
                        <Button color="danger" variant="fab" onClick={this.stopProgram.bind(this)}>やめる</Button>
                        <Button color="accent" variant="fab" onClick={() => {
                            this.connection = new WebSocket("ws:127.0.0.1:8000");
                        }}>再接続
                    </Button>
                    </div>
                </div>
                <div>{this.renderDebugWindow()}</div>
            </div>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));