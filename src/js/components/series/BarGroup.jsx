var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");
var reduce = require("lodash/reduce");
var isArray = require("lodash/isArray");
var ordinal = require("d3").scale.ordinal;

var scale_map = {
	vertical: {
		"x": "xScale",
		"y": "yScale",
		"width": "width",
		"height": "height",
	},
	horizontal: {
		"x": "yScale",
		"y": "xScale",
		"width": "height",
		"height": "width",
	},
};

var BarGroup = React.createClass({

	propTypes: {
		dimensions: PropTypes.object,
		xScale: PropTypes.func,
		bars: PropTypes.array,
		orientation: PropTypes.oneOf(["vertical", "horizontal"])
	},

	getDefaultProps: function() {
		return {
			groupPadding: 0.2,
			orientation: "vertical"
		}
	},

	render: function() {
		var props = this.props;
		var numDataPoints = props.bars[0].data.length;
		var scales = scale_map[props.orientation];
		var xScaleKey = scale_map[props.orientation].x;
		var yScaleKey = scale_map[props.orientation].y;

		var innerWidth = props.dimensions.height / numDataPoints;
		var groupInnerPadding = Math.max(0.1, (props.displayConfig.columnInnerPadding / numDataPoints));

		var innerScale = ordinal().domain(Object.keys(props.bars))
			.rangeRoundBands([0, innerWidth], 0, groupInnerPadding);

		var rectWidth = innerScale.rangeBand();

		var groups = map(props.bars, function(bar, ix) {
			var rects = map(bar.data, function(d, i) {
				var yScale = bar[yScaleKey] || props[yScaleKey];
				var xScale = bar[xScaleKey] || props[xScaleKey];
				var yVal = yScale(d.value);
				return (
					<rect
						className={"color-index-" + bar.colorIndex}
						key={i}
						width={yVal}
						y={xScale(d.entry) + innerScale(ix) - innerWidth / 2}
						x={0}
						height={rectWidth}
					/>
				);
			})

			return <g key={ix} className="bar-series">{rects}</g>;
		});

		return <g className="bar-series-group">{groups}</g>;
	}

});

module.exports = BarGroup;
