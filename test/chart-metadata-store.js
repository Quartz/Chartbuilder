var test = require("tape");
var chartGenerators = require("./chart-generators");
var ChartServerActions = require("../src/js/actions/ChartServerActions");
var ChartViewActions = require("../src/js/actions/ChartViewActions");
var ChartMetadataStore = require("../src/js/stores/ChartMetadataStore");
var registeredCallback;

function setupStore(callback) {
	ChartMetadataStore.clear();
	callback(ChartMetadataStore);
}

test("Chart metadata store", function(t) {
	t.plan(3);

	setupStore(function(store) {
		t.deepEqual(store.getAll(), {}, "initial store returns an empty object");
	});

	setupStore(function(store) {
		ChartViewActions.updateMetadata("test_key", "test_value");
		t.equal(store.get("test_key"), "test_value", "set a single prop and get the same value from the store");
	});

	setupStore(function(store) {
		var randChart = chartGenerators.randChart();
		ChartServerActions.receiveModel(randChart);
		var _all = store.getAll();
		t.deepEqual(_all, randChart.metadata, "load random model into the metadata store");
		t.end();
	});

});
