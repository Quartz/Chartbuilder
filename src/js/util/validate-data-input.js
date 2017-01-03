// Return input with validation statuses. These get sent to the UI in order
// to prevent drawing and give error messages.
import {max, map, filter, some, includes, uniq} from 'lodash';

const catchChartMistakes = require("./catch-chart-mistakes");

const types = {
	"number": "numeric",
	"object": "state",
	"string": "ordinal"
};

const MAX_BYTES = 400000; // Max 400k for chartProps

function validateDataInput(chartProps) {

	const input = chartProps.input.raw;
	const series = chartProps.data;
	const hasDate = chartProps.scale.hasDate;
	const isNumeric = chartProps.scale.isNumeric;
	const type = chartProps.input.type;
	const scale = chartProps.scale;

	const inputErrors = [];

	// Check whether we have input
	if (input.length === 0) {
		inputErrors.push("EMPTY");
		return inputErrors;
	}

	if (series.length && !series[0].values[0].entry) {
		// Check that we have at least 1 value col (i.e. minimum header + 1 data col)
		inputErrors.push("TOO_FEW_SERIES");
	} else if (series.length > 12) {
		// Check whether there are too many series
		inputErrors.push("TOO_MANY_SERIES");
	}

	// Whether a column has a different number of values
	const unevenSeries = dataPointTest(
			series,
			function(val) { return val.value !== null ? (val.value === undefined || val.value.length === 0) : false;},
			function(empty,vals) { return empty.length !== vals[0].length;}
		);

	if (unevenSeries) {
		inputErrors.push("UNEVEN_SERIES");
	}

	// Whether a column has something that is NaN but is not nothing (blank) or `null`
	const nanSeries = somePointTest(
			series,
			function(val) {
				return (isNaN(val.value) && val.value !== undefined && val.value !== "");
			}
		);

	if (nanSeries) {
		inputErrors.push("NAN_VALUES");
	}

	// Are there multiple types of axis entries
	const entryTypes = uniq(series[0].values.map(function(d){return typeof d.entry;}));
	if(entryTypes.length > 1 && !chartProps.input.type) {
		inputErrors.push("CANT_AUTO_TYPE");
	}

	//Whether an entry column that is supposed to be a Number is not in fact a number
	if(isNumeric || chartProps.input.type == "numeric") {
		const badNumSeries = somePointTest(
				series,
				function(val) { return isNaN(val.entry); }
			);

		if (badNumSeries) {
			inputErrors.push("NAN_VALUES");
		}
	}

	// Whether an entry column that is supposed to be a date is not in fact a date
	if(hasDate || chartProps.input.type == "date") {
		const badDateSeries = somePointTest(
				series,
				function(val) { return !val.entry.getTime || isNaN(val.entry.getTime()); },
				function(bd,vals) { return bd.length > 0;}
			);

		if (badDateSeries) {
			inputErrors.push("NOT_DATES");
		}

		const tz_pattern = /([+-]\d\d:*\d\d)/gi;
		const found_timezones = input.match(tz_pattern);
		if(found_timezones && found_timezones.length != series[0].values.length) {
			inputErrors.push("UNEVEN_TZ");
		}
	}

	// Whether a column has numbers that should be divided
	const largeNumbers = somePointTest(
			series,
			function(val) { return Math.floor(val.value).toString().length > 4; },
			function(largeNums, vals) { return largeNums.length > 0;}
		);

	if (largeNumbers) {
		inputErrors.push("LARGE_NUMBERS");
	}

	// Whether the number of bytes in chartProps exceeds our defined maximum
	if (catchChartMistakes.tooMuchData(chartProps)) {
		inputErrors.push("TOO_MUCH_DATA");
	}

	// Whether axis ticks divide evenly
	if (!catchChartMistakes.axisTicksEven(scale.primaryScale)) {
		inputErrors.push("UNEVEN_TICKS");
	}

	// Whether axis is missing pref and suf
	if (catchChartMistakes.noPrefixSuffix(scale.primaryScale)) {
		inputErrors.push("NO_PREFIX_SUFFIX");
	}

	return inputErrors;

}

// Func that checks wheter a single data point failes a test.
// Will return as soon as failure is found
function somePointTest(series, someTest) {
	return some(series, function(s) {
		return some(s.values, someTest);
	});
}

// Func that checks whether all data points pass a test
function dataPointTest(series, filterTest, someTest) {
	const vals = map(series, function(d,i) {
		return filter(d.values, filterTest);
	});

	return some(vals, function(n) {
		return someTest(n,vals);
	});
}

module.exports = validateDataInput;
