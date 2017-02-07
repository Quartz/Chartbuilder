/* Flux dispatcher */
var Dispatcher = require("../dispatcher/dispatcher");

/**
 * ### ChartViewActions
 * Send data from React views to Flux dispatcher, and on to the stores
*/
var ChartViewActions = {

	/**
	* Update all chart props
	* @param {Object} - `chartProps`
	*/
	updateAllChartProps: function(newChartProps) {
		Dispatcher.handleViewAction({
			eventName: "update-all-chart-props",
			chartProps: newChartProps
		});
	},

	/**
	* Update a single chart prop
	* @param {string} key - The key used to identify this property
	* @param {object} newProp - The property's value
	*/
	updateChartProp: function(key, newProp) {
		Dispatcher.handleViewAction({
			eventName: "update-chart-prop",
			key: key,
			newProp: newProp
		});
	},

	/**
	* Update a single chart prop and reparse the input
	* @param {string} key - The key used to identify this property
	* @param {object} newProp - The property's value
	*/
	updateAndReparse: function(key, newProp) {
		Dispatcher.handleViewAction({
			eventName: "update-and-reparse",
			newProp: newProp,
			key: key
		});
	},

	/**
	* Update a data input and reparse it
	* @param {string} key - The key used to identify this property
	* @param {object} newInput - The property's value
	*/
	updateInput: function(key, newInput) {
		Dispatcher.handleViewAction({
			eventName: "update-data-input",
			newProp: newInput,
			key: key
		});
	},

	/**
	* Update metadata
	* @param {object} newMetadata - The property's value
	*/
	updateMetadata: function(k, v) {
		Dispatcher.handleViewAction({
			eventName: "update-metadata",
			key: k,
			value: v
		});
	},

	updateSession: function(k, v) {
		Dispatcher.handleViewAction({
			eventName: "update-session",
			key: k,
			value: v
		})
	},

	startTimer: function() {
		Dispatcher.handleViewAction({
			eventName: "start-timer"
		});
	},

	stopTimer: function() {
		Dispatcher.handleViewAction({
			eventName: "stop-timer"
		});
	},
};

module.exports = ChartViewActions;
