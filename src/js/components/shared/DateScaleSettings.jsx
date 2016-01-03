var React = require("react");
var clone = require("lodash/lang/clone");

var shallowEqual = require('react-addons-shallow-compare');
var PureRenderMixin = require("react-addons-pure-render-mixin");
var PropTypes = React.PropTypes;
var update = require("react-addons-update");

var chartbuilderUI = require("chartbuilder-ui");
var Dropdown = chartbuilderUI.Dropdown;

var dateParsers = require("../../util/process-dates").dateParsers;

var now = new Date();

/**
 * ### Date scale settings for a chart editor
 * @property {object} scale - Scale settings, which include date scale settings
 * @property {function} onUpdate - Callback to send selected date options back to parent
 * @property {string} stepNumber - Step in the editing process
 * @instance
 * @memberof editors
 */
var DateScaleSettings = React.createClass({

	propTypes: {
		scale: PropTypes.object.isRequired,
		onUpdate: PropTypes.func,
		stepNumber: PropTypes.string
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		var newStep = (this.props.stepNumber !== nextProps.stepNumber);
		if (newStep) {
			return true;
		}
		var newScale = !shallowEqual(this.props.scale.dateSettings, nextProps.scale.dateSettings);
		if (newScale) {
			return true;
		}
		return false;
	},

	_config: {
		// Use ids to look up appropriate date interval and number of steps
		// from `util/process-dates.js` on update
		dateFrequencyOptions: [
			{ value: "auto", content: "auto" },
			{ value: "1h", content: "1 hour" },
			{ value: "2h", content: "2 hours" },
			{ value: "3h", content: "3 hours" },
			{ value: "4h", content: "4 hours" },
			{ value: "6h", content: "6 hours" },
			{ value: "1d", content: "1 day" },
			{ value: "1w", content: "1 week" },
			{ value: "1m", content: "1 month" },
			{ value: "3m", content: "3 months" },
			{ value: "6m", content: "6 months" },
			{ value: "1y", content: "1 year" },
			{ value: "2y", content: "2 years" },
			{ value: "5y", content: "5 years" },
			{ value: "10y", content: "10 years" },
			{ value: "20y", content: "20 years" },
			{ value: "50y", content: "50 years" },
			{ value: "100y", content: "100 years" }
		],

		// Use ids to look up appropriate date formatter from `util/process-dates.js`
		dateFormatOptions: [
			{ value: "auto", content: "auto" },
			{ value: "lmdy", content: dateParsers["lmdy"](now) },
			{ value: "mmdd", content: dateParsers["mmdd"](now) },
			{ value: "Mdd", content: dateParsers["Mdd"](now) },
			{ value: "ddM", content: dateParsers["ddM"](now) },
			{ value: "M1d", content: dateParsers["M1d"](now) + " (months only on the 1st)" },
			{ value: "mmyy", content: dateParsers["mmyy"](now) },
			{ value: "yy", content: dateParsers["yy"](now) },
			{ value: "yyyy", content: dateParsers["yyyy"](now) },
			{ value: "QJan", content: "Q2 (Jan. FY)" },
			{ value: "QJul", content: "Q2 (July FY)"  },
			{ value: "MM", content: dateParsers["MM"](now) },
			{ value: "M", content: dateParsers["M"](now) },
			{ value: "hmm", content: dateParsers["hmm"](now) },
			{ value: "h", content: dateParsers["h"](now) }
		]
	},

	_handleDateScaleUpdate: function(k, v) {
		// update `scale.dateSettings`
		var dateSettings = clone(this.props.scale.dateSettings);
		dateSettings[k] = v;
		var scale = update(this.props.scale, { $merge: {
			dateSettings: dateSettings
		}});
		this.props.onUpdate(scale);
	},

	render: function() {
		var dateSettings = this.props.scale.dateSettings;

		return (
			<div className="scale-options scale-options-date">
				<h2 className="scale-option-title">
					<span className="step-number">{this.props.stepNumber}</span>
					Set the frequency and formatting of the bottom axis
				</h2>
				<div className="labelled-dropdown">
					<label className="editor-label date-setting">Date frequency</label>
					<Dropdown
						onChange={this._handleDateScaleUpdate.bind(null, "dateFrequency")}
						options={this._config.dateFrequencyOptions}
						value={dateSettings.dateFrequency}
					/>
				</div>
				<div className="labelled-dropdown">
					<label className="editor-label date-setting">Date format</label>
					<Dropdown
						onChange={this._handleDateScaleUpdate.bind(null, "dateFormat")}
						options={this._config.dateFormatOptions}
						value={dateSettings.dateFormat}
					/>
				</div>
			</div>
		)
	}

});

module.exports = DateScaleSettings;
