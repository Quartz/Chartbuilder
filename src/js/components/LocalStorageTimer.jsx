const SessionStore = require("../stores/SessionStore");
const VisualViewActions = require("../actions/VisualViewActions");
const ChartbuilderLocalStorageAPI = require("../util/ChartbuilderLocalStorageAPI");

/* Node modules */
import React, {PropTypes} from 'react';
const cx = require("classnames");

/* Chartbuilder UI components */
import {Button} from 'chartbuilder-ui';
let timer;
const TIMER_DURATION = 300000;

/**
 * Button that persists for `TIMER_DURATION` and allows user to re-load the
 * chart currently saved in `localStorage`. On click, it updates the
 * `SessionStore`.
 */
const LocalStorageTimer = React.createClass({
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
		const className = cx({
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
