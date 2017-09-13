// Label with the number for a bar.
// Currently only works for horiz bars
import React, {PropTypes} from 'react';
import {map} from 'lodash';

class BarLabels extends React.Component {

	// TODO: make this generic (for axis as well)
	_addPrefSuf (formattedLabel, i, numTicks, prefix, suffix) {
		if (i === 0) {
			return [prefix, formattedLabel, suffix].join("");
		} else {
			return formattedLabel;
		}
	}

	_getTransformY (ySc, tickValue) {
		return (ySc.bandwidth) ? ySc(tickValue) + ySc.bandwidth() / 2
						: ySc(tickValue);
	}

	render () {
		const props = this.props;
		const addPrefSuf = this._addPrefSuf;
		const numTicks = props.data.length;
		const getTransformY = this._getTransformY;

		const labels = map(props.data, function(d, i) {
			const formatted = props.formatLabel(d.value)
			const text = addPrefSuf(formatted, i, numTicks, props.prefix, props.suffix)
			const yPos = getTransformY(props.yScale, d.entry);
			return (
				<text
					key={i}
					className="bar-label"
					transform={"translate(" + props.translate + ")"}
					x={props.displayConfig.blockerRectOffset + props.xScale(Math.max(0, d.value))}
					y={yPos}
					dy={props.dy}
				>
					{text}
				</text>
			);
		});

		return (
			<g
				className="bar-labels"
				style={{ font: props.tickFont }}
			>
				{labels}
			</g>
		);
	}
};

BarLabels.propTypes = {
	text: PropTypes.string,
	translate: PropTypes.array,
	colorIndex: PropTypes.number,
	formatLabel: PropTypes.func
}

BarLabels.defaultProps = {
	translate: [0, 0],
	text: "BarLabels",
	colorIndex: 0,
	formatLabel: function(d) { return d; },
	dy: "0.35em"
}

module.exports = BarLabels;
