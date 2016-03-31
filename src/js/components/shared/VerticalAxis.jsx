// Svg text elements used to describe chart
var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");
var help = require("../../util/helper.js");

var DY = "0.32em";

var VerticalAxis = React.createClass({

	propTypes: {
		scaleOptions: PropTypes.object,
		orient: PropTypes.string,
		width: PropTypes.number,
		scale: PropTypes.func,
		offset: PropTypes.number
	},

	getDefaultProps: function() {
		return {
			orient: "left",
			offset: 0
		}
	},

	_generateText: function(props) {
		var scaleOptions = props.scaleOptions;

		return map(scaleOptions.tickValues, function(tickValue, i) {

			var text;
			if (tickValue !== scaleOptions.domain[1]) {
				text = tickValue;
			} else {
				text = [scaleOptions.prefix, tickValue, scaleOptions.suffix].join("");
			}

			return (
				<text
					key={i}
					className={"tick orient-" + props.orient}
					x={0}
					y={props.scale(tickValue)}
					dy={DY}
				>
					{help.roundToPrecision(tickValue, scaleOptions.precision)}
				</text>
			)
		});

	},

	_getTransformX: function(orient, width) {
		if (orient == "left") {
			return 0;
		} else if (orient == "right") {
			return width;
		}
	},

	render: function() {
		var text = this._generateText(this.props);
		var transformX = this._getTransformX(this.props.orient, this.props.width);

		return (
			<g
				transform={"translate(" + [transformX + this.props.offset, 0] + ")"}
				className="axis vertical-axis"
			>
				{text}
			</g>
		);
	}

});

module.exports = VerticalAxis;
