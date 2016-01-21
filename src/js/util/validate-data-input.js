// Return input with validation statuses. These get sent to the UI in order
// to prevent drawing and give error messages.

var map = require("lodash/map");
var filter = require("lodash/filter");
var some = require("lodash/some");

function makeInputObj(rawInput, status, isValid) {
	return {
		raw: rawInput,
		status: status,
		valid: isValid
	};
}

function validateDataInput(input, series, hasDate) {
	if (input.length === 0) {
		// Check whether we have input
		return makeInputObj(input, "EMPTY", false);
	} else if (series.length && !series[0].values.length) {
		// Check that we have at least 1 value row (i.e. minimum header + 1 data row)
		return makeInputObj(input, "TOO_FEW_SERIES", false);
	} else if (series.length > 12) {
		// Check whether there are too many series
		return makeInputObj(input, "TOO_MANY_SERIES", false);
	}

	var unevenSeries = dataPointTest(
			series,
			function(val) { return val.value !== null ? (val.value === undefined || val.value.length === 0) : false;},
			function(empty,vals) { return empty.length !== vals[0].length;}
		);

	if (unevenSeries) {
		return makeInputObj(input, "UNEVEN_SERIES", false);
	}

	var nanSeries = dataPointTest(
			series,
			function(val) { return isNaN(val.value);},
			function(nan,vals) { return nan.length > 0;}
		);

	if (nanSeries) {
		return makeInputObj(input, "NAN_VALUES", false);
	}

	if(hasDate) {
		var badDateSeries = dataPointTest(
				series,
				function(val) {return isNaN(val.entry.getTime());},
				function(bd,vals) { return bd.length > 0;}
			);

		if (badDateSeries) {
			return makeInputObj(input, "NOT_DATES", false);
		}
	}

	// If we make it here, input is valid
	return makeInputObj(input, "VALID", true);
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
