// Get data from and save to local storage

const MapServerActions = require("../actions/ChartServerActions");
const defaultInput = require("../config/mapconfig/default-input");
const mapConfig = require("../charts/maps/map-config");

module.exports = {
	defaultMap: function() {
		let default_model = mapConfig.map50.defaultProps;
		default_model.chartProps.input = {
			raw: defaultInput
		};

		MapServerActions.receiveModel(default_model);
	},

	getMap: function() {
		MapServerActions.receiveModel(JSON.parse(localStorage.getItem("model")));
	},

	saveMap: function(model) {
		localStorage.setItem("model", JSON.stringify(model));
	}
};

