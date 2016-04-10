var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");

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
			return (
				<line
					key={i}
					className="tick"
					y1={scalePos}
					y2={scalePos}
					x1={x1}
					x2={props.dimensions.width}
				/>
			)
		});
	},

	render: function() {
		var ticks = this._generateTicks(this.props);

		return (
			<g className="grid-lines horizontal-grid-lines" >
				{ticks}
			</g>
		);
	}

});

module.exports = VerticalGridLines;
