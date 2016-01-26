var test = require("tape");

var React = require("react");
var ReactDOM = require("react-dom");

var d3 = require("d3");
var _ = require("lodash");
var TU = require("react-addons-test-utils");
var util = require("../util/util");

var RendererWrapper = require("../../src/js/components/RendererWrapper.jsx");

var class_type_lookup = {
	"lines": "lines",
	"column": "bar",
	"scatterPlot": "circles"
};

var test_charts = require("../test-page/test_charts.json");
var xy_grids = _.filter(test_charts, function(chart) {
	if (chart.metadata.chartType === "chartgrid") {
		return /line|scatterPlot|column/.test(chart.chartProps._grid.type);
	} else {
		return false;
	}
});
var randXYGrid = util.randArrElement(xy_grids);

test("Renderer: Chart grid XY", function(t) {
	//t.plan(6);

	var rw = TU.renderIntoDocument(
		<RendererWrapper
			width={640}
			editable={false}
			model={randXYGrid}
			enableResponsive={false}
			showMetadata={true}
		/>
	);

	var svg = TU.findRenderedDOMComponentWithTag(
		rw,
		"svg"
	);

	t.ok(TU.isDOMComponent(svg), "svg rendered to DOM");

	var svg_dom = ReactDOM.findDOMNode(svg);
	var d3svg = d3.select(svg_dom);

	var num_series = randXYGrid.chartProps._grid.cols * randXYGrid.chartProps._grid.rows;
	var num_vals = _.reduce(randXYGrid.chartProps.data, function(numVals, d) {
		return numVals + d.values.length;
	}, 0);

	var grids = d3svg.selectAll("g.grid-chart-block");
	t.equal(num_series, grids[0].length, "number of rendered bar grid blocks correct");

	//TODO: Check that correct types are rendererd

	ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(rw).parentNode);
	t.end();
});

