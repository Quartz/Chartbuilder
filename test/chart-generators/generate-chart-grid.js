// Generate a util chart grid

var faker = require("faker");
var _ = require("lodash");
var util = require("../util/util");

var defaultInput = require("../util/test-input");
var parseChartGrid = require("../../src/js/charts/cb-chart-grid/parse-chart-grid");
var chartGridConfig = require("../../src/js/charts/cb-chart-grid/chart-grid-config");
var inputKeys = Object.keys(defaultInput);

var defaultOpts = {
	type: "bar",
	size: "auto"
};

function generateChartGrid(_opts) {
	_opts = _opts || {};
	var opts = _.defaults(_opts, defaultOpts);

	var randChartProps = {
		scale: {
			primaryScale: {
				prefix: faker.finance.currencySymbol(),
				suffix: " " + faker.hacker.noun() + "s",
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
		_grid: {
			type: opts.type
		},
		numColors: 11,
		mobile: {}
	};

	var randMetadata = {
		id: null,
		chartType: "chartgrid",
		title: faker.company.catchPhrase(),
		source: "Data: " + faker.company.companyName(),
		credit: faker.address.country() + " | " + faker.internet.domainName(),
		size: opts.size
	};

	var chartProps = parseChartGrid(chartGridConfig, randChartProps);
	var anyDragged = false;

	return {
		chartProps: chartProps,
		metadata: randMetadata
	};
}

module.exports = generateChartGrid;
