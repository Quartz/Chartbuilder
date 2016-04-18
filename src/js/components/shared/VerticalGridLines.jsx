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

	_generateTicks: function(props) {
		return map(props.tickValues, function(tickValue, i) {
			var scalePos = props.xScale(tickValue);
			return (
				<line
					key={i}
					className={["tick", props.className].join(" ")}
					x1={scalePos}
					x2={scalePos}
					y1={props.y1 || 0}
					y2={props.y2 || props.dimensions.height + props.styleConfig.overtick_bottom}
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
