var createFactory  = require("react").createFactory;
var BarGroup       = require("../components/series/BarGroup.jsx");
var LineMarkSeries = require("../components/series/LineMarkSeries.jsx");
var LineSeries     = require("../components/series/LineSeries.jsx");
var MarkSeries     = require("../components/series/MarkSeries.jsx");

var series_components = {
	"line": React.createFactory(LineSeries),
	"lineMark": React.createFactory(LineMarkSeries),
	"column": React.createFactory(BarGroup),
	"scatterPlot": React.createFactory(MarkSeries)
};

function create_series(type, props) {
	return series_components[type](props);
}

module.exports = {
	createSeries: create_series
};
