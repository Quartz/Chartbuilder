var test = require("tape");

var React = require("react");
var ReactDOM = require("react-dom");

var d3 = require("d3");
var _ = require("lodash");
var TU = require("react-addons-test-utils");
var util = require("../util/util");

var RendererWrapper = require("../../src/js/components/RendererWrapper.jsx");

var test_charts = require("../test-page/test_charts.json");
var bar_grids = _.filter(test_charts, function(chart) {
	if (chart.metadata.chartType === "chartgrid") {
		return (chart.chartProps._grid.type === "bar");
	} else {
		return false;
	}
});
var randBarGrid = util.randArrElement(bar_grids);

test("Renderer: Chart grid bars", function(t) {
	t.plan(5);

	var rw = TU.renderIntoDocument(
		<RendererWrapper
			width={640}
			editable={false}
			model={randBarGrid}
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

	var num_series = randBarGrid.chartProps._grid.cols * randBarGrid.chartProps._grid.rows;
	var num_vals = _.reduce(randBarGrid.chartProps.data, function(numVals, d) {
		return numVals + d.values.length;
	}, 0);

	var grids = d3svg.selectAll("g.grid-chart-block");
	t.equal(num_series, grids[0].length, "number of rendered bar grid blocks correct");

	var num_bars = util.flattenLengthsToTotal(grids.selectAll("rect.bar"))

	var concealers = grids.selectAll("g.concealer_label");
	var num_label_rect = util.flattenLengthsToTotal(concealers.selectAll("rect"))
	var num_label_text = util.flattenLengthsToTotal(concealers.selectAll("text"));
	var num_y_ticks = util.flattenLengthsToTotal(grids.select(".y.axis").selectAll("g.tick line"));

	t.equal(num_vals, num_bars, "number of bar grid bars matches data");
	t.equal(num_vals, num_label_text, "number of bar grid labels matches data");
	t.equal(num_vals, num_label_rect, "number of bar grid label rects matches data");

	ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(rw).parentNode);
	t.end();
});

