// Svg text elements used to describe chart
var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");
var help = require("../../util/helper.js");

var DY = "0.32em";

var VerticalAxis = React.createClass({

	propTypes: {
		orient: PropTypes.string,
		width: PropTypes.number,
		yScale: PropTypes.func,
		offset: PropTypes.number,
		tickValues: PropTypes.array,
		tickFormat: PropTypes.func,
		prefix: PropTypes.string,
		suffix: PropTypes.string
	},

	getDefaultProps: function() {
		return {
			orient: "left",
			offset: 0,
			tickFormat: function(d) { return d; }
		}
	},

	_generateText: function(props) {
		var numTicks = props.tickValues.length;
		return map(props.tickValues, function(tickValue, i) {
			var formatted = props.tickFormat(tickValue)
			var text;
			if (i === (numTicks - 1)) {
				text = [props.prefix, formatted, props.suffix].join("");
			} else {
				text = formatted;
			}

			return (
				<text
					key={i}
					className={"tick orient-" + props.orient}
					x={0}
					y={props.scale(tickValue)}
					dy={DY}
				>
					{text}
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
				className="axis vertical-axis"
				transform={"translate(" + [transformX + this.props.offset, 0] + ")"}
			>
				{text}
			</g>
		);
	}

});

module.exports = VerticalAxis;
