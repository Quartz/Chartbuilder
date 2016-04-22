var React = require("react");
var clone = require("lodash/clone");
var map = require("lodash/map");

var shallowEqual = require('react-addons-shallow-compare');
var PureRenderMixin = require("react-addons-pure-render-mixin");
var PropTypes = React.PropTypes;
var update = require("react-addons-update");

var chartbuilderUI = require("chartbuilder-ui");
var Dropdown = chartbuilderUI.Dropdown;
var ButtonGroup = chartbuilderUI.ButtonGroup;

var dateParsers = require("../../util/process-dates").dateParsers;

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
			{ value: "lmdy", content: dateParsers["lmdy"] },
			{ value: "mmdd", content: dateParsers["mmdd"] },
			{ value: "Mdd", content: dateParsers["Mdd"] },
			{ value: "ddM", content: dateParsers["ddM"] },
			{ value: "M1d", content: dateParsers["M1d"] },
			{ value: "mmyy", content: dateParsers["mmyy"] },
			{ value: "yy", content: dateParsers["yy"] },
			{ value: "yyyy", content: dateParsers["yyyy"] },
			{ value: "QJan", content: "Q2 (Jan. FY)" },
			{ value: "QJul", content: "Q2 (July FY)"  },
			{ value: "MM", content: dateParsers["MM"] },
			{ value: "M", content: dateParsers["M"] },
			{ value: "hmm", content: dateParsers["hmm"] },
			{ value: "h", content: dateParsers["h"] }
		],

		timeDisplayOptions: [
			{ title: "As entered", content: "As entered", value: "as-entered" },
			{ title: "Localized", content: "Localized", value: "localized" }
		],

		timeZoneOptions: [
			{ value: "-05:00", content: "-05:00 New York EST / Chicago CDT"},
			{ value: "Z",      content: "+00:00 London GMT "},
			{ value: "+08:00", content: "+08:00 Beijing"},
			{ value: "+09:00", content: "+09:00 Tokyo"},
			{ value: "+01:00", content: "+01:00 Paris CET / London BST"},
			{ value: "+02:00", content: "+02:00 Tel Aviv / Paris CEST"},
			{ value: "+03:00", content: "+03:00 Moscow / Tel Aviv IDT"},
			// { value: "+03:30", content: "+03:30 Tehran"},
			{ value: "+04:00", content: "+04:00 Dubai"},
			// { value: "+04:30", content: "+04:30 Kabul"},
			{ value: "+05:00", content: "+05:00 Karachi"},
			// { value: "+05:30", content: "+05:00 Delhi"},
			// { value: "+05:45", content: "+05:45 Kathmandu"},
			{ value: "+06:00", content: "+06:00 Dhaka"},
			// { value: "+06:30", content: "+06:30 Yangon"},
			{ value: "+07:00", content: "+07:00 Bangkok"},
			// { value: "+08:30", content: "+08:30 Pyongyang"},
			// { value: "+09:30", content: "+09:30 Adelaide"},
			{ value: "+10:00", content: "+10:00 Sydney"},
			{ value: "+11:00", content: "+11:00 Sydney AEDT"},
			{ value: "+12:00", content: "+12:00 Auckland"},
			{ value: "+13:00", content: "+13:00 Auckland NZDT"},
			{ value: "+14:00", content: "+14:00"},
			{ value: "-01:00", content: "-01:00"},
			{ value: "-02:00", content: "-02:00"},
			{ value: "-03:00", content: "-03:00 Buenos Aires / Halifax ADT"},
			// { value: "-03:30", content: "-03:30 St. John's"},
			{ value: "-04:00", content: "-04:00 Halifax"},
			// { value: "-04:30", content: "-04:30 Caracas"},
			{ value: "-06:00", content: "-06:00 Chicago / Denver MDT"},
			{ value: "-07:00", content: "-07:00 Denver / Los Angeles PDT"},
			{ value: "-08:00", content: "-08:00 Los Angeles / Anchorage AKDT"},
			{ value: "-09:00", content: "-09:00 Anchorage"},
			{ value: "-10:00", content: "-10:00 Honolulu"},
			{ value: "-11:00", content: "-11:00"},
			{ value: "-12:00", content: "-12:00"}
		],

		showTimezoneFormats: ["hmm", "h", "auto"]
	},

	componentWillMount: function() {
		var props = this.props;

		var dateFormatOptions = map(this._config.dateFormatOptions, function(opt) {
			if (typeof opt.content === "function") {
				return {
					value: opt.value,
					content: opt.content(props.now)
				};
			} else {
				return opt;
			}
		});

		this.setState({ dateFormatOptions: dateFormatOptions });
	},

	localizeTimeZoneOptions: function(options, offset) {
		var customOpt = {
			value: offset,
			content: "The same as your timezone: " + offset
		};

		return [customOpt].concat(options.filter(function(opt) {
			return (opt.value !== offset);
		}));
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

	_showTimezoneSettings: function(dateFrequency) {
		return (this._config.showTimezoneFormats.indexOf(dateFrequency) > -1);
	},

	_generateTimezoneText: function(curMonth) {
		var tz_text = "";
		if(curMonth >= 3 && curMonth <= 11) {
			tz_text += "Many countries in the northern hemisphere are observing day light savings time right now" + (curMonth == 3 ? " or will be soon" : ". ");
		}
		else {
			tz_text += "Most countries in the northern hemisphere are on standard time right now. "
		}

		if(curMonth >= 9 || curMonth <= 4) {
			tz_text += "Some countries in the southern hemisphere are observing day light savings time right now" + (curMonth == 9 ? "or will be soon." : ".");
		}
		else {
			tz_text += "Most countries in the southern hemisphere are" + (curMonth == 3 ? " also " : " ") + "on standard time right now."
		}
	},

	render: function() {
		var dateSettings = this.props.scale.dateSettings;
		var showTimezoneSettings = this._showTimezoneSettings(dateSettings.dateFrequency);

		var timezoneSettings = null;
		if (showTimezoneSettings) {
			var tz_text = this._generateTimezoneText(this.props.now.getMonth());

			timezoneSettings = (
				<div>
					<div className="labelled-dropdown">
						<label className="editor-label date-setting">The timezone of your data is</label>
						<Dropdown
							onChange={this._handleDateScaleUpdate.bind(null, "inputTZ")}
							options={this.localizeTimeZoneOptions(this._config.timeZoneOptions, this.props.nowOffset)}
							value={dateSettings.inputTZ}
						/>
					</div>
					<p>{tz_text}</p>
					<div className="labelled-dropdown">
						<label className="editor-label date-setting">How should times appear?</label>
						<ButtonGroup
							className="button-group-wrapper"
							onClick={this._handleDateScaleUpdate.bind(null, "displayTZ")}
							buttons={this._config.timeDisplayOptions}
							value={dateSettings.displayTZ}
						/>
					</div>
				</div>
			);
		}

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
						options={this.state.dateFormatOptions}
						value={dateSettings.dateFormat}
					/>
				</div>
				{timezoneSettings}
			</div>
		)
	}

});

module.exports = DateScaleSettings;
