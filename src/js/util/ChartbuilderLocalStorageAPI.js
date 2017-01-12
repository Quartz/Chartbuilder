// Get data from and save to local storage

var ChartServerActions = require("../actions/ChartServerActions");
var defaultInput = require("../config/default-input");
var chartConfig = require("../charts/chart-type-configs");
//var testInput = require("../../../test/util/test-input");

module.exports = {
	defaultChart: function() {
		var default_model = chartConfig.xy.defaultProps;
		default_model.chartProps.input = {
			//raw: testInput.init_data_time
			raw: defaultInput
		};

		ChartServerActions.receiveModel(default_model);
	},

	getChart: function() {
		ChartServerActions.receiveModel(JSON.parse(localStorage.getItem("model")));
	},

	saveChart: function(model) {
		localStorage.setItem("model", JSON.stringify(model));
	}
};

