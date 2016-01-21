var React = require("react");
var PropTypes = React.PropTypes;
var clone = require("lodash/clone");
var update = require("react-addons-update");

var ChartEditorMixin = require("../mixins/ChartEditorMixin");
var XY_yScaleSettings = require("../shared/XY_yScaleSettings.jsx");
var ChartGrid_xScaleSettings = require("./ChartGrid_xScaleSettings.jsx");

// Flux stores
//var ChartViewActions = require("../../actions/ChartViewActions");

// Chartbuilder UI components
var chartbuilderUI = require("chartbuilder-ui");
var ButtonGroup = chartbuilderUI.ButtonGroup;
var LabelledTangle = chartbuilderUI.LabelledTangle;
var TextInput = chartbuilderUI.TextInput;

var ChartGridMobile = React.createClass({

	mixins: [ ChartEditorMixin ],

	getInitialState: function() {
		return {
			scale: this.props.chartProps.mobile.scale || this.props.chartProps.scale
		};
	},

	_handleUpdate: function(k, v) {
		var newSetting = {};
		newSetting[k] = v;
		var newMobile = update(this.props.chartProps.mobile, { $merge: newSetting });
		this._handlePropAndReparse("mobile", newMobile);
	},

	_handleScaleUpdate: function(k, v) {
		var scale = clone(this.state.scale, true);
		scale.primaryScale[k] = v;
		var newMobile = update(this.props.chartProps.mobile, {
			$merge: { scale: scale }
		});
		this._handlePropAndReparse("mobile", newMobile);
	},

	_handleScaleReset: function() {
		var mobile = clone(this.props.chartProps.mobile);
		delete mobile.scale;
		this._handlePropAndReparse("mobile", mobile);
	},

	componentWillReceiveProps: function(nextProps) {
		var scale = nextProps.chartProps.mobile.scale || nextProps.chartProps.scale;
		this.setState({ scale: scale });
	},

	render: function() {
		var chartProps = this.props.chartProps;

		var scaleSettings = [];
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
