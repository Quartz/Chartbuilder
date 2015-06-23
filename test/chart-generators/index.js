var util = require("../util/util");
var generateXY = require("./generate-xy");
var generateChartGrid = require("./generate-chart-grid");

var chartGenerators = {
	xy: generateXY,
	chartgrid: generateChartGrid
};

function randChart() {
	var generator = util.randArrElement(Object.keys(chartGenerators));
	return chartGenerators[generator]();
}

module.exports = {
	xy: generateXY,
	chartgrid: generateChartGrid,
	randChart: randChart
};
