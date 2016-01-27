// Return input with validation statuses. These get sent to the UI in order
// to prevent drawing and give error messages.

var map = require("lodash/map");
var filter = require("lodash/filter");
var some = require("lodash/some");

/*
* Return array of input error names
*/
function makeInputObj(rawInput, status, isValid) {
	return {
		status: status,
	};
}

function validateDataInput(input, series, hasDate) {

	var inputErrors = [];

	// Check whether we have input
	if (input.length === 0) {
		inputErrors.push("EMPTY");
		return inputErrors;
	}

	if (series.length && !series[0].values.length) {
		// Check that we have at least 1 value row (i.e. minimum header + 1 data row)
		inputErrors.push("TOO_FEW_SERIES");
	} else if (series.length > 12) {
		// Check whether there are too many series
		inputErrors.push("TOO_MANY_SERIES");
	}

	var unevenSeries = dataPointTest(
			series,
			function(val) { return val.value !== null ? (val.value === undefined || val.value.length === 0) : false;},
			function(empty,vals) { return empty.length !== vals[0].length;}
		);

	if (unevenSeries) {
		inputErrors.push("UNEVEN_SERIES");
	}

	var nanSeries = dataPointTest(
			series,
			function(val) { return isNaN(val.value); },
			function(nan, vals) { return nan.length > 0;}
		);

	if (nanSeries) {
		inputErrors.push("NAN_VALUES");
	}

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
