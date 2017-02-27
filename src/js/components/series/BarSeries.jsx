import React, {PropTypes} from 'react';
const d3scale = require("d3-scale");
import {map, reduce, isArray} from 'lodash';
const ordinal = require("d3").scale.ordinal;

const BarSeries = React.createClass({

	propTypes: {
		data: PropTypes.array,
		dimensions: PropTypes.object,
		xScale: PropTypes.func,
		yScale: PropTypes.array // each bar can have different yscale
	},

	getDefaultProps: function() {
		return {
			groupPadding: 0.2
		}
	},

	_createDataArray: function(data) {
		if (isArray(data[0])) {
			return data;
		} else {
			return [data];
		}
	},

	render: function() {
		const props = this.props;
		const data = this._createDataArray(props.data);
		const numDataPoints = data[0].length;
		const innerWidth = props.dimensions.width / numDataPoints;
		const groupOuterPadding = Math.max(0.1, (1.6 / numDataPoints));

		const innerScale = ordinal().domain(Object.keys(data))
		.rangeRoundBands([0, innerWidth], 0, groupOuterPadding);

		const rectWidth = innerScale.rangeBand();

		const rects = map(bars, function(bar, ix) {
			return map(series, function(d, i) {
				const yVal = props.yScale[ix](d.value);
				return (
					<rect
						key={i}
						width={rectWidth}
						y={yVal}
						x={props.xScale(d.entry) + innerScale(ix) - innerWidth / 2}
						height={props.dimensions.height - yVal}
						className={"color-index-" + props.colorIndex[ix]}
					/>
				);
			})
		})
		return (
			<g className="bar-series">{rects}</g>
		);
	}

});

module.exports = BarSeries;
