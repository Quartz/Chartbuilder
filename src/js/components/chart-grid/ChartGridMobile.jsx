
import React, {PropTypes} from 'react';
import update from 'react-addons-update';

import {clone} from 'lodash';

const ChartEditorMixin = require("../mixins/ChartEditorMixin");
const XY_yScaleSettings = require("../shared/XY_yScaleSettings.jsx");
const ChartGrid_xScaleSettings = require("./ChartGrid_xScaleSettings.jsx");

// Chartbuilder UI components
import {ButtonGroup, LabelledTangle, TextInput} from 'chartbuilder-ui';

const ChartGridMobile = React.createClass({

	mixins: [ ChartEditorMixin ],

	getInitialState: function() {
		return {
			scale: this.props.chartProps.mobile.scale || this.props.chartProps.scale
		};
	},

	_handleUpdate: function(k, v) {
		const newSetting = {};
		newSetting[k] = v;
		const newMobile = update(this.props.chartProps.mobile, { $merge: newSetting });
		this._handlePropAndReparse("mobile", newMobile);
	},

	_handleScaleUpdate: function(k, v) {
		const scale = clone(this.state.scale, true);
		scale.primaryScale[k] = v;
		const newMobile = update(this.props.chartProps.mobile, {
			$merge: { scale: scale }
		});
		this._handlePropAndReparse("mobile", newMobile);
	},

	_handleScaleReset: function() {
		let mobile = clone(this.props.chartProps.mobile);
		delete mobile.scale;
		this._handlePropAndReparse("mobile", mobile);
	},

	componentWillReceiveProps: function(nextProps) {
		const scale = nextProps.chartProps.mobile.scale || nextProps.chartProps.scale;
		this.setState({ scale: scale });
	},

	render: function() {
		const chartProps = this.props.chartProps;

		const scaleSettings = [];
		scaleSettings.push(
			<TextInput
				className="scale-option"
				onChange={this._handleScaleUpdate.bind(null, "prefix")}
				value={this.state.scale.primaryScale.prefix}
				placeholder="Prefix"
				key="prefix"
			/>,
			<TextInput
				id="suffix"
				className="scale-option"
				onChange={this._handleScaleUpdate.bind(null, "suffix")}
				placeholder="Suffix"
				value={this.state.scale.primaryScale.suffix}
				key="suffix"
			/>
		);

		return (
			<div className="editor-options mobile-overrides">
				<h2>
					<span className="step-number">✭</span>
					Mobile settings
				</h2>
				<TextInput
					value={chartProps.mobile.title}
					className="mobile-option"
					onChange={this._handleUpdate.bind(null, "title")}
					placeholder={"Mobile-specific title"}
				/>
				{scaleSettings}
			</div>
		);
	}
});

module.exports = ChartGridMobile;
