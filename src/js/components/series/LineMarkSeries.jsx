// Svg text elements used to describe chart
import React, {PropTypes} from 'react';
const line = require("d3").svg.line();

const LineSeries = require("./LineSeries.jsx")
const MarkSeries = require("./MarkSeries.jsx")

class LineMarkSeries extends React.Component {
	render () {
		return (
			<g className="series line-mark-series">
				<LineSeries {...this.props} />
				<MarkSeries {...this.props} />
			</g>
		);
	}
};

LineMarkSeries.propTypes = {
	data: PropTypes.array,
	xScale: PropTypes.func,
	yScale: PropTypes.func
}


module.exports = LineMarkSeries;
