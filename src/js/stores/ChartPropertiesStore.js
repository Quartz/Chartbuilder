/*
 * Store the Chart's properties. These are properties relevant to the
 * rendering of the chart.
*/

var assign = require("lodash/assign");
var EventEmitter = require("events").EventEmitter;

/* Flux dispatcher */
var Dispatcher = require("../dispatcher/dispatcher");
var SessionStore = require("./SessionStore");

/*
 * Each chart type has an associated parser, defined in its chartConfig
 * settings. The `ChartProptiesStore` is resposible for parsing the input before
 * sending parsed data back to the app, so we require the configs here.
*/
var chartConfig = require("../charts/chart-config");

/* Singleton that houses chart props */
var _chartProps = {};
var CHANGE_EVENT = "change";
var chartType;
var newLineRegex = /\r\n|\r|\n/;

/**
 * ### ChartProptiesStore.js
 * Flux store for chart properties such as data, settings, scale
*/
var ChartPropertiesStore = assign({}, EventEmitter.prototype, {

	emitChange: function() {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener: function(callback) {
		this.on(CHANGE_EVENT, callback);
	},

	removeChangeListener: function(callback) {
		this.removeListener(CHANGE_EVENT, callback);
	},

	/**
	 * get
	 * @param k
	 * @return {any} - Return value at key `k`
	 * @instance
	 * @memberof ChartPropertiesStore
	 */
	get: function(k) {
		return _chartProps[k];
	},

	/**
	 * getAll
	 * @return {object} - Return all chartProps
	 * @instance
	 * @memberof ChartPropertiesStore
	 */
	getAll: function() {
		return _chartProps;
	},

	/**
	 * clear
	 * Set chartProps to empty
	 * @instance
	 * @memberof ChartPropertiesStore
	 */
	clear: function() {
		_chartProps = {};
	}

});

function registeredCallback(payload) {
	var action = payload.action;
	var parser;
	var config;

	switch(action.eventName) {
		/*
		* Receive a new model, which includes metadata. Respond by parsing input and
		* setting current `chartType`.
		*/
		case "receive-model":
			Dispatcher.waitFor([SessionStore.dispatchToken]);
			chartType = action.model.metadata.chartType;
			config = chartConfig[chartType];
			parser = chartConfig[chartType].parser;
			_chartProps = parser(config, action.model.chartProps);
			break;

		/*
		* Update all `chartProps`, assuming incoming payload is the entire object
		*/
		case "update-all-chart-props":
			parser = chartConfig[chartType].parser;
			config = chartConfig[chartType];
			parser(config, action.chartProps, function(newProps) {
				_chartProps = newProps;
				ChartPropertiesStore.emitChange();
			});
			break;

		/*
		* Update a single key in the chartProps. As it is deeply nested the payload
		* is likely still an object
		*/
		case "update-chart-prop":
			_chartProps[action.key] = action.newProp;
			ChartPropertiesStore.emitChange();
			break;

		/*
		* Update a single key in the chartProps, and also reparse the input and
		* send back to the UI
		*/
		case "update-and-reparse":
			parser = chartConfig[chartType].parser;
			config = chartConfig[chartType];
			_chartProps[action.key] = action.newProp;
			parser(config, _chartProps, function(newProps) {
				_chartProps = newProps;
				ChartPropertiesStore.emitChange();
			});
			break;

		case "update-data-input":
			parser = chartConfig[chartType].parser;
			config = chartConfig[chartType];

			checkColumnChange(action.newProp.raw, function(columnsChanged) {
				_chartProps[action.key] = action.newProp;
				var parseOpts = { columnsChanged: columnsChanged };
				parser(config, _chartProps, function(newProps) {
					_chartProps = newProps;
					ChartPropertiesStore.emitChange();
				}, parseOpts);
			});
			break;

		default:
			// do nothing
	}
	return true;
}

function checkColumnChange(newInput, callback) {
	var newCols = newInput.split(newLineRegex)[0];
	var oldCols = _chartProps.input.raw.split(newLineRegex)[0];
	callback((newCols !== oldCols));
}

/* Respond to actions coming from the dispatcher */
ChartPropertiesStore.dispatchToken = Dispatcher.register(registeredCallback);

module.exports = ChartPropertiesStore;
