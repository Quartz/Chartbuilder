// Return input with validation statuses. These get sent to the UI in order
// to prevent drawing and give error messages.

var map = require("lodash/collection/map");
var filter = require("lodash/collection/filter");
var some = require("lodash/collection/some");

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


	// Warnings

	if(input.length > 250000) {
		return makeInputObj(input,"TOO_MUCH_DATA",true)
	}

	has_thousands = dataPointTest(
		series,
		function(val){return val.value > 1000},
		function(ht,vals){return ht.length > 0}
		)

	if(has_thousands) {
		return makeInputObj(input,"GREATER_THAN_THOUSAND",true)
	}

	high_res_data = input.split(/\r\n|\r|\n/).length > 640

	if(high_res_data) {
		return makeInputObj(input,"TOO_MUCH_RESOLUTION",true)
	}

	// high_precision_data = dataPointTest(
	// 		series,
	// 		function(val){return String(val.value % 1).length > 4},
	// 		function(hp,vals){return hp.length > 0})

	// if(high_precision_data) {
	// 	return makeInputObj(input,"TOO_HIGH_PRECISION",true)
	// }

	// If we make it here, input is valid, and needs no warning
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
