import React from 'react';
import Draggable from 'react-draggable';

export default class OpComponent extends React.Component {
    constructor(props) {
        super(props);
        this.number = this.props.number;

        this.setCompFrom = props.funcs.setCompFrom;
        this.setCompTo = props.funcs.setCompTo;

        props.funcs.addOpObj(this);

        this.boxstyle = {
            width: 100,
            height: 50,
            left: "auto",
            top: "auto",
            border: "solid",
            padding: "0 16px",
            color: "#000",
            background: "#fff",
            position: "relative",
            textAlign: "center",
            borderRadius: 4,
            WebkitUserSelect: "none",
        };
    }

    renderOpComp() {
        return ;
    }

    render(){
        if (this.props.x !== undefined) {
            this.boxstyle.left = this.props.x;
            this.boxstyle.top = this.props.y;
        }

        return (
            <Draggable bounds="parent" cancel="strong" onStart={() => { this.props.funcs.onStartDrag(this); }} onStop={() => { this.props.funcs.onStopDrag(this); }}>
                {this.renderOpComp()}
            </Draggable >
        );
    }
}

