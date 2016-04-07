var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");

var BarSeries = React.createClass({

	propTypes: {
		data: PropTypes.array,
		dimensions: PropTypes.object,
		xScale: PropTypes.object,
		yScale: PropTypes.func
	},

	render: function() {
		var props = this.props;
		var xRange = props.xScale.scaleFunc.range();
		var effectiveChartWidth = xRange[1] - xRange[0];
		var rectWidth = effectiveChartWidth / props.data.length;
		var yVal = props.yScale.range()[1];

		var rects = map(props.data, function(d, i) {
			var yVal = props.yScale(d.value);
			return (
				<rect
					key={i}
					width={rectWidth}
					y={yVal}
					x={rectWidth * i}
					height={props.dimensions.height - yVal}
					className={"color-index-" + props.colorIndex}
				/>
			);
		})
		return (
			<g className="bar-series">{rects}</g>
		);
	}

});

module.exports = BarSeries;
