// Svg text elements used to describe chart
import React, {PropTypes} from 'react';
const line = require("d3").svg.line();

const LineSeries = require("./LineSeries.jsx")
const MarkSeries = require("./MarkSeries.jsx")

const LineMarkSeries = React.createClass({

	propTypes: {
		data: PropTypes.array,
		xScale: PropTypes.func,
		yScale: PropTypes.func
	},

	render: function() {
		return (
			<g className="series line-mark-series">
				<LineSeries {...this.props} />
				<MarkSeries {...this.props} />
			</g>
		);
	}

});

module.exports = LineMarkSeries;
