var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");

var VerticalGridLines = React.createClass({

	propTypes: {
		scaleOptions: PropTypes.object,
		orient: PropTypes.string,
		width: PropTypes.number,
		scale: PropTypes.func
	},

	_generateTicks: function(props) {
		var scaleOptions = props.scaleOptions;
		return map(scaleOptions.tickValues, function(tickValue, i) {
			var scalePos = props.scale(tickValue);
			return (
				<line
					key={i}
					className="tick"
					y1={scalePos}
					y2={scalePos}
					x1={props.width}
					x2="18"
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
