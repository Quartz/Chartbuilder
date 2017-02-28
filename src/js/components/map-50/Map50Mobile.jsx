import React, {PropTypes} from 'react';
import {clone} from 'lodash';
import update from 'react-addons-update';

const ChartEditorMixin = require("../mixins/ChartEditorMixin");

// Chartbuilder UI components
// Chartbuilder UI components
import {ButtonGroup, LabelledTangle, TextInput} from 'chartbuilder-ui';

var ChoroMobile = React.createClass({

	mixins: [ChartEditorMixin],

	_handleUpdate: function(k, v) {
		var newSetting = {};
		newSetting[k] = v;
		var newMobile = update(this.props.chartProps.mobile, { $merge: newSetting });
		this._handlePropUpdate("mobile", newMobile);
	},

	render: function() {
		var chartProps = this.props.chartProps;
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
					placeholder={"Title"}
				/>
			</div>
		);
	}
});

module.exports = ChoroMobile;
