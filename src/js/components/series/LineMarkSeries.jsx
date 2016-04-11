// Svg text elements used to describe chart
var React = require("react");
var PropTypes = React.PropTypes;
var line = require("d3").svg.line();

var LineSeries = require("./LineSeries.jsx")
var MarkSeries = require("./MarkSeries.jsx")

var LineMarkSeries = React.createClass({

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
