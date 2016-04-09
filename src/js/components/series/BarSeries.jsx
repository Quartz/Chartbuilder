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
		var innerWidth = props.dimensions.width / data[0].length;
		var innerScale = ordinal().domain(Object.keys(data)).rangeRoundBands([0, innerWidth])
		var rectWidth = innerScale.rangeBand();

		var rects = map(data, function(series, ix) {
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
