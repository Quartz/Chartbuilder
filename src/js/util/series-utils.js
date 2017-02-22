var createFactory  = require("react").createFactory;
var BarGroup       = require("../components/series/BarGroup.jsx");
var LineMarkSeries = require("../components/series/LineMarkSeries.jsx");
var LineSeries     = require("../components/series/LineSeries.jsx");
var MarkSeries     = require("../components/series/MarkSeries.jsx");

var series_components = {
	"line": createFactory(LineSeries),
	"lineMark": createFactory(LineMarkSeries),
	"column": createFactory(BarGroup),
	"scatterPlot": createFactory(MarkSeries)
};

function create_series(type, props) {
	return series_components[type](props);
}

module.exports = {
	createSeries: create_series
};
