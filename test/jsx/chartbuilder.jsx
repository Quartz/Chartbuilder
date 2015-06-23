var React = require("react");
var d3 = require("d3");
var _ = require("lodash");
require("react/addons");
var TU = React.addons.TestUtils;
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

var randChart = util.randArrElement(require("../render/test_charts.json"));
ChartServerActions.receiveModel(randChart);
var cb = TU.renderIntoDocument(
	<Chartbuilder
		showSaveButton={true}
		showMobilePreview={true}
		onSave={function() { return; }}
	/>
);

test("Chartbuilder", function(t) {
	t.plan(2);

	var find_cb = TU.findRenderedDOMComponentWithClass(
		cb,
		"chartbuilder-main"
	);
	t.ok(find_cb, "Chartbuilder renders into DOM");

	var cb_state = find_cb.props.children[0]._owner.state;
	t.deepEqual(
		Object.keys(cb_state),
		["chartProps", "metadata", "session"],
		"Chartbuilder state loads from store"
	);

	t.end();
});

test("Chart type selector", function(t) {
	t.plan(2);
	var target_value;
	var buttons;
	var target_button;
	var active_button;

	var chartEditor = TU.findRenderedDOMComponentWithClass(
		cb,
		"chartbuilder-editor"
	);

	var chartTypeSelect = TU.findRenderedDOMComponentWithClass(
		chartEditor,
		"chart-type-select"
	);

	target_value = "chartgrid";

	buttons = TU.scryRenderedDOMComponentsWithTag(chartTypeSelect, "button");
	target_button = buttons.filter(function(btn) {
		return (btn.props.value == target_value);
	})[0];

	TU.Simulate.click(target_button);

	active_button = buttons.filter(function(btn) {
		return /.*active$/.test(btn.getDOMNode().className);
	})[0];

	t.equal(active_button.getDOMNode().value, target_value, "chart type button updates new active type");

	target_value = "xy";

	buttons = TU.scryRenderedDOMComponentsWithTag(chartTypeSelect, "button");
	target_button = buttons.filter(function(btn) {
		return (btn.props.value == target_value);
	})[0];

	TU.Simulate.click(target_button);

	active_button = buttons.filter(function(btn) {
		return /.*active$/.test(btn.getDOMNode().className);
	})[0];

	t.equal(active_button.getDOMNode().value, target_value, "chart type button updates active type");
});

