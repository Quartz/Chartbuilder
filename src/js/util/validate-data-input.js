// Return input with validation statuses. These get sent to the UI in order
// to prevent drawing and give error messages.

var map = require("lodash/map");
var max = require("lodash/max");
var filter = require("lodash/filter");
var some = require("lodash/some");
var catchChartMistakes = require("./catch-chart-mistakes");

/*
* Return array of input error names
*/
function makeInputObj(rawInput, status, isValid) {
	return {
		status: status,
	};
}

function validateDataInput(chartProps) {
	var input = chartProps.input.raw;
	var series = chartProps.data;
	var scale = chartProps.scale;

	var inputErrors = [];

	// Check whether we have input
	if (input.length === 0) {
		inputErrors.push("EMPTY");
		return inputErrors;
	}

	if (series.length && !series[0].values) {
		// Check that we have at least 1 value row (i.e. minimum header + 1 data row)
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
	var nanSeries = dataPointTest(
			series,
			function(val) {
				return (isNaN(val.value) && val.value !== undefined && val.value !== "");
			},
			function(nan, vals) { return nan.length > 0;}
		);

	if (nanSeries) {
		inputErrors.push("NAN_VALUES");
	}

	// Whether a column that is supposed to be a date is not in fact a date
	if(scale.hasDate) {
		var badDateSeries = dataPointTest(
				series,
				function(val) { return isNaN(val.entry.getTime()); },
				function(bd,vals) { return bd.length > 0;}
			);

		if (badDateSeries) {
			inputErrors.push("NOT_DATES");
		}
	}

	// Whether a column has NaN
	var largeNumbers = dataPointTest(
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

function dataPointTest(series, filterTest, someTest) {
	// A function to systemitize looping through every datapoint
	var vals = map(series, function(d,i) {
		return filter(d.values, filterTest);
	});

	return some(vals, function(n) {
		return someTest(n,vals);
	});
}

module.exports = validateDataInput;
