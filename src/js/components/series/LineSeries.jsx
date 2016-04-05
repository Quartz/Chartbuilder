// Svg text elements used to describe chart
var React = require("react");
var PropTypes = React.PropTypes;
var line = d3.svg.line();

var LineSeries = React.createClass({

	propTypes: {
		data: PropTypes.array,
		xScale: PropTypes.func,
		yScale: PropTypes.func,
		altAxis: PropTypes.bool
	},

	render: function() {
		var props = this.props;

		var lineFunc = line
			.x(function(d) { return props.xScale(d.entry); })
			.y(function(d) { return props.yScale(d.value); });

		return (
			<path
				className={"series-line-path color-index-" + props.colorIndex}
				d={lineFunc(props.data)}
			/>
		);
	}

});

module.exports = LineSeries;
