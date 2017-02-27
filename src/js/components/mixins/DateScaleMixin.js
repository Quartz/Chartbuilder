
import {clone,map,reduce} from 'lodash';
const processDates = require("../../util/process-dates");

/**
 * ### Mixin for renderers that require construction of a date scale
 * @instance
 * @memberof renderers
 */
const DateScaleMixin = {

	/**
	 * generateDateScale
	 * Create a date scale given data, scale, and dimensions settings
	 * @param props
	 * @return {object} - `{ dateTicks: ...,  domain: ..., dateFormatter: ...}`
	 */
	generateDateScale: function(props) {
		// Return the ticks used for a time scale based on the time span and settings
		const formatAndFreq = {};
		const _dateSettings = clone(props.chartProps.scale.dateSettings, true);
		const dateFormat = _dateSettings.dateFormat;
		const dateFrequency = _dateSettings.dateFrequency;

		// Create a flat array of all dates so that we know that we can calculate
		// the earliest and latest
		const allDates = reduce(props.chartProps.data, function(prevArr, series) {
			return map(series.values, function(values) {
				return values.entry;
			}).concat(prevArr);
		}, []);

		const dateRange = d3.extent(allDates);
		const minDate = dateRange[0];
		const maxDate = dateRange[1];

		const extraPadding = props.chartProps.extraPadding;
		const width = props.dimensions.width;
		const availableWidth = props.dimensions.width - extraPadding.left - extraPadding.right;
		const autoSettings = processDates.autoDateFormatAndFrequency(minDate, maxDate, dateFormat, availableWidth);

		if (dateFrequency !== "auto") {
			const freqSettings = processDates.dateFrequencies[dateFrequency];
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
