// Svg text elements used to describe chart
var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");

var MarkSeries = React.createClass({

	propTypes: {
		data: PropTypes.array,
		xScale: PropTypes.func,
		yScale: PropTypes.func
	},

	render: function() {
		var props = this.props;
		var radius = props.width * 0.005;
		var marks = map(props.data, function(d, i) {
			return (
				<circle
					key={i}
					r={radius}
					cx={props.xScale(d.entry)}
					cy={props.yScale(d.value)}
					className={"color-index-" + props.colorIndex}
				/>
			);
		})
		return (
			<g className="mark-series">{marks}</g>
		);
	}

});

module.exports = MarkSeries;
