var test = require("tape");
var _ = require("lodash");

var testInput = require("./util/test-input");
var validateDataInput = require("../src/js/util/validate-data-input");
var parseDataBySeries = require("../src/js/util/parse-data-by-series");
var primaryScale = {
	tickValues: [0,20,40,60,80,100],
	domain: [0, 100]
};

test("validate data input", function(t) {
	t.plan(8);

	var validateResult;
	var parsed;

	parsed = parseDataBySeries(testInput.init_data_ordinal, { checkForDate: true} );
	validateResult = validateDataInput({
		input: { raw: testInput.init_data_ordinal },
		data: parsed.series,
		scale: {
			hasDate: parsed.hasDate,
			primaryScale: primaryScale
		}
	});
	t.deepEqual(validateResult, [], "valid input returns empty array");

	validateResult = validateDataInput({
		input: { raw: "" },
		data: "",
		scale: {
			hasDate: false,
			primaryScale: primaryScale
		}
	});
	t.deepEqual(validateResult, ["EMPTY"], "empty input returns EMPTY");

	parsed = parseDataBySeries(testInput.uneven_series, { checkForDate: true} );
	validateResult = validateDataInput({
		input: { raw: testInput.uneven_series },
		data: parsed.series,
		scale: {
			hasDate: parsed.hasDate,
			primaryScale: primaryScale
		}
	});
	t.deepEqual(validateResult, ["UNEVEN_SERIES"], "uneven series return UNEVEN_SERIES");

	parsed = parseDataBySeries(testInput.too_many_series, { checkForDate: true} );
	validateResult = validateDataInput({
		input: { raw: testInput.too_many_series },
		data: parsed.series,
		scale: {
			hasDate: parsed.hasDate,
			primaryScale: primaryScale
		}
	});
	t.deepEqual(validateResult, ["TOO_MANY_SERIES"], "12+ columns returns TOO_MANY_SERIES");

	parsed = parseDataBySeries(testInput.too_few_series, { checkForDate: true} );
	validateResult = validateDataInput({
		input: { raw: testInput.too_few_series },
		data: parsed.series,
		scale: {
			hasDate: parsed.hasDate,
			primaryScale: primaryScale
		}
	});
	t.deepEqual(validateResult, ["TOO_FEW_SERIES"], "one column returns TOO_FEW_SERIES");

	parsed = parseDataBySeries(testInput.nan_values, { checkForDate: true} );
	validateResult = validateDataInput({
		input: { raw: testInput.nan_values },
		data: parsed.series,
		scale: {
			hasDate: parsed.hasDate,
			primaryScale: primaryScale
		}
	});
	t.deepEqual(validateResult, ["NAN_VALUES"], "column with NaN value returns NAN_VALUES");

	parsed = parseDataBySeries(testInput.not_dates, { checkForDate: true} );
	validateResult = validateDataInput({
		input: { raw: testInput.not_dates },
		data: parsed.series,
		scale: {
			hasDate: parsed.hasDate,
			primaryScale: primaryScale
		}
	});
	t.deepEqual(validateResult, ["CANT_AUTO_TYPE", "NOT_DATES"], "date column with non-date returns NOT_DATES");

	parsed = parseDataBySeries(testInput.multiple_errors, { checkForDate: true} );
	validateResult = validateDataInput({
		input: { raw: testInput.multiple_errors },
		data: parsed.series,
		scale: {
			hasDate: parsed.hasDate,
			primaryScale: primaryScale
		}
	});
	t.deepEqual(validateResult, ["UNEVEN_SERIES", "NAN_VALUES", "CANT_AUTO_TYPE", "NOT_DATES"], "input with several errors returns them all");

	t.end();
});
