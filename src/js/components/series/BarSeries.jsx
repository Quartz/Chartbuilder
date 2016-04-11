var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");
var reduce = require("lodash/reduce");
var isArray = require("lodash/isArray");
var ordinal = require("d3").scale.ordinal;

var BarSeries = React.createClass({

	propTypes: {
		data: PropTypes.array,
		dimensions: PropTypes.object,
		xScale: PropTypes.func,
		yScale: PropTypes.array // each bar can have different yscale
	},

	getDefaultProps: function() {
		return {
			groupPadding: 0.2
		}
	},

	_createDataArray: function(data) {
		if (isArray(data[0])) {
			return data;
		} else {
			return [data];
		}
	},

	render: function() {
		var props = this.props;
		var data = this._createDataArray(props.data);
		var numDataPoints = data[0].length;
		var innerWidth = props.dimensions.width / numDataPoints;
		var groupOuterPadding = Math.max(0.1, (1.6 / numDataPoints));

		var innerScale = ordinal().domain(Object.keys(data))
		.rangeRoundBands([0, innerWidth], 0, groupOuterPadding);

		var rectWidth = innerScale.rangeBand();

		var rects = map(bars, function(bar, ix) {
			return map(series, function(d, i) {
				var yVal = props.yScale[ix](d.value);
				return (
					<rect
						key={i}
						width={rectWidth}
						y={yVal}
						x={props.xScale(d.entry) + innerScale(ix) - innerWidth / 2}
						height={props.dimensions.height - yVal}
						className={"color-index-" + props.colorIndex[ix]}
					/>
				);
			})
		})
		return (
			<g className="bar-series">{rects}</g>
		);
	}

});

module.exports = BarSeries;
