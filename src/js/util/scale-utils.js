var d3 = require("d3");
var clone = require("lodash/clone");
var reduce = require("lodash/reduce");
var map = require("lodash/map");
var processDates = require("./process-dates");

function generateScale(props, width) {
	var scaleOpts = props.chartProps.scale;
	if (scaleOpts.dateSettings) {
		return generateDateScale(props, width);
	}
	if (scaleOpts.numericSettings) {
		return generateNumericScale(props, width);
	}
	else {
		return generateOrdinalScale(props, width);
	}
}

function generateDateScale(props, width) {
	// Return the ticks used for a time scale based on the time span and settings
	var formatAndFreq = {};
	var _dateSettings = clone(props.chartProps.scale.dateSettings, true);
	var dateFormat = _dateSettings.dateFormat;
	var dateFrequency = _dateSettings.dateFrequency;

	// Create a flat array of all dates so that we know that we can calculate
	// the earliest and latest
	var allDates = reduce(props.chartProps.data, function(prevArr, series) {
		return map(series.values, function(values) {
			return values.entry;
		}).concat(prevArr);
	}, []);

	var dateRange = d3.extent(allDates);
	var minDate = dateRange[0];
	var maxDate = dateRange[1];

	var extraPadding = props.chartProps.extraPadding;
	var width = props.dimensions.width;
	var availableWidth = props.dimensions.width - extraPadding.left - extraPadding.right;
	var autoSettings = processDates.autoDateFormatAndFrequency(minDate, maxDate, dateFormat, availableWidth);

	if (dateFrequency !== "auto") {
		var freqSettings = processDates.dateFrequencies[dateFrequency];
		formatAndFreq.frequency = freqSettings(minDate, maxDate);
	} else {
		formatAndFreq.frequency = autoSettings.frequency;
	}
	if (dateFormat !== "auto") {
		formatAndFreq.format = dateFormat;
	} else {
		formatAndFreq.format = autoSettings.format;
	}

	return {
		scaleFunc: d3.time.scale().range([0, width]).domain([minDate, maxDate]),
		ticks: formatAndFreq.frequency,
		tickFormat: processDates.dateParsers[formatAndFreq.format]
	};

}

function generateNumericScale(props, width) {

}

function generateOrdinalScale(props, width) {

}

module.exports = {
	generateScale: generateScale
};
