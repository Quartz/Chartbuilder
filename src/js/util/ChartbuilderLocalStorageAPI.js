// Get data from and save to local storage

var VisualServerActions = require("../actions/VisualServerActions");
var defaultInput = require("../config/chartconfig/default-input");
var chartConfig = require("../charts/charts/chart-config");
//var testInput = require("../../../test/util/test-input");

module.exports = {
	defaultChart: function() {
		var default_model = chartConfig.xy.defaultProps;
		default_model.chartProps.input = {
			raw: defaultInput
		};

		VisualServerActions.receiveModel(default_model);
	},

	getChart: function() {
		VisualServerActions.receiveModel(JSON.parse(localStorage.getItem("model")));
	},

	saveChart: function(model) {
		localStorage.setItem("model", JSON.stringify(model));
	}
};

