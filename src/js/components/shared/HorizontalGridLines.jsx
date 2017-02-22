var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");
var cx = require("classnames");
var ordinalAdjust = require("../../util/scale-utils").ordinalAdjust;

var VerticalGridLines = React.createClass({

	propTypes: {
		tickValues: PropTypes.array,
		orient: PropTypes.string,
		dimensions: PropTypes.object,
		yScale: PropTypes.func,
		offset: PropTypes.shape({
			x: PropTypes.number,
			y: PropTypes.number
		}),
	},

	getDefaultProps: function() {
		return {
			offset: {
				x: 0,
				y: 0
			}
		}
	},

	_getRangeExtent: function(scale) {
		if (scale.rangeExtent) {
			return scale.rangeExtent();
		} else {
			return scale.range();
		}
	},

	_generateTicks: function(props) {
		var getRange = this._getRangeExtent;

		return map(props.tickValues, function(tickValue, i) {
			var scalePos = ordinalAdjust(props.yScale, tickValue) + props.offset.y;
			var x1 = !isNaN(props.x1) ? props.x1 : props.translate[0] * -1;
			var className = cx("tick", { zero: (tickValue === 0) });
			return (
				<line
					key={i}
					className={className}
					y1={scalePos}
					y2={scalePos}
					x1={x1}
					x2={props.x2 || getRange(props.xScale)[1]}
				/>
			)
		});
	},

	render: function() {
		return (
			<g className="grid-lines horizontal-grid-lines">
				{this._generateTicks(this.props)}
			</g>
		);
	}

});

module.exports = VerticalGridLines;
