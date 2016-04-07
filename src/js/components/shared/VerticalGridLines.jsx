var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");

var VerticalGridLines = React.createClass({

	propTypes: {
		orient: PropTypes.string,
		dimensions: PropTypes.object,
		xScale: PropTypes.object
	},

	_generateTicks: function(props) {
		return map(props.xScale.ticks, function(tickValue, i) {
			var scalePos = props.xScale.scaleFunc(tickValue);
			return (
				<line
					key={i}
					className="tick"
					x1={scalePos}
					x2={scalePos}
					y1={props.dimensions.height}
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
