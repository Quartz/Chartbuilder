import React, {PropTypes} from 'react';
import update from 'react-addons-update';

import {clone} from 'lodash';
import {LabelledTangle, TextInput} from 'chartbuilder-ui';

const ScaleReset = require("../shared/ScaleReset.jsx");

/**
 * ### Chart grid xScale settings parent component
 * @name ChartGrid_xScaleSettings
 * @class
 * @property {object} scale - `chartProps.scale` object of the current chart.
 * See this component's PropTypes
 * @property {function} onUpdate - Pass the updated scale back to the parent
 * @property {string} className - CSS class to apply to this component
 * @property {string} stepNumber - Number to display in Editor interface
 * @example
 * <ChartGrid_xScaleSettings
 *  scale={chartProps.scale}
 *  onUpdate={this._handlePropAndReparse.bind(null, "scale")}
 *  className="scale-options"
 *  key="xScale"
 *  stepNumber="4"
 * />
*/
class ChartGrid_xScaleSettings extends React.Component {

	constructor (props) {
		super(props);
		this._handleDomainUpdate = this._handleDomainUpdate.bind(this);
		this._handleScaleUpdate = this._handleScaleUpdate.bind(this);
	}
	/**
	 * _handleScaleUpdate
	 * Apply new values to the `scale` object and pass it to the parent's callback
	 *
	 * @param {string} k - New scale property's key
	 * @param {*} v - New scale proptery's value
	 * @instance
	 * @memberof ChartGrid_xScaleSettings
	 */
	_handleScaleUpdate (k, v) {
		const primaryScale = clone(this.props.scale.primaryScale);
		primaryScale[k] = v;
		const scale = update(this.props.scale, {
			$merge: { primaryScale: primaryScale }
		});
		this.props.onUpdate(scale);
	}

	/**
	 * _handleDomainUpdate
	 * Update the domain with a new custom maximum or mimimum. Like
	 * `_handleScaleUpdate` this passes an updated scale object to the parent
	 *
	 * @param {string} k - Key of the domain object. Must be `"max"` or `"min"`
	 * @param {number} v - New domain value
	 * @instance
	 * @memberof ChartGrid_xScaleSettings
	 */
	_handleDomainUpdate (k, v) {
		const scale = clone(this.props.scale, true);
		scale.primaryScale.custom = true;
		if (k == "min") {
			scale.primaryScale.domain[0] = v;
		} else if (k == "max") {
			scale.primaryScale.domain[1] = v;
		}
		this.props.onUpdate(scale);
	}

	render () {
		const currScale = this.props.scale.primaryScale;
		const domain = currScale.domain;

		const tangleInputs = [
			<LabelledTangle
				label="Minimum"
				labelClass="editor-label"
				tangleClass="scale-option tangle-input"
				onChange={this._handleDomainUpdate.bind(null, "min")}
				onInput={this._handleDomainUpdate.bind(null, "min")}
				value={domain[0]}
				key="customMin"
			/>,
			<LabelledTangle
				label="Maximum"
				labelClass="editor-label"
				tangleClass="scale-option tangle-input"
				onChange={this._handleDomainUpdate.bind(null, "max")}
				onInput={this._handleDomainUpdate.bind(null, "max")}
				value={domain[1]}
				key="customMax"
			/>
		];

		let title_block = (
				<h2 className="scale-option-title">
					<span className="step-number">{this.props.stepNumber}</span>
					Set the units, max, and min of the {this.props.axis} axis
				</h2>
				)

		if(this.props.stepNumber == "") {
			title_block = (
				<h2 className="scale-option-title">
					Set the units, max, and min of the {this.props.axis} axis
				</h2>
				)
		}

		return (
			<div className={this.props.className}>
				{title_block}
				<TextInput
					className="scale-option"
					onChange={this._handleScaleUpdate.bind(null, "prefix")}
					value={currScale.prefix}
					placeholder="Prefix"
				/>
				<TextInput
					id="suffix"
					className="scale-option"
					onChange={this._handleScaleUpdate.bind(null, "suffix")}
					placeholder="Suffix"
					value={currScale.suffix}
				/>
				<div className="scale-tangle-inputs">
					{tangleInputs}
				</div>
				<ScaleReset
					scale={this.props.scale}
					onUpdate={this.props.onUpdate}
					scaleId={"primaryScale"}
					className="scale-reset"
				/>
			</div>
		);
	}
};

ChartGrid_xScaleSettings.propTypes = {
	scale: PropTypes.shape({
		primaryScale: PropTypes.shape({
			domain: PropTypes.arrayOf(React.PropTypes.number),
			precision: PropTypes.number,
			ticks: PropTypes.number,
			prefix: PropTypes.string.isRequired,
			suffix: PropTypes.string.isRequired
		}),
	}).isRequired
};

module.exports = ChartGrid_xScaleSettings;
