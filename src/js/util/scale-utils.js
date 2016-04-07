var d3 = require("d3");
var clone = require("lodash/clone");
var reduce = require("lodash/reduce");
var map = require("lodash/map");
var processDates = require("./process-dates");
var help = require("./helper");

/**
 * generateScale
 *
 * @param scaleOptions
 * @param data
 * @param range
 * @returns {scale: d3 scale, tickValues: array, tickFormat: format func}
 */
function generateScale(scaleOptions, data, range) {
	if (scaleOptions.dateSettings) {
		return _dateScale(scaleOptions, data, range);
	}
	if (scaleOptions.numericSettings) {
		return _linearScale(scaleOptions, data, range);
	}
	else {
		return _ordinalScale(scaleOptions, data, range);
	}
}

function _dateScale(scaleOptions, data, range) {
	// Return the ticks used for a time scale based on the time span and settings
	var formatAndFreq = {};
	var _dateSettings = scaleOptions.dateSettings;
	var dateFormat = _dateSettings.dateFormat;
	var dateFrequency = _dateSettings.dateFrequency;

	// grab the first series to get the first/last dates
	var firstSeries = data[0].values;
	// make sure dates are in chronological order
	var dateRange = [
		firstSeries[0].entry,
		firstSeries[firstSeries.length - 1].entry
	].sort(d3.ascending);

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
		scale: d3.time.scale().range(range).domain([minDate, maxDate]),
		tickValues: formatAndFreq.frequency,
		tickFormat: processDates.dateParsers[formatAndFreq.format]
	};
}

function _linearScale(scaleOptions, data, range) {
	var numericSettings = scaleOptions.numericSettings;
	return {
		scale: d3.scale.linear().domain(numericSettings.domain).range(range),
		tickValues: numericSettings.tickValues,
		tickFormat: function(d) {
			return help.roundToPrecision(d, numericSettings.precision);
		}
	};
}

function _ordinalScale(scaleOptions, data, range) {
	var entries = map(data[0].values, function(value) {
		return value.entry;
	});
	return {
		scale: d3.scale.ordinal().domain(entries).rangePoints(range, 0.4),
		tickValues: entries,
	};
}

module.exports = {
	generateScale: generateScale
};
