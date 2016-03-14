// Return input with validation statuses. These get sent to the UI in order
// to prevent drawing and give error messages.

var map = require("lodash/map");
var max = require("lodash/max");
var filter = require("lodash/filter");
var some = require("lodash/some");
var unique = require("lodash/uniq");
var catchChartMistakes = require("./catch-chart-mistakes");

types = {
	"number": "numeric",
	"object": "date",
	"string": "ordinal"
};

var MAX_BYTES = 400000; // Max 400k for chartProps

function validateDataInput(chartProps) {
	var input = chartProps.input.raw;
	var series = chartProps.data;
	var hasDate = chartProps.scale.hasDate;
	var isNumeric = chartProps.scale.isNumeric;
	var type = chartProps.input.type;
	var scale = chartProps.scale;

	var inputErrors = [];

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
	var unevenSeries = dataPointTest(
			series,
			function(val) { return val.value !== null ? (val.value === undefined || val.value.length === 0) : false;},
			function(empty,vals) { return empty.length !== vals[0].length;}
		);

	if (unevenSeries) {
		inputErrors.push("UNEVEN_SERIES");
	}

	// Whether a column has something that is NaN but is not nothing (blank) or `null`
	var nanSeries = somePointTest(
			series,
			function(val) {
				return (isNaN(val.value) && val.value !== undefined && val.value !== "");
			}
		);

	if (nanSeries) {
		inputErrors.push("NAN_VALUES");
	}

	// Are there multiple types of axis entries
	var entryTypes = unique(series[0].values.map(function(d){return typeof d.entry;}));
	if(entryTypes.length > 1 && !chartProps.input.type) {
		inputErrors.push("CANT_AUTO_TYPE");
	}

	//Whether an entry column that is supposed to be a Number is not in fact a number
	if(isNumeric || chartProps.input.type == "numeric") {
		var badNumSeries = somePointTest(
				series,
				function(val) { return isNaN(val.entry); }
			);

		if (badNumSeries) {
			inputErrors.push("NAN_VALUES");
		}
	}

	// Whether an entry column that is supposed to be a date is not in fact a date
	if(hasDate || chartProps.input.type == "date") {
		var badDateSeries = somePointTest(
				series,
				function(val) { return !val.entry.getTime || isNaN(val.entry.getTime()); },
				function(bd,vals) { return bd.length > 0;}
			);

		if (badDateSeries) {
			inputErrors.push("NOT_DATES");
		}

		var tz_pattern = /([+-]\d\d:*\d\d)/gi;
		var found_timezones = input.match(tz_pattern);
		if(found_timezones && found_timezones.length != series[0].values.length) {
			inputErrors.push("UNEVEN_TZ");
		}
	}

	// Whether a column has numbers that should be divided
	var largeNumbers = somePointTest(
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

// Func that checks wheter all data points pass a test
function dataPointTest(series, filterTest, someTest) {
	var vals = map(series, function(d,i) {
		return filter(d.values, filterTest);
	});

	return some(vals, function(n) {
		return someTest(n,vals);
	});
}

module.exports = validateDataInput;
