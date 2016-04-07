// Svg text elements used to describe chart
var React = require("react");
var PropTypes = React.PropTypes;
var line = d3.svg.line();

var LineSeries = React.createClass({

	propTypes: {
		data: PropTypes.array,
		xScale: PropTypes.object,
		yScale: PropTypes.func
	},

	render: function() {
		var props = this.props;

		var lineFunc = line
			.x(function(d) { return props.xScale.scaleFunc(d.entry); })
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
