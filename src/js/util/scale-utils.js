var d3 = require("d3");
var d3scale = require("d3-scale");
var clone = require("lodash/clone");
var assign = require("lodash/assign");
var reduce = require("lodash/reduce");
var map = require("lodash/map");
var processDates = require("./process-dates");
var help = require("./helper");

var scale_types = {
	"linear": _linearScale,
	"ordinal": _ordinalScale,
	"time": _timeScale
};

var defaultPadding = {
	inner: 0.2,
	outer: 0.1
};

/**
 * generateScale
 *
 * @param type
 * @param scaleOptions
 * @param data
 * @param range
 * @returns {scale: d3 scale, tickValues: array, tickFormat: format func}
 */
function generate_scale(type, scaleOptions, data, range, additionalOpts) {
	if (!scaleOptions) return {};
	return scale_types[type](scaleOptions, data, range, additionalOpts);
}

function _timeScale(scaleOptions, data, range) {
	// Return the ticks used for a time scale based on the time span and settings
	var formatAndFreq = {};
	var dateFormat = scaleOptions.dateFormat;
	var dateFrequency = scaleOptions.dateFrequency;

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

	// use min/max dates if our auto calc comes up with empty array
	if (formatAndFreq.frequency.length === 0) {
		formatAndFreq.frequency = [minDate, maxDate];
	}

	return {
		scale: d3.time.scale().range(range).domain([minDate, maxDate]),
		tickValues: formatAndFreq.frequency,
		tickFormat: processDates.dateParsers[formatAndFreq.format]
	};
}

function _linearScale(scaleOptions, data, range) {
	return {
		scale: d3.scale.linear().domain(scaleOptions.domain).range(range),
		tickValues: scaleOptions.tickValues,
		tickFormat: function(d) {
			return help.roundToPrecision(d, scaleOptions.precision);
		}
	};
}

function _ordinalScale(scaleOptions, data, range, _padding) {
	var padding = assign({}, defaultPadding, _padding);

	var entries = map(data[0].values, function(value) {
		return value.entry;
	});

	var scale = d3scale.scaleBand()
		.domain(entries)
		.range(range)
		.paddingInner(padding.inner)
		.paddingOuter(padding.outer);

	return {
		scale: scale,
		tickValues: entries,
	};
}

//TODO: make this keyed funcs that accept a `type` param
//(like "ordinal", "time", "linear") so that we dont have to check every time
function _ordinalAdjust(scale, value) {
	var isOrdinal = scale.hasOwnProperty("bandwidth");
	if (isOrdinal) {
		return scale(value) + scale.bandwidth() / 2;
	} else {
		return scale(value);
	}
}

/**
 * get_tick_widths
 *
 * @param scaleOptions object
 * @param font string
 * @returns {width: [number], max: number}
 */
function get_tick_widths(scaleOptions, font) {
	if (!scaleOptions) return { width: [], max: 0};

	var numTicks = scaleOptions.tickValues.length - 1;
	var formattedTicks = reduce(scaleOptions.tickValues, function(prev, tick, i) {
		if (i === numTicks) {
			return prev.concat([
				scaleOptions.prefix,
				help.roundToPrecision(tick, scaleOptions.precision),
				scaleOptions.suffix
			].join(""));
		} else {
			return prev.concat(help.roundToPrecision(tick, scaleOptions.precision));
		}
	}, []);

	var widths = map(formattedTicks, function(text) {
		return help.computeTextWidth(text, font);
	});

	return {
		widths: widths,
		max: d3.max(widths.slice(0, -1)) // ignore the top tick
	};
}

module.exports = {
	generateScale: generate_scale,
	getTickWidths: get_tick_widths,
	ordinalAdjust: _ordinalAdjust
};
