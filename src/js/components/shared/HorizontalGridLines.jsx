var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");
var cx = require("classnames");

var VerticalGridLines = React.createClass({

	propTypes: {
		tickValues: PropTypes.array,
		orient: PropTypes.string,
		dimensions: PropTypes.object,
		yScale: PropTypes.func
	},

	_generateTicks: function(props) {
		return map(props.tickValues, function(tickValue, i) {
			var scalePos = props.yScale(tickValue);
			var x1 = props.translate[0] * -1;
			var className = cx("tick", { zero: (tickValue === 0) });
			return (
				<line
					key={i}
					className={className}
					y1={scalePos}
					y2={scalePos}
					x1={x1}
					x2={props.dimensions.width}
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
