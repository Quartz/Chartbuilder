var test = require("tape");

var validateChartModel = require("../src/js/util/validate-chart-model");
var sample_model = require("./util/sample_model.json");

var incorrect_json = {
	chart: {
		data: [0,1,2,3,4,5]
	},
	meta: {
		title: "Incorrect"
	}
};

test("validate chart model", function(t) {
	t.plan(3);

	t.throws(function() {
		validateChartModel("NOT JSON");
	}, TypeError, "Throw if chart model is not valid JSON");

	t.throws(function() {
		validateChartModel(incorrect_json);
	}, TypeError, "Throw if chart model is JSON but not a valid Chartbuilder model");

	var validated = validateChartModel(JSON.stringify(sample_model));
	t.deepEqual(validated, sample_model, "Validator returns model if valid.");
});
