var Dispatcher = require("flux").Dispatcher;
var assign = require("lodash/assign");

/**
 * Flux dispatcher handles incoming payloads and sends them to flux stores.
 * Usually data come from the UI, but can also come from localStorage or a
 * server
 * @class
 * @name ChartbuilderDispatcher
*/
var ChartbuilderDispatcher = assign(new Dispatcher(), {

	/**
	 * Incoming server action. Normally a localStorage object
	 * See `./actions/ChartServerActions.js`
	 * @param {Object} action { eventName: "string", <data>: <value>}
	 * @instance
	 * @memberof ChartbuilderDispatcher
	*/
	handleServerAction: function(action) {
		var payload = {
			source: "server-action",
			action: action
		};
		ChartbuilderDispatcher.dispatch(payload);
	},

	/**
	 * Incoming view action. Normally comes from a React component.
	 * See `./actions/ChartPropertiesActions.js`
	 * @param {Object} action { eventName: "string", <data>: <value>}
	 * @instance
	 * @memberof ChartbuilderDispatcher
	*/
	handleViewAction: function(action) {
		var payload = {
			source: "view-action",
			action: action
		};
		ChartbuilderDispatcher.dispatch(payload);
	}

});

module.exports = ChartbuilderDispatcher;
