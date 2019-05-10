import React from 'react';
import Draggable from 'react-draggable';

export default class OpComponent extends React.Component {
    constructor(props) {
        super(props);
        this.boxstyle = {
            width: 100,
            height: 50,
            left: 500,
            top: 340,
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

    render() {
        return (
            <Draggable cancel="strong" onDrag={this.props.handleDrag}>
                <div style={this.boxstyle} className="box">
                </div>
            </Draggable>
        );
    }
}

