/*
 * Store the Chart's properties. These are properties relevant to the
 * rendering of the chart.
*/
import {assign} from 'lodash';
const EventEmitter = require("events").EventEmitter;

/* Flux dispatcher */
const Dispatcher = require("../dispatcher/dispatcher");
const SessionStore = require("./SessionStore");

/*
 * Each chart type has an associated parser, defined in its chartConfig
 * settings. The `ChartProptiesStore` is resposible for parsing the input before
 * sending parsed data back to the app, so we require the configs here.
*/
const mapConfig = require("../charts/maps/map-config");
const chartConfig = require("../charts/charts/chart-config");

/* Singleton that houses chart props */
let _chartProps = {};
const CHANGE_EVENT = "change";
let chartType;
const newLineRegex = /\r\n|\r|\n/;
/**
 * ### ChartProptiesStore.js
 * Flux store for chart properties such as data, settings, scale
*/
const VisualPropertiesStore = assign({}, EventEmitter.prototype, {

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
	 * @memberof VisualPropertiesStore
	 */
	get: function(k) {
		return _chartProps[k];
	},

	/**
	 * getAll
	 * @return {object} - Return all chartProps
	 * @instance
	 * @memberof VisualPropertiesStore
	 */
	getAll: function() {
		return _chartProps;
	},

	/**
	 * clear
	 * Set chartProps to empty
	 * @instance
	 * @memberof VisualPropertiesStore
	 */
	clear: function() {
		_chartProps = {};
	}

});

function registeredCallback(payload) {
	const action = payload.action;
	let parser;
	let config;
	let thisModel;

	switch(action.eventName) {
		/*
		* Receive a new model, which includes metadata. Respond by parsing input and
		* setting current `chartType`.
		*/
		case "receive-model":
			Dispatcher.waitFor([SessionStore.dispatchToken]);
			thisModel = action.model;
			chartType = thisModel.metadata.chartType;
			config = chartConfig[chartType] || mapConfig[chartType];
			parser = config.parser;
			_chartProps = parser(config, thisModel.chartProps, undefined, action.eventName);
			break;

		/*
		* Update all `chartProps`, assuming incoming payload is the entire object
		*/
		case "update-all-chart-props":
			config = chartConfig[chartType] || mapConfig[chartType];
			parser = config.parser;
			parser(config, action.chartProps, function(newProps) {
				_chartProps = newProps;
				VisualPropertiesStore.emitChange();
			});
			break;

		/*
		* Update a single key in the chartProps. As it is deeply nested the payload
		* is likely still an object
		*/
		case "update-chart-prop":
			_chartProps[action.key] = action.newProp;
			VisualPropertiesStore.emitChange();
			break;

		/*
		* Update a single key in the chartProps, and also reparse the input and
		* send back to the UI
		*/
		case "update-and-reparse":
			config = chartConfig[chartType] || mapConfig[chartType];
			parser = config.parser;

			_chartProps[action.key] = action.newProp;

			parser(config, _chartProps, function(newProps) {
				_chartProps = newProps;
				VisualPropertiesStore.emitChange();
			}, action.key, true, _chartProps.schema);

			break;

		case "update-data-input":
			config = chartConfig[chartType] || mapConfig[chartType];
			parser = config.parser;

			checkColumnChange(action.newProp.raw, function(columnsChanged) {
				_chartProps[action.key] = action.newProp;
				var parseOpts = { columnsChanged: columnsChanged };
				parser(config, _chartProps, function(newProps) {
					_chartProps = newProps;
					VisualPropertiesStore.emitChange();
				}, parseOpts);
			});
			break;

		default:
			// do nothing
	}
	return true;
}

function checkColumnChange(newInput, callback) {
	const newCols = newInput.split(newLineRegex)[0];
	const oldCols = _chartProps.input.raw.split(newLineRegex)[0];
	callback((newCols !== oldCols));
}

/* Respond to actions coming from the dispatcher */
VisualPropertiesStore.dispatchToken = Dispatcher.register(registeredCallback);

module.exports = VisualPropertiesStore;
