// Svg text elements used to describe chart
import React, {PropTypes} from 'react';
const line = require("d3").svg.line();
const ordinalAdjust = require("../../util/scale-utils").ordinalAdjust;

class LineSeries extends React.Component {
	render () {
		const props = this.props;
		const lineFunc = line
			.x((d) => { return ordinalAdjust(props.xScale, d.entry); })
			.y((d) => { return props.yScale(d.value); });

		return (
			<g className="series line-series">
				<path
					className={"series-line-path color-index-" + props.colorIndex}
					d={lineFunc(props.data)}
				/>
			</g>
		);
	}
};

LineSeries.propTypes = {
	data: PropTypes.array,
	xScale: PropTypes.func,
	yScale: PropTypes.func
}

module.exports = LineSeries;
