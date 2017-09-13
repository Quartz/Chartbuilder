import React, {PropTypes} from 'react';
const d3scale = require("d3-scale");
import {map, reduce, isArray} from 'lodash';
const ordinal = require("d3").scale.ordinal;

class BarSeries extends React.Component {

	_createDataArray (data) {
		if (isArray(data[0])) {
			return data;
		}
		return [data];
	}

	render () {
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
};

BarSeries.propTypes = {
	data: PropTypes.array,
	dimensions: PropTypes.object,
	xScale: PropTypes.func,
	yScale: PropTypes.array // each bar can have different yscale
};

BarSeries.defaultProps = {
	groupPadding: 0.2
};

module.exports = BarSeries;
