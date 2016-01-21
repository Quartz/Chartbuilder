var React = require("react");
var PropTypes = React.PropTypes;
var update = require("react-addons-update");
var clone = require("lodash/clone");

var ChartEditorMixin = require("../mixins/ChartEditorMixin");
var XY_yScaleSettings = require("../shared/XY_yScaleSettings.jsx");

// Flux stores
//var ChartViewActions = require("../../actions/ChartViewActions");

// Chartbuilder UI components
var chartbuilderUI = require("chartbuilder-ui");
var ButtonGroup = chartbuilderUI.ButtonGroup;
var LabelledTangle = chartbuilderUI.LabelledTangle;
var TextInput = chartbuilderUI.TextInput;

var XYMobile = React.createClass({

	mixins: [ChartEditorMixin],

	_handleUpdate: function(k, v) {
		var newSetting = {};
		newSetting[k] = v;
		var newMobile = update(this.props.chartProps.mobile, { $merge: newSetting });
		this._handlePropUpdate("mobile", newMobile);
	},

	_handleScaleUpdate: function(k, v) {
		var newSetting = {};
		newSetting[k] = v;
		var newMobile = update(this.props.chartProps.mobile, { $merge: newSetting });
		this._handlePropAndReparse("mobile", newMobile);
	},

	_handleScaleReset: function() {
		var mobile = clone(this.props.chartProps.mobile);
		delete mobile.scale;
		this._handlePropAndReparse("mobile", mobile);
	},

	render: function() {
		var chartProps = this.props.chartProps;
		var scaleSettings = [];
		var scale = chartProps.mobile.scale || chartProps.scale;

		/* Y scale settings */
		scaleSettings.push(
			<XY_yScaleSettings
				scale={scale}
				className="scale-options"
				onUpdate={this._handleScaleUpdate.bind(null, "scale")}
				onReset={this._handleScaleReset}
				id="primaryScale"
				name="Primary"
				key="primaryScale"
				titleOverride="Mobile-specific primary axis settings"
				stepNumber = ""
			/>
		);

		/* render a second y scale component if altAxis is specified */
		if (chartProps._numSecondaryAxis > 0) {
			scaleSettings.push(
				<XY_yScaleSettings
					scale={scale}
					onUpdate={this._handleScaleUpdate.bind(null, "scale")}
					className="scale-options"
					onReset={this._handleScaleReset}
					id="secondaryScale"
					name="Secondary"
					key="secondaryScale"
					titleOverride="Mobile-specific secondary axis settings"
					stepNumber = ""
				/>
			);
		}

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
				{scaleSettings}
			</div>
		);
	}
});

module.exports = XYMobile;
