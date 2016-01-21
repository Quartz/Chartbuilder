var clone = require("lodash/clone");
var map = require("lodash/map");
var reduce = require("lodash/reduce");
var processDates = require("../../util/process-dates");

/**
 * ### Mixin for renderers that require construction of a date scale
 * @instance
 * @memberof renderers
 */
var DateScaleMixin = {

	/**
	 * generateDateScale
	 * Create a date scale given data, scale, and dimensions settings
	 * @param props
	 * @return {object} - `{ dateTicks: ...,  domain: ..., dateFormatter: ...}`
	 */
	generateDateScale: function(props) {
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
			dateTicks: formatAndFreq.frequency,
			domain: [minDate, maxDate],
			dateFormatter: processDates.dateParsers[formatAndFreq.format]
		};
	}
};

module.exports = DateScaleMixin;
