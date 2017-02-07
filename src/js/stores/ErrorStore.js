import {assign, clone, some, filter} from 'lodash';

const EventEmitter = require("events").EventEmitter;

/* Flux dispatcher */
const Dispatcher = require("../dispatcher/dispatcher");

const errorNames = require("../util/error-names");
const validateDataInput = require("../util/validate-data-input");
const validateMapDataInput = require("../util/validate-map-data-input");
const VisualPropertiesStore = require("./VisualPropertiesStore");

/* Singleton that houses errors */
let _errors = { valid: true, messages: [] };
const CHANGE_EVENT = "change";

/**
 * ### ErrorStore.js
 * Store for errors/warnings to users about the bad/dumb things they are
 * probably doing
*/
const ErrorStore = assign({}, EventEmitter.prototype, {

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
	 * @memberof ErrorStore
	 */
	get: function(k) {
		return _errors[k];
	},

	/**
	 * getAll
	 * @return {object} - Return all errors
	 * @instance
	 * @memberof ErrorStore
	 */
	getAll: function() {
		return clone(_errors);
	},

	/**
	 * clear
	 * Set errors to empty
	 * @instance
	 * @memberof ErrorStore
	 */
	clear: function() {
		_errors = {};
	}

});

/* Respond to actions coming from the dispatcher */
function registeredCallback(payload) {

	const action = payload.action;
	let error_messages;
	let isInvalid;
	let input_errors = [];
	let chartProps;

	switch(action.eventName) {
		/* *
		* Data input updated or reparse called
		* */

		case "update-and-reparse":

			Dispatcher.waitFor([VisualPropertiesStore.dispatchToken]);
			chartProps = VisualPropertiesStore.getAll();

			error_messages = [];
			if (chartProps.visualType === 'chart') {
				input_errors = validateDataInput(chartProps);
			}
			else if (chartProps.visualType === 'map') {
				input_errors = validateMapDataInput(chartProps);
			}
			error_messages = error_messages.concat(input_errors);

			_errors.messages = error_messages.map(function(err_name) {
				return errorNames[err_name];
			});

			isInvalid = some(_errors.messages, { type: "error" } );
			_errors.valid = !isInvalid;

			ErrorStore.emitChange();
			break;
		case "update-data-input":

			Dispatcher.waitFor([VisualPropertiesStore.dispatchToken]);
			chartProps = VisualPropertiesStore.getAll();

			error_messages = [];
			if (chartProps.visualType === 'chart') {
				input_errors = validateDataInput(chartProps);
			}
			else if (chartProps.visualType === 'map') {
				input_errors = validateMapDataInput(chartProps);
			}
			error_messages = error_messages.concat(input_errors);

			_errors.messages = error_messages.map(function(err_name) {
				return errorNames[err_name];
			});

			isInvalid = some(_errors.messages, { type: "error" } );
			_errors.valid = !isInvalid;

			ErrorStore.emitChange();
			break;
		case "receive-model":

			Dispatcher.waitFor([VisualPropertiesStore.dispatchToken]);
			chartProps = VisualPropertiesStore.getAll();

			error_messages = [];
			if (chartProps.visualType === 'chart') {
				input_errors = validateDataInput(chartProps);
			}
			else if (chartProps.visualType === 'map') {
				input_errors = validateMapDataInput(chartProps);
			}
			error_messages = error_messages.concat(input_errors);

			_errors.messages = error_messages.map(function(err_name) {
				return errorNames[err_name];
			});

			isInvalid = some(_errors.messages, { type: "error" } );
			_errors.valid = !isInvalid;

			ErrorStore.emitChange();
		default:
			// do nothing
	}

	return true;

}

/* Respond to actions coming from the dispatcher */
ErrorStore.dispatchToken = Dispatcher.register(registeredCallback);
module.exports = ErrorStore;
