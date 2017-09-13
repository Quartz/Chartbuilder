import React, {PropTypes} from 'react';
import {map} from 'lodash';
const cx = require("classnames");
const ordinalAdjust = require("../../util/scale-utils").ordinalAdjust;

class VerticalGridLines extends React.Component {

	constructor(props) {
		super(props);
		this._generateTicks = this._generateTicks.bind(this);
		this._getRangeExtent = this._getRangeExtent.bind(this);
	}

	_getRangeExtent (scale) {
		if (scale.rangeExtent) {
			return scale.rangeExtent();
		} else {
			return scale.range();
		}
	}

	_generateTicks (props) {
		const getRange = this._getRangeExtent;

		return map(props.tickValues, function(tickValue, i) {
			const scalePos = ordinalAdjust(props.yScale, tickValue) + props.offset.y;
			const x1 = !isNaN(props.x1) ? props.x1 : props.translate[0] * -1;
			const className = cx("tick", { zero: (tickValue === 0) });
			return (
				<line
					key={i}
					className={className}
					y1={scalePos}
					y2={scalePos}
					x1={x1}
					x2={props.x2 || getRange(props.xScale)[1]}
				/>
			)
		});
	}

	render () {
		return (
			<g className="grid-lines horizontal-grid-lines">
				{this._generateTicks(this.props)}
			</g>
		);
	}
};

VerticalGridLines.propTypes = {
	tickValues: PropTypes.array,
	orient: PropTypes.string,
	dimensions: PropTypes.object,
	yScale: PropTypes.func,
	offset: PropTypes.shape({
		x: PropTypes.number,
		y: PropTypes.number
	}),
};

VerticalGridLines.defaultProps = {
	offset: {
		x: 0,
		y: 0
	}
};

module.exports = VerticalGridLines;
