// Svg text elements used to describe chart
import React, {PropTypes} from 'react';
import {map, max} from 'lodash';
const help = require("../../util/helper.js");
const ordinalAdjust = require("../../util/scale-utils").ordinalAdjust;

const DY = "0.32em";

const _orientation = {
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
}

class VerticalAxis extends React.Component {

	_generateText (props) {
		const numTicks = props.tickValues.length;
		const concealerHeight = props.tickTextHeight + props.displayConfig.blockerRectOffset;
		const orientation = _orientation[props.orient]
		const textAnchor = orientation.textAnchor[props.textAlign];

		return map(props.tickValues, function(tickValue, i) {
			const formatted = props.tickFormat(tickValue);
			const currTickWidth = props.tickWidths.widths[i];
			const maxTickWidth = Math.max(currTickWidth, props.tickWidths.max);

			let rectWidth;
			if (props.textAlign === "inside") {
				rectWidth = maxTickWidth + props.displayConfig.blockerRectOffset;
			} else {
				rectWidth = currTickWidth + props.displayConfig.blockerRectOffset
			}

			const textX = orientation.transformTextX(props.width, props.textAlign, currTickWidth, maxTickWidth);

			let text;
			if (i === (numTicks - 1)) {
				text = [props.prefix, formatted, props.suffix].join("");
			} else {
				text = formatted;
			}

			const transformY = ordinalAdjust(props.yScale, tickValue);

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
	}

	render () {
		const props = this.props;
		const text = this._generateText(props);
		const transformGroup = (props.orient === "left") ? 0 : props.width;

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
};

VerticalAxis.propTypes = {
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
};

VerticalAxis.defaultProps = {
		orient: "left",
		offset: {
			x: 0,
			y: 0
		},
		tickFormat: (d) => { return d; },
		textAlign: "outside"
}

module.exports = VerticalAxis;
