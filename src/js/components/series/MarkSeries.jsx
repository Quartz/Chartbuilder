// Svg text elements used to describe chart
var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");
var ordinalAdjust = require("../../util/scale-utils").ordinalAdjust;

var MarkSeries = React.createClass({

	propTypes: {
		data: PropTypes.array,
		dimensions: PropTypes.object,
		dotRadiusFactor: PropTypes.number,
		xScale: PropTypes.func,
		yScale: PropTypes.func
	},

	getDefaultProps: function() {
		return { dotRadiusFactor: 0.007 }
	},

	render: function() {
		var props = this.props;
		var radius = props.dimensions.width * props.dotRadiusFactor;
		var marks = map(props.data, function(d, i) {
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

});

module.exports = MarkSeries;
