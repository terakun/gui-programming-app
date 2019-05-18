import React from 'react';
import ReactDOM from 'react-dom'
import Draggable from 'react-draggable';

export default class OpComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            is_invalid: false,
        };

        this.number = this.props.number;

        this.setCompFrom = props.funcs.setCompFrom;
        this.setCompTo = props.funcs.setCompTo;

        props.funcs.addOpObj(this);

        this.boxstyle = {
            width: 100,
            height: 60,
            left: 500,
            top: 200,
            padding: "0 16px",
            color: "#000",
            background: "#fff",
            position: "absolute",
            textAlign: "center",
            borderRadius: 4,
            WebkitUserSelect: "none",
        };

        this.topstyle = {
            marginLeft: "auto",
            borderRadius: 4,
            border: "solid",
            color: "#f2df6b",
            background: "#f2df6b",
            position: "absolute",
            top: 0,
            left:0,
            right:0,
            margin:"auto",
        };

        this.bottomstyle = {
            marginLeft: "auto",
            borderRadius: 4,
            border: "solid",
            color: "#e174bb",
            background: "#e174bb",
            position: "absolute",
            bottom: 0,
            left:0,
            right:0,
            margin:"auto",
        };
    }

    disable(){
        this.setState({
            is_invalid:true,
        });
    }

    getTopPosition() {
        let rect = ReactDOM.findDOMNode(this.refs.top).getBoundingClientRect();
        let compX = rect.x + rect.width / 2;
        let compY = rect.y + rect.height / 2;
        return [compX,compY]
    }

    getBottomPosition() {
        let rect = ReactDOM.findDOMNode(this.refs.bottom).getBoundingClientRect();
        let compX = rect.x + rect.width / 2;
        let compY = rect.y + rect.height / 2;
        return [compX,compY]
    }

    renderOpComp() {
        return ;
    }

    render(){
        if (this.props.x !== undefined) {
            this.boxstyle.left = this.props.x;
            this.boxstyle.top = this.props.y;
        }

        if(this.state.is_invalid){
            return (
                <div style={{display:"none"}}></div>
            );
        }else{
            return (
                <Draggable bounds="parent" cancel="strong"
                    onStart={() => { this.props.funcs.onStartDrag(this); }}
                    onStop={() => { this.props.funcs.onStopDrag(this); }}>
                    {this.renderOpComp()}
                </Draggable >
            );
        }
    }
}
