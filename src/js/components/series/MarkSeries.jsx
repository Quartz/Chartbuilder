// Svg text elements used to describe chart
import React, {PropTypes} from 'react';
import {map} from 'lodash';
const ordinalAdjust = require("../../util/scale-utils").ordinalAdjust;

class MarkSeries extends React.Component {
	render () {
		const props = this.props;
		const radius = props.dimensions.width * props.dotRadiusFactor;
		const marks = map(props.data, function(d, i) {
			return (
				<circle
					key={i}
					r={radius}
					cx={ordinalAdjust(props.xScale, d.entry)}
					cy={props.yScale(d.value)}
					className={"color-index-" + props.colorIndex}
				/>
			);
		});

		return (
			<g className="series mark-series">{marks}</g>
		);
	}
};

MarkSeries.propTypes = {
	data: PropTypes.array,
	dimensions: PropTypes.object,
	dotRadiusFactor: PropTypes.number,
	xScale: PropTypes.func,
	yScale: PropTypes.func
};

MarkSeries.defaultProps = {
	dotRadiusFactor: 0.007
};

module.exports = MarkSeries;
