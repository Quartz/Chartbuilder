var React = require("react");
var PropTypes = React.PropTypes;
var update = require("react-addons-update");
var clone = require("lodash/clone");

var ChartEditorMixin = require("../mixins/ChartEditorMixin");

// Chartbuilder UI components
var chartbuilderUI = require("chartbuilder-ui");
var ButtonGroup = chartbuilderUI.ButtonGroup;
var LabelledTangle = chartbuilderUI.LabelledTangle;
var TextInput = chartbuilderUI.TextInput;

var BubbleMobile = React.createClass({

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

module.exports = BubbleMobile;
