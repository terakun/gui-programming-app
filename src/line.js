import React from 'react';
import Panel from 'muicss/lib/react/panel';

export default class Line extends React.Component {
    render() {
        const {x1, x2, y1, y2, thickness, color} = this.props;

        const length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
        const cx = ((x1 + x2) / 2) - (length / 2);
        const cy = ((y1 + y2) / 2) - (thickness / 2);
        const angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);

        const style = {
            padding: 0,
            margin: 0,
            backgroundColor: "#000000",
            lineHeight: 1,
            position: "absolute",
            left: cx,
            top: cy,
            width: length,
            height: 3,
            MozTransform: `rotate(${angle}deg)`,
            WebkitTransform: `rotate(${angle}deg)`,
            OTransform: `rotate(${angle}deg)`,
            msTransform: `rotate(${angle}deg)`,
            transform: `rotate(${angle}deg)`,
        };
        return (
            <Panel style={style}/>
        );
    }
}


