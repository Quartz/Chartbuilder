// Svg text elements used to describe chart
var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");
var max = require("lodash/max");
var help = require("../../util/helper.js");
var ordinalAdjust = require("../../util/scale-utils").ordinalAdjust;

var DY = "0.32em";

var VerticalAxis = React.createClass({

	propTypes: {
		orient: PropTypes.string,
		width: PropTypes.number,
		yScale: PropTypes.func,
		offset: PropTypes.shape({
			x: PropTypes.number,
			y: PropTypes.number
		}),
		tickValues: PropTypes.array,
		tickFormat: PropTypes.func,
		prefix: PropTypes.string,
		suffix: PropTypes.string,
		tickWidths: PropTypes.shape({
			widths: PropTypes.array,
			max: PropTypes.number
		}),
		colorIndex: PropTypes.number,
		tickTextHeight: PropTypes.number
	},

	getDefaultProps: function() {
		return {
			orient: "left",
			offset: {
				x: 0,
				y: 0
			},
			tickFormat: function(d) { return d; },
			textAlign: "outside"
		}
	},

	_orientation: {
		"left": {
			transformTextX: function(width, textAlign, tickWidth, maxTickWidth) {
				if (textAlign === "inside") {
					return tickWidth * -1 + maxTickWidth;
				} else {
					return 0;
				}
			},
			textAnchor: {
				"inside": "end",
				"outside": "start",
			},
			transformRectX: function(textAlign, tickWidth, maxTickWidth) {
				return 0;
			}
		},
		"right": {
			transformTextX: function(width, textAlign, tickWidth, maxTickWidth) {
				if (textAlign === "inside") {
					return maxTickWidth * -1;
				} else {
					return tickWidth * -1;
				}
			},
			textAnchor: {
				"inside": "start",
				"outside": "end"
			},
			transformRectX: function(textAlign, tickWidth, maxTickWidth) {
				if (textAlign === "inside") {
					return maxTickWidth * -1;
				} else {
					return tickWidth * -1;
				}
			}
		}
	},

	_generateText: function(props) {
		var numTicks = props.tickValues.length;
		var concealerHeight = props.tickTextHeight + props.displayConfig.blockerRectOffset;
		var orientation = this._orientation[props.orient]
		var textAnchor = orientation.textAnchor[props.textAlign];

		return map(props.tickValues, function(tickValue, i) {
			var formatted = props.tickFormat(tickValue);
			var currTickWidth = props.tickWidths.widths[i];
			var maxTickWidth = Math.max(currTickWidth, props.tickWidths.max);

			var rectWidth;
			if (props.textAlign === "inside") {
				rectWidth = maxTickWidth + props.displayConfig.blockerRectOffset;
			} else {
				rectWidth = currTickWidth + props.displayConfig.blockerRectOffset
			}

			var textX = orientation.transformTextX(props.width, props.textAlign, currTickWidth, maxTickWidth);

			var text;
			if (i === (numTicks - 1)) {
				text = [props.prefix, formatted, props.suffix].join("");
			} else {
				text = formatted;
			}

			var transformY = ordinalAdjust(props.yScale, tickValue);

			return (
				<g
					key={i}
					className="concealer-label"
					transform={"translate(" + [0, transformY] + ")"}
				>
					<rect
						className="tick-blocker-rect"
						width={rectWidth}
						height={concealerHeight}
						x={orientation.transformRectX(props.textAlign, currTickWidth, maxTickWidth)}
						y={concealerHeight / -2}
					/>
					<text
						className="tick"
						x={textX} y={0} dy={DY}
					>
						{text}
					</text>
				</g>
			)

		});
	},

	render: function() {
		var props = this.props;
		var text = this._generateText(props);
		var transformGroup = (props.orient === "left") ? 0 : props.width;

		return (
			<g
				className={"axis vertical-axis color-index-" + props.colorIndex}
				style={{ font: props.tickFont }}
				transform={"translate(" + [transformGroup + props.offset.x, props.offset.y] + ")"}
			>
				{text}
			</g>
		);
	}

});

module.exports = VerticalAxis;
