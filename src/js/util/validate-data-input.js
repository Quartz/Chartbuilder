// Return input with validation statuses. These get sent to the UI in order
// to prevent drawing and give error messages.

var map = require("lodash/map");
var filter = require("lodash/filter");
var some = require("lodash/some");

var checkFor = {
	empty: true,
	tooManySeries: true,
	unevenSeries: true,
	nanSeries: true,
	badDateSeries: true,
	tooMuchData: true,
	hasThousands: true,
	highResData: true,
	highPrecisionData: false
};

var maxDataSize = 250000;
var chartWidth = 640;

function makeInputObj(rawInput, status, isValid) {
	return {
		raw: rawInput,
		status: status,
		valid: isValid
	};
}

function validateDataInput(input, series, hasDate) {
	if (checkFor.empty && input.length === 0) {
		// Check whether we have input
		return makeInputObj(input, "EMPTY", false);
	} else if (checkFor.tooManySeries && series.length > 12) {
		// Check whether there are too many series
		return makeInputObj(input, "TOO_MANY_SERIES", false);
	}

	var unevenSeries = dataPointTest(
			series,
			function(val) { return val.value !== null ? (val.value === undefined || val.value.length === 0) : false;},
			function(empty,vals) { return empty.length !== vals[0].length;}
		);

	if (checkFor.unevenSeries && unevenSeries) {
		return makeInputObj(input, "UNEVEN_SERIES", false);
	}

	var nanSeries = dataPointTest(
			series,
			function(val) { return isNaN(val.value);},
			function(nan,vals) { return nan.length > 0;}
		);

	if (checkFor.nanSeries && nanSeries) {
		return makeInputObj(input, "NAN_VALUES", false);
	}

	if(hasDate) {
		var badDateSeries = dataPointTest(
				series,
				function(val) {return isNaN(val.entry.getTime());},
				function(bd,vals) { return bd.length > 0;}
			);

		if (checkFor.badDateSeries && badDateSeries) {
			return makeInputObj(input, "NOT_DATES", false);
		}
	}


	// Warnings

	if(checkFor.tooMuchData && input.length > maxDataSize) {
		return makeInputObj(input,"TOO_MUCH_DATA",true)
	}

	hasThousands = dataPointTest(
		series,
		function(val){return val.value > 1000},
		function(ht,vals){return ht.length > 0}
		)

	if(checkFor.hasThousands && hasThousands) {
		return makeInputObj(input,"GREATER_THAN_THOUSAND",true)
	}

	highResData = input.split(/\r\n|\r|\n/).length > chartWidth

	if(checkFor.highResData && highResData) {
		return makeInputObj(input,"TOO_MUCH_RESOLUTION",true)
	}

	highPrecisionData = dataPointTest(
			series,
			function(val){return String(val.value % 1).length > 4},
			function(hp,vals){return hp.length > 0})

	if(checkFor.highPrecisionData && highPrecisionData) {
		return makeInputObj(input,"TOO_HIGH_PRECISION",true)
	}

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
