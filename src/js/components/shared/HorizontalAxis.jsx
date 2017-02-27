// Svg text elements used to describe chart
import React, {PropTypes} from 'react';
import {map} from 'lodash';
const help = require("../../util/helper.js");
const ordinalAdjust = require("../../util/scale-utils").ordinalAdjust;

const DY = "0.32em"

const HorizontalAxis = React.createClass({

	propTypes: {
		prefix: PropTypes.string,
		suffix: PropTypes.string,
		orient: PropTypes.string,
		dimensions: PropTypes.object,
		xScale: PropTypes.func,
		tickValues: PropTypes.array,
		tickFormat: PropTypes.func,
		textAnchor: PropTypes.string
	},

	getInitialState: function() {
		return {
			lastTickWidth: 0,
			firstTickWidth: 0
		}
	},

	componentDidMount: function() {
		this._setTickWidths(this.props);
	},

	componentWillReceiveProps: function(nextProps) {
		this._setTickWidths(nextProps);
	},

	getDefaultProps: function() {
		return {
			orient: "bottom",
			tickFormat: function(d) { return d; },
			textAnchor: "middle",
			prefix: "",
			suffix: ""
		}
	},

	_setTickWidths: function(props) {
		const tickValues = props.tickValues;
		const lastTick = props.tickFormat(tickValues[tickValues.length - 1]);
		const firstTick = props.prefix + props.tickFormat(tickValues[0]);
		let lastTickWidth;
		let firstTickWidth;

		switch (props.textAnchor) {
			case 'middle':
				lastTickWidth = help.computeTextWidth(lastTick, props.tickFont) / 2;
				firstTickWidth = help.computeTextWidth(firstTick, props.tickFont) / 2;
				break;
			case 'start':
				lastTickWidth = help.computeTextWidth(lastTick, props.tickFont);
				firstTickWidth = 0;
				break;
			case 'end':
				lastTickWidth = 0;
				firstTickWidth = help.computeTextWidth(firstTick, props.tickFont);
				break;
			default:
				lastTickWidth = 0;
				firstTickWidth = 0;
				break;
		}

		if ((lastTickWidth !== this.state.lastTickWidth) || (firstTickWidth !== this.state.firstTickWidth)) {
			this.setState({
				lastTickWidth: lastTickWidth,
				firstTickWidth: firstTickWidth
			});
		};
	},

	_getTransformY: function(orient, height, yScale) {
		let yRange;
		if (yScale.rangeExtent) {
			yRange = yScale.rangeExtent();
		} else {
			yRange = yScale.range();
		}

		if (orient === "top") {
			return yRange[1];
		} else if (orient === "bottom") {
			return yRange[0];
		}
	},

	_generateTicks: function(props) {
		const lastTickWidth = this.state.lastTickWidth;

		return map(props.tickValues, function(tickValue, i) {
			let text;
			const formatted = props.tickFormat(tickValue)
			let xVal = ordinalAdjust(props.xScale, tickValue);

			// offset a tick label that is over the edge
			if (xVal + lastTickWidth > props.dimensions.width) {
				xVal += (props.dimensions.width - (xVal + lastTickWidth));
			}

			if (i === 0) {
				text = [props.prefix, formatted].join("");
			} else {
				text = formatted;
			}

			return (
				<text
					key={i}
					textAnchor={props.textAnchor}
					className={"tick orient-" + props.orient}
					x={xVal}
					y={0}
					dy={DY}
				>
					{text}
				</text>
			)
		});
	},

	_generateSuffix: function(props) {
		if (props.suffix !== "") {
			const suffX = props.xScale(props.tickValues[0]);
			const suffY = props.tickTextHeight + 10; // TODO: remove hardcodes
			return (
				<text
					className={"tick orient-" + props.orient}
					textAnchor="start"
					x={suffX}
					y={suffY}
					dy={DY}
					dx={this.state.firstTickWidth * -1}
				>
					{props.suffix}
				</text>
			)
		} else {
			return null;
		}
	},

	render: function() {
		const props = this.props;
		const ticks = this._generateTicks(props);
		const suffix = this._generateSuffix(props);
		const transformY = this._getTransformY(props.orient, props.dimensions.height, props.yScale);

		return (
			<g
				className="axis horizontal-axis"
				style={{ font: props.tickFont }}
				transform={"translate(" + [0, props.tickTextHeight + transformY + props.styleConfig.overtick_bottom] + ")"}
			>
				{ticks}
				{suffix}
			</g>
		);
	}

});

module.exports = HorizontalAxis;
