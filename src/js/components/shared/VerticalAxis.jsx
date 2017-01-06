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
		suffix: PropTypes.string,
		tickWidths: PropTypes.array,
		colorIndex: PropTypes.number,
		tickTextHeight: PropTypes.number
	},

	getDefaultProps: function() {
		return {
			orient: "left",
			offset: 0,
			tickFormat: function(d) { return d; }
		}
	},

	_getTransformX: function(orient, width) {
		if (orient == "left") {
			return 0;
		} else if (orient == "right") {
			return width;
		}
	},

	_getTransformY: function(yScale, tickValue) {
		if (yScale.bandwidth) {
			return yScale(tickValue) + yScale.bandwidth() / 2;
		} else {
			return yScale(tickValue);
		}
	},

	_generateText: function(props) {
		var numTicks = props.tickValues.length;
		var getTransformY = this._getTransformY;
		var concealerHeight = props.tickTextHeight + props.displayConfig.blockerRectOffset;

		return map(props.tickValues, function(tickValue, i) {
			var formatted = props.tickFormat(tickValue)
			var rectX = (props.orient === "left") ? 0 : props.tickWidths[i] * -1;

			var text;
			if (i === (numTicks - 1)) {
				text = [props.prefix, formatted, props.suffix].join("");
			} else {
				text = formatted;
			}

			var transformY = getTransformY(props.yScale, tickValue);

			return (
				<g key={i} className="concealer-label"
					 transform={"translate(" + [0, transformY] + ")"}
				>
					<rect
						className="tick-blocker-rect"
						width={props.tickWidths[i] + props.displayConfig.blockerRectOffset}
						height={concealerHeight}
						x={rectX}
						y={concealerHeight / -2}
					/>
					<text className={"tick orient-" + props.orient} x={0} y={0} dy={DY} >
						{text}
					</text>
				</g>
			)

		});
	},

	render: function() {
		var props = this.props;
		var text = this._generateText(props);
		var transformX = this._getTransformX(props.orient, props.width);

		return (
			<g
				className={"axis vertical-axis color-index-" + props.colorIndex}
				style={{ font: props.tickFont }}
				transform={"translate(" + [transformX + props.offset, 0] + ")"}
			>
				{text}
			</g>
		);
	}

});

module.exports = VerticalAxis;
