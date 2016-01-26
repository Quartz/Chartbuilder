var test = require("tape");

var React = require("react");
var ReactDOM = require("react-dom");

var d3 = require("d3");
var _ = require("lodash");
var TU = require("react-addons-test-utils");
var util = require("../util/util");

var RendererWrapper = require("../../src/js/components/RendererWrapper.jsx");
var lineDotsThresholdSingle = 10;
var lineDotsThresholdTotal = 30;

var test_charts = require("../test-page/test_charts.json");
var xy_charts = _.filter(test_charts, function(chart) {
	return chart.metadata.chartType === "xy";
});
var randXY = util.randArrElement(xy_charts);

test("Renderer: XY chart", function(t) {
	var rw = TU.renderIntoDocument(
		<RendererWrapper
			width={640}
			editable={false}
			model={randXY}
			enableResponsive={false}
			showMetadata={true}
		/>
	);
	t.plan(5);

	var svg = TU.findRenderedDOMComponentWithTag(
		rw,
		"svg"
	);

	t.ok(TU.isDOMComponent(svg), "svg rendered to DOM");

	var svg_dom = ReactDOM.findDOMNode(svg);
	var d3svg = d3.select(svg_dom);

	t.equal(d3svg.select(".chartArea").attr("class"), "chartArea", "chartArea rendered to DOM");

	var xy_types = _.map(randXY.chartProps.chartSettings, function(d) {
		return d.type;
	});

	var type_counts = {
		column: 0,
		line: 0,
		scatterPlot: 0
	};

	_.each(xy_types, function(type) {
		type_counts[type] = type_counts[type] + 1;
	});

	var num_vals = randXY.chartProps.data[0].values.length;

	var cols = d3svg.select("g.bars");
	var lines = d3svg.select("g.lines");
	var dots = d3svg.select("g.circles");

	var num_cols = cols.selectAll("g")[0].length;
	var num_lines = lines.selectAll("g")[0].length;
	var num_dots = dots.selectAll("g.value")[0].length;
	var expected_cols = (type_counts.column === 0) ? 0 : num_vals;

	var singleLineDotThresh = false;

	// Expected number of dots increases if we are within set limits
	var totalLinePoints = _.map(randXY.chartProps.data, function(d) {
		if (d.values.length < lineDotsThresholdSingle) {
			singleLineDotThresh = true;
		}
		return d.values;
	}).reduce(function(a, b) {
		return a.concat(b);
	}).length;

	var totalLineDotThresh = (totalLinePoints < lineDotsThresholdTotal);
	var renderLineDots = (singleLineDotThresh && totalLineDotThresh);
	if (renderLineDots && type_counts.line > 0) {
		type_counts.scatterPlot = type_counts.scatterPlot + type_counts.line;
	}

	t.equal(num_cols, expected_cols, "number of rendered column groups matches data");
	t.equal(num_lines, type_counts.line, "number of rendered line groups matches data");
	t.equal(num_dots, type_counts.scatterPlot, "number of rendered dot groups matches data");

	// Remove test RendererWrapper
	ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(rw).parentNode);
	t.end();
});

