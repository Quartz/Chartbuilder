require("sugar-date");
var assign = require("lodash/assign");
var EventEmitter = require("events").EventEmitter;

/* Flux dispatcher */
var Dispatcher = require("../dispatcher/dispatcher");
var now = new Date();

var _session = {
	separators: detectNumberSeparators(),
	emSize: 10,
	width: 640,
	timerOn: (localStorage.hasOwnProperty("model") === true),
	nowOffset: getTZOffset(now),
	now: now
};

var CHANGE_EVENT = "change";

/**
 * ### SessionStore
 * Flux store for the current session, ie session data that persits regardless
 * interaction. Includes locale-aware settings and are unrelated to the actual
 * rendering of the chart.
*/
var SessionStore = assign({}, EventEmitter.prototype, {

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
	 * @return {any} - Return value at key `k`
	 * @instance
	 * @memberof SessionStore
	 */
	get: function(k) {
		return _session[k];
	},

	/**
	 * getAll
	 * @return {object} - Return all session data
	 * @instance
	 * @memberof SessionStore
	 */
	getAll: function() {
		return _session;
	}

});

function registeredCallback(payload) {
	var action = payload.action;

	switch(action.eventName) {
		case "start-timer":
			_session.timerOn = true;
			SessionStore.emitChange();
			break;

		case "stop-timer":
			_session.timerOn = false;
			SessionStore.emitChange();
			break;

		case "update-session":
			_session[action.key] = action.value;
			SessionStore.emitChange();
			break;

		default:
			// do nothing
	}

	return true;
}

// Get thousands and decimal separators based on locale
function detectNumberSeparators() {
	var n = 1000.50;
	var l = n.toLocaleString();
	var s = n.toString();
	var o = {
		decimal: l.substring(5,6),
		thousands: l.substring(1,2)
	};

	if (l.substring(5,6) == s.substring(5,6)) {
		o.decimal = ".";
	}
	if (l.substring(1,2) == s.substring(1,2)) {
		o.thousands = ",";
	}

	return o;
}

function getTZOffset(date) {
	var _offset = date.getUTCOffset().split("");
	_offset.splice(3, 0, ":")
	return _offset.join("");
}

SessionStore.dispatchToken = Dispatcher.register(registeredCallback);

module.exports = SessionStore;
