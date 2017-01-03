// Return input with validation statuses. These get sent to the UI in order
// to prevent drawing and give error messages.
import {max, map, filter, some, includes, uniq} from 'lodash';

const catchMapMistakes = require("./catch-map-mistakes");
/*const allstates = require("./../config/states-list");

const convertFulltoPostal = require('us-abbreviations')('full','postal');
const convertFipstoPostal = require('us-abbreviations')('fips','postal');
const convertPosttoPostal = require('us-abbreviations')('post','postal');*/

const types = {
	"number": "numeric",
	"object": "state",
	"string": "ordinal"
};

const MAX_BYTES = 400000; // Max 400k for chartProps

function validateDataInput(chartProps) {
	console.trace('validate map input');

	const input = chartProps.input.raw;
	const series = chartProps.data;
	const hasDate = chartProps.scale.hasDate;
	const isNumeric = chartProps.scale.isNumeric;
	const type = chartProps.input.type;
	const scale = chartProps.scale;

	/* switch statement for visual type
			abstract out the control flow

	*/

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

	//Whether an entry column that is supposed to be a Number is not in fact a number
	console.log(isNumeric,chartProps.input.type, 'isNumeric tests');
	if(isNumeric || chartProps.input.type == "numeric") {
		var badNumSeries = somePointTest(
				series,
				function(val) { return isNaN(val.entry); }
			);

		if (badNumSeries) {
			inputErrors.push("NAN_VALUES");
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
	console.log(scale,'scale',JSON.stringify(chartProps.visualType));
	if (!catchChartMistakes.axisTicksEven(scale.primaryScale)) {
		inputErrors.push("UNEVEN_TICKS");
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
