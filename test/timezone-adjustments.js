var test = require("tape");

var testInput = require("./util/test-input");
require("sugar-date");

var parseDelimitedInput = require("../src/js/util/parse-delimited-input.js");
var parseUtils = require("../src/js/util/parse-utils.js");
var cast = parseDelimitedInput._cast_data;

var separators = {
	decimal: ".",
	thousands: ","
};

var stripChars = [
	"$",
	"£",
	"€",
	"%"
];

var _stripCharsStr = stripChars.concat([separators.thousands]).reduce(function(a, b) {
	return a.concat(parseUtils.escapeRegExp(b));
}, []).join("|");
var stripCharsRegex = new RegExp(_stripCharsStr, "g");

test("timezone: tz adjustments", function(t) {
	t.plan(3);

	var input = [
		"date-col	val",
		"2016-02-02T12:00:00-0800	1",
		"2016-02-02T12:00:01-0800	1",
		"2016-02-02T12:00:02-0800	1",
		"2016-02-02T12:00:03-0800	1"
	].join("\n");

	var opts = {
		type: "date",
		inputTZ: "Z",
		delimiter: parseUtils.detectDelimiter(input)
	};

	var entries = cast(input, ["date-col", "val"], stripCharsRegex, opts).entries;
	var expected = [
		Date.create("2016-02-02T12:00:00-0800"),
		Date.create("2016-02-02T12:00:01-0800"),
		Date.create("2016-02-02T12:00:02-0800"),
		Date.create("2016-02-02T12:00:03-0800")
	];

	t.deepEqual(entries, expected, "dates that already have a timezone are left alone");

	input = [
		"date-col	val",
		"Feb. 2 2016 12:00:00	1",
		"Feb. 2 2016 12:00:01	1",
		"Feb. 2 2016 12:00:02	1",
		"Feb. 2 2016 12:00:03	1"
	].join("\n");

	opts = {
		type: "date",
		inputTZ: null,
		delimiter: parseUtils.detectDelimiter(input)
	};

	expected = [
		Date.create("2016-02-02T12:00:00"),
		Date.create("2016-02-02T12:00:01"),
		Date.create("2016-02-02T12:00:02"),
		Date.create("2016-02-02T12:00:03")
	];

	entries = cast(input, ["date-col", "val"], stripCharsRegex, opts).entries;
	t.deepEqual(entries, expected,"dates that don't have a timezone are adjusted to local when there is no inputTZ");


	opts = {
		type: "date",
		inputTZ: "-0500",
		delimiter: parseUtils.detectDelimiter(input)
	};

	expected = [
		Date.create("2016-02-02T12:00:00-0500"),
		Date.create("2016-02-02T12:00:01-0500"),
		Date.create("2016-02-02T12:00:02-0500"),
		Date.create("2016-02-02T12:00:03-0500")
	];

	entries = cast(input, ["date-col", "val"], stripCharsRegex, opts).entries;

	t.deepEqual(entries, expected,"dates that don't have a timezone are adjusted to the inputTZ");

	t.end();
});

