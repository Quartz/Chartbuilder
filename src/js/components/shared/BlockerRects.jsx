// Svg text elements used to describe chart
var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");
var help = require("../../util/helper.js");
var ordinalAdjust = require("../../util/scale-utils").ordinalAdjust;

var DY = "0.32em";

var BlockerRect = React.createClass({

	propTypes: {
		orient: PropTypes.string,
		width: PropTypes.number,
		yScale: PropTypes.func,
		offset: PropTypes.number,
		tickValues: PropTypes.array,
		labelWidths: PropTypes.array,
		colorIndex: PropTypes.number,
		tickTextHeight: PropTypes.number
	},

	getDefaultProps: function() {
		return {
			orient: "left",
			offset: 0
		}
	},

	_getTransformX: function(orient, width) {
		if (orient == "left") {
			return 0;
		} else if (orient == "right") {
			return width;
		}
	},

	_generateRects: function(props) {
		var concealerHeight = props.tickTextHeight + props.displayConfig.blockerRectOffset;

		return map(props.data, function(label, i) {
			var rectX = (props.orient === "left") ? 0 : props.labelWidths[i] * -1;
			var xPos = props.xScale(Math.max(0, label.value));
			var yPos = ordinalAdjust(props.yScale, label.entry) - (concealerHeight / 2);

			var labelWidths = props.labelWidths[props.seriesNumber];
			var width = labelWidths[i] + props.displayConfig.blockerRectOffset * 2;
			return (
				<rect
					className="blocker-rect"
					key={i}
					width={width}
					height={concealerHeight}
					x={xPos}
					y={yPos}
				/>
			);
		});
	},

	render: function() {
		var props = this.props;
		var rects = this._generateRects(props);
		var transformX = this._getTransformX(props.orient, props.width);

		return (
			<g
				className="blocker-rect-group"
				transform={"translate(" + [transformX + props.offset, 0] + ")"}
			>
				{rects}
			</g>
		);
	}

});

module.exports = BlockerRect;
