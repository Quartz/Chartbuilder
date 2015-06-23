// Generate a util XY chart

var faker = require("faker");
var _ = require("lodash");
var util = require("../util/util");

var defaultInput = require("../util/test-input");
var parseXY = require("../../src/js/charts/cb-xy/parse-xy");
var xyConfig = require("../../src/js/charts/cb-xy/xy-config");
var inputKeys = Object.keys(defaultInput);

var options = {
	type: ["line", "column", "scatterPlot"],
	axis: ["left", "right"]
};

var defaultOpts = {
	size: "auto"
};

function generateXY(_opts) {
	_opts = _opts || {};
	var opts = _.defaults(_opts, defaultOpts);

	var randChartProps = {
		scale: {
			primaryScale: {
				prefix: faker.finance.currencySymbol(),
				suffix: " " + faker.hacker.noun() + "s",
				ticks: util.randInt(3, 8),
				precision: 0
			},
			secondaryScale: {
				precision: 0
			}
		},
		input: {
			raw: defaultInput.init_data_ordinal,
			status: "VALID",
			valid: true
		},
		chartSettings: [],
		data: [],
		extraPadding: {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		},
		_annotations: {
			labels: {
				hasDragged: false,
				values: []
			}
		},
		_dateScale: {
			dateFrequency: "auto",
			dateFormat: "M"
		},
		mobile: {}
	};

	var randMetadata = {
		id: null,
		chartType: "xy",
		title: faker.company.catchPhrase(),
		source: "Data: " + faker.company.companyName(),
		credit: faker.address.country() + " | " + faker.internet.domainName(),
		size: opts.size
	};

	var chartProps = parseXY(xyConfig, randChartProps);
	var anyDragged = false;

	_.each(chartProps.data, function(d, i) {
		var randSetting = {
			type: util.randArrElement(options.type),
			colorIndex: util.randInt(0, 9),
			altAxis: false
		};

		chartProps.chartSettings[i] = randSetting;
	});

	chartProps._annotations.labels.hasDragged = anyDragged;
	chartProps = parseXY(xyConfig, chartProps);

	return {
		chartProps: chartProps,
		metadata: randMetadata
	};
}

module.exports = generateXY;
