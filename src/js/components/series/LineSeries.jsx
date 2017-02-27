// Svg text elements used to describe chart
import React, {PropTypes} from 'react';
const line = require("d3").svg.line();
const ordinalAdjust = require("../../util/scale-utils").ordinalAdjust;

const LineSeries = React.createClass({

	propTypes: {
		data: PropTypes.array,
		xScale: PropTypes.func,
		yScale: PropTypes.func
	},

	render: function() {
		const props = this.props;

		const lineFunc = line
			.x(function(d) { return ordinalAdjust(props.xScale, d.entry); })
			.y(function(d) { return props.yScale(d.value); });

		return (
			<g className="series line-series">
				<path
					className={"series-line-path color-index-" + props.colorIndex}
					d={lineFunc(props.data)}
				/>
			</g>
		);
	}

});

module.exports = LineSeries;
