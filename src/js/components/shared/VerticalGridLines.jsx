var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");

var VerticalGridLines = React.createClass({

	propTypes: {
		orient: PropTypes.string,
		dimensions: PropTypes.object,
		xScale: PropTypes.func,
		tickValues: PropTypes.array,
		y1: PropTypes.number,
		y2: PropTypes.number,
		className: PropTypes.string
	},

	// TODO: put this in scale-utils or somehwere bc also used by HorizontalGridLines
	_getRangeExtent: function(scale) {
		if (scale.rangeExtent) {
			return scale.rangeExtent();
		} else {
			return scale.range();
		}
	},

	// TODO: dont need to get range extent unless props.y1 and y2 absent
	_generateTicks: function(props) {
		var yRange = this._getRangeExtent(props.yScale);
		return map(props.tickValues, function(tickValue, i) {
			var scalePos = props.xScale(tickValue);
			return (
				<line
					key={i}
					className={["tick", props.className].join(" ")}
					x1={scalePos}
					x2={scalePos}
					y1={props.y1 || yRange[0] || 0}
					y2={props.y2 || yRange[1] || props.dimensions.height}
				/>
			)
		});
	},

	render: function() {
		return (
			<g className="grid-lines vertical-grid-lines">
				{this._generateTicks(this.props)}
			</g>
		);
	}

});

module.exports = VerticalGridLines;
