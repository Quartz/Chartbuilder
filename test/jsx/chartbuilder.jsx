var React = require("react");
var ReactDOM = require("react-dom");
var d3 = require("d3");
var filter = require("lodash/filter");
var TU = require("react-addons-test-utils");
var test = require("tape");
var util = require("../util/util");

var chartGenerators = require("../chart-generators");
var ChartServerActions = require("../../src/js/actions/ChartServerActions");
var Chartbuilder = require("../../src/js/components/Chartbuilder.jsx");
var MockComponent = require("./MockComponent.jsx");

Chartbuilder.__set__({
	RendererWrapper: MockComponent,
	LocalStorageTimer: MockComponent,
	ChartExport: MockComponent
});

var randChart = util.randArrElement(require("../test-page/test_charts.json"));
ChartServerActions.receiveModel(randChart);

var cb = TU.renderIntoDocument(
	<Chartbuilder
		showSaveButton={true}
		showMobilePreview={true}
		onSave={function() { return; }}
	/>
);

test("Chartbuilder", function(t) {

	t.plan(1);

	var find_cb = TU.findRenderedDOMComponentWithClass(
		cb,
		"chartbuilder-main"
	);

	t.ok(find_cb, "Chartbuilder renders into DOM");

});

test("Chart type selector", function(t) {
	t.plan(1);
	var target_value;
	var buttons;
	var target_button;
	var active_button;

	var cb_dom = ReactDOM.findDOMNode(cb);
	var chartTypeSelectButtons = cb_dom.querySelectorAll(".chart-type-select > button");
	target_value = "chartgrid";

	target_button = filter(chartTypeSelectButtons, function(btn) {
		return (btn.value == target_value);
	})[0];

	TU.Simulate.click(target_button);

	active_button = filter(chartTypeSelectButtons, function(btn) {
		return /.*active$/.test(btn.className);
	})[0];

	t.equal(active_button.value, target_value, "chart type button updates new active type");
});

