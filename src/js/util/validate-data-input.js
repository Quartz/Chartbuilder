// Return input with validation statuses. These get sent to the UI in order
// to prevent drawing and give error messages.

var map = require("lodash/map");
var filter = require("lodash/filter");
var some = require("lodash/some");
var sizeof = require("sizeof");
var MAX_BYTES = 400000; // Max 400k for chartProps

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
	var hasDate = chartProps.scale.hasDate;

	var inputErrors = [];

	// Check whether we have input
	if (input.length === 0) {
		inputErrors.push("EMPTY");
		return inputErrors;
	}

	// Whether the number of bytes in chartProps exceeds our defined maximum
	if (sizeof.sizeof(chartProps) > MAX_BYTES) {
		inputErrors.push("TOO_MUCH_DATA");
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

	// Whether a column has NaN
	var nanSeries = dataPointTest(
			series,
			function(val) { return isNaN(val.value); },
			function(nan, vals) { return nan.length > 0;}
		);

	if (nanSeries) {
		inputErrors.push("NAN_VALUES");
	}

	// Whether a column that is supposed to be a date is not in fact a date
	if(hasDate) {
		var badDateSeries = dataPointTest(
				series,
				function(val) { return isNaN(val.entry.getTime()); },
				function(bd,vals) { return bd.length > 0;}
			);


		if (badDateSeries) {
			inputErrors.push("NOT_DATES");
		}
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
