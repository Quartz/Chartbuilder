var d3 = require("d3");
var clone = require("lodash/clone");
var reduce = require("lodash/reduce");
var map = require("lodash/map");
var processDates = require("./process-dates");
var help = require("./helper");

function generateScale(props, range) {
	var scaleOpts = props.chartProps.scale;
	if (scaleOpts.dateSettings) {
		return _dateScale(props, range);
	}
	if (scaleOpts.numericSettings) {
		return _linearScale(props, range);
	}
	else {
		return _ordinalScale(props, range);
	}
}

function _dateScale(props, range) {
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

	if (dateFrequency === "auto" || dateFormat === "auto") {
		var autoSettings = processDates.autoDateFormatAndFrequency(minDate, maxDate, dateFormat, range[1]);
	}

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
		scaleFunc: d3.time.scale().range(range).domain([minDate, maxDate]),
		ticks: formatAndFreq.frequency,
		tickFormat: processDates.dateParsers[formatAndFreq.format]
	};

}

function _linearScale(props, range) {
	var numericSettings = props.chartProps.scale.numericSettings;

	var scale = d3.scale.linear()
		.domain(numericSettings.domain)
		.range(range);

	return {
		scaleFunc: scale,
		ticks: numericSettings.tickValues,
		tickFormat: function(d) {
			return help.roundToPrecision(d, numericSettings.precision);
		}
	};
}

function _ordinalScale(props, range) {
	var entries = map(props.chartProps.data[0].values, function(value) {
		return value.entry;
	})

	var scale = d3.scale.ordinal()
		.domain(entries)
		.rangePoints(range, 0.4);

	return {
		scaleFunc: scale,
		ticks: entries,
		tickFormat: function(d) {
			return d;
		}
	};
}

module.exports = {
	generateScale: generateScale
};
