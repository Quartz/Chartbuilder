
import React, {PropTypes} from 'react';
const d3scale = require("d3-scale");
import {assign, map, keys, reduce, range, isArray} from 'lodash';
const Rect = React.createFactory('rect');
const G = React.createFactory('g');

// parse props differently if bar is horizontal/vertical
const orientation_map = {
	vertical: {
		"ordinalScale": "xScale",
		"ordinalVal": "x",
		"ordinalSize": "width",
		"linearScale": "yScale",
		"linearVal": "y",
		"linearSize": "height",
		"linearCalculation": Math.max.bind(null, 0),
		"groupTransform": function(x) { return "translate(" + x + ",0)"; }
	},
	horizontal: {
		"ordinalScale": "yScale",
		"ordinalVal": "y",
		"ordinalSize": "height",
		"linearScale": "xScale",
		"linearVal": "x",
		"linearSize": "width",
		"linearCalculation": Math.min.bind(null, 0),
		"groupTransform": function(y) { return "translate(0," + y + ")"; }
	},
};

const BarGroup = React.createClass({

	propTypes: {
		dimensions: PropTypes.object,
		xScale: PropTypes.func,
		bars: PropTypes.array,
		orientation: PropTypes.oneOf(["vertical", "horizontal"])
	},

	getDefaultProps: function() {
		return {
			groupPadding: 0.2,
			orientation: "vertical"
		}
	},

	_makeBarProps: function(bar, i, mapping, linearScale, ordinalScale, size, offset) {
		const props = this.props;
		const barProps = { key: i, colorIndex: bar.colorIndex };
		barProps[mapping.ordinalVal] = ordinalScale(bar.entry);
		barProps[mapping.ordinalSize] = size;

		// linearVal needs to be negative if number is neg else 0
		// see https://bl.ocks.org/mbostock/2368837
		barProps[mapping.linearVal] = linearScale(mapping.linearCalculation(bar.value));
		barProps[mapping.linearSize] = Math.abs(linearScale(bar.value) - linearScale(0));
		return barProps;
	},

	render: function() {
		const props = this.props;
		const mapping = orientation_map[props.orientation];
		const numDataPoints = props.bars[0].data.length;
		const makeBarProps = this._makeBarProps;
		const groupInnerPadding = Math.max(0.2, (props.displayConfig.columnInnerPadding / numDataPoints));
		const outerScale = props[mapping.ordinalScale];
		const isOrdinal = outerScale.hasOwnProperty("bandwidth");
		let offset = 0;
		let innserSize;

		if (isOrdinal) {
			innerSize = outerScale.bandwidth();
		} else {
			innerSize = props.dimensions[mapping.ordinalSize] / numDataPoints;
		}

		const innerScale = d3scale.scaleBand().domain(range(props.bars.length))
			.rangeRound([0, innerSize], 0.2, groupInnerPadding);

		const rectSize = innerScale.bandwidth();

		if (!isOrdinal) { offset = innerSize / -2; }

		const groups = map(props.bars, function(bar, ix) {
			const groupProps = { "key": ix, className: "bar-series" };
			groupProps.transform = mapping.groupTransform(innerScale(ix) + offset);

			const rects = map(bar.data, function(d, i) {
				const linearScale = bar[mapping.linearScale] || props[mapping.linearScale];
				const ordinalOffset = innerScale(ix);
				const barProps = makeBarProps(d, i, mapping, linearScale, outerScale, rectSize, offset);
				barProps.className = "color-index-" + bar.colorIndex;

				return Rect(barProps);
			});

			return G(groupProps, rects);
		});

		return <g className="bar-series-group">{groups}</g>;
	}

});

module.exports = BarGroup;
