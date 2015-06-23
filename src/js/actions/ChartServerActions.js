var Dispatcher = require("../dispatcher/dispatcher");

/**
 * ### ChartServerActions
 * Send data from some external API, usually localStorage in our case
*/
var ChartServerActions = {

	/**
	* Update the whole chart model
	* @param {Object} model
	* @param {object} model.chartProps
	* @param {object} model.metadata
	*/
	receiveModel: function(chartModel) {
		Dispatcher.handleServerAction({
			eventName: "receive-model",
			model: chartModel
		});
	}

};

module.exports = ChartServerActions;
