var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");
var reduce = require("lodash/reduce");
var isArray = require("lodash/isArray");
var ordinal = require("d3").scale.ordinal;

var BarGroup = React.createClass({

	propTypes: {
		dimensions: PropTypes.object,
		xScale: PropTypes.func,
		bars: PropTypes.array
	},

	getDefaultProps: function() {
		return {
			groupPadding: 0.2
		}
	},

	render: function() {
		var props = this.props;
		var numDataPoints = props.bars[0].data.length;
		var innerWidth = props.dimensions.width / numDataPoints;
		var groupInnerPadding = Math.max(0.1, (props.displayConfig.columnInnerPadding / numDataPoints));

		var innerScale = ordinal().domain(Object.keys(props.bars))
			.rangeRoundBands([0, innerWidth], 0, groupInnerPadding);

		var rectWidth = innerScale.rangeBand();

		var groups = map(props.bars, function(bar, ix) {
			var rects = map(bar.data, function(d, i) {
				var yScale = bar.yScale || props.yScale;
				var yVal = yScale(d.value);
				return (
					<rect
						className={"color-index-" + bar.colorIndex}
						key={i}
						width={rectWidth}
						y={yVal}
						x={props.xScale(d.entry) + innerScale(ix) - innerWidth / 2}
						height={props.dimensions.height - yVal}
					/>
				);
			})

			return <g key={ix} className="bar-series">{rects}</g>;
		});

		return <g className="bar-series-group">{groups}</g>;
	}

});

module.exports = BarGroup;
