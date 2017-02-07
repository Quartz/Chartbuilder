var SessionStore = require("../stores/SessionStore");
var VisualViewActions = require("../actions/VisualViewActions");
var ChartbuilderLocalStorageAPI = require("../util/ChartbuilderLocalStorageAPI");

/* Node modules */
var React = require("react");
var cx = require("classnames");
var PropTypes = React.PropTypes;

/* Chartbuilder UI components */
var chartbuilderUI = require("chartbuilder-ui");
var Button = chartbuilderUI.Button;
var timer;
var TIMER_DURATION = 30000;

/**
 * Button that persists for `TIMER_DURATION` and allows user to re-load the
 * chart currently saved in `localStorage`. On click, it updates the
 * `SessionStore`.
 */
var LocalStorageTimer = React.createClass({
	propTypes: {
		timerOn: PropTypes.bool.isRequired
	},

	_disableTimer: function() {
		clearTimeout(timer);
		VisualViewActions.stopTimer();
	},

	_handleLoadChart: function() {
		ChartbuilderLocalStorageAPI.getChart();
		this._disableTimer();
	},

	componentWillMount: function() {
		if (this.props.timerOn) {
			timer = setTimeout(function() {
				this._disableTimer();
			}.bind(this), TIMER_DURATION);
			VisualViewActions.startTimer();
		}
	},

	render: function() {
		var className = cx({
			"load-localstorage": true,
			"active": this.props.timerOn
		});

		return (
			<Button
				onClick={this._handleLoadChart}
				className={className}
				text={"Load previous chart"}
			/>
		);
	}
});

module.exports = LocalStorageTimer;
