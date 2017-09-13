// Svg text elements used to describe chart
import React, {PropTypes} from 'react';
import {isNumber} from 'lodash';

class SeriesLabel extends React.Component {
	render () {
		const props = this.props;
		let x;

		if (isNumber(props.x)) {
			x = props.x;
		} else {
			x = props.xScale(props.xVal);
		}

		return (
			<text
				className={"series-label color-index-" + props.colorIndex}
				transform={"translate(" + props.translate + ")"}
				x={x}
			>
				{props.text}
			</text>
		);
	}
};

SeriesLabel.propTypes = {
	text: PropTypes.string,
	translate: PropTypes.array,
	colorIndex: PropTypes.number
};

SeriesLabel.defaultProps = {
	translate: [0, 0],
	text: "SeriesLabel",
	colorIndex: 0,
	xVal: 0
};

module.exports = SeriesLabel;
