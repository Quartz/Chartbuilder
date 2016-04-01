var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");

var VerticalGridLines = React.createClass({

	propTypes: {
		scaleOptions: PropTypes.object,
		orient: PropTypes.string,
		height: PropTypes.number,
		scale: PropTypes.func
	},

	_generateTicks: function(props) {
		var scaleOptions = props.scaleOptions;
		return map(scaleOptions.dateTicks, function(tickValue, i) {
			var scalePos = props.scale(tickValue);
			return (
				<line
					key={i}
					className="tick"
					x1={scalePos}
					x2={scalePos}
					y1={props.height}
					y2="0"
				/>
			)
		});
	},

	render: function() {
		var ticks = this._generateTicks(this.props);

		return (
			<g className="grid-lines vertical-grid-lines" >
				{ticks}
			</g>
		);
	}

});

module.exports = VerticalGridLines;
