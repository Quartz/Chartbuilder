var test = require("tape");
var chartGenerators = require("./chart-generators");
var ChartServerActions = require("../src/js/actions/ChartServerActions");
var ChartViewActions = require("../src/js/actions/ChartViewActions");
var ChartPropertiesStore = require("../src/js/stores/ChartPropertiesStore");

function setupStore(callback) {
	ChartPropertiesStore.clear();
	callback(ChartPropertiesStore);
}

test("Chart properties store", function(t) {
	t.plan(3);

	setupStore(function(store) {
		t.deepEqual(store.getAll(), {}, "initial store returns an empty object");
	});

	setupStore(function(store) {
		ChartViewActions.updateChartProp("test_key", "test_value");
		t.equal(store.get("test_key"), "test_value", "set a single prop and get the same value from the store");
	});

	setupStore(function(store) {
		var randChart = chartGenerators.randChart();

		ChartServerActions.receiveModel(randChart);
		var _all = store.getAll();
		t.ok(_all.hasOwnProperty("data"), "load model into the properties store and parse input");
	});

	t.end();

});
