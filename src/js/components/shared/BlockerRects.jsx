// Svg text elements used to describe chart
import React, {PropTypes} from 'react';
import {map} from 'lodash';
const help = require("../../util/helper.js");
const ordinalAdjust = require("../../util/scale-utils").ordinalAdjust;

const DY = "0.32em";

const BlockerRect = React.createClass({

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
		const concealerHeight = props.tickTextHeight + props.displayConfig.blockerRectOffset;

		return map(props.data, function(label, i) {
			const rectX = (props.orient === "left") ? 0 : props.labelWidths[i] * -1;
			const xPos = props.xScale(Math.max(0, label.value));
			const yPos = ordinalAdjust(props.yScale, label.entry) - (concealerHeight / 2);

			const labelWidths = props.labelWidths[props.seriesNumber];
			const width = labelWidths[i] + props.displayConfig.blockerRectOffset * 2;
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
		const props = this.props;
		const rects = this._generateRects(props);
		const transformX = this._getTransformX(props.orient, props.width);

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
