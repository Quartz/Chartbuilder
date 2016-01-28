// Parse a string of TSV or CSV. Returns a flat array of objects of the form { column: value }
// as well as the column names using `d3.dsv`

var d3 = require("d3");
var each = require("lodash/each");
require("sugar-date");
var parseUtils = require("./parse-utils");
var separators;

// We need this to get the current locale's thousands separator
// Check for localStorage in case we are testing from node
if (typeof(localStorage) !== 'undefined') {
	separators = require("../stores/SessionStore").get("separators");
} else {
	separators = {
		decimal: ".",
		thousands: ","
	};
}

var stripChars = [
	"$",
	"£",
	"€",
	"%"
];

var newLineRegex = /\r\n|\r|\n/;

function parseDelimInput(input, opts) {
	opts = opts || {};
	delimiter = opts.delimiter || parseUtils.detectDelimiter(input);

	// create regex of special characters we want to strip out as well as our
	// computed locale-specific thousands separator.
	var _stripCharsStr = stripChars.concat([separators.thousands]).reduce(function(a, b) {
		return a.concat(parseUtils.escapeRegExp(b));
	}, []).join("|");
	var stripCharsRegex = new RegExp(_stripCharsStr, "g");

	var columnNames = input.split(newLineRegex)[0].split(delimiter);

	var hasDate = false;
	if (opts.checkForDate) {
		hasDate = parseUtils.matchDatePattern(columnNames[0]);
	}

	var dsv = d3.dsv(delimiter, "text/plain");
	var data = dsv.parse(input, function(d) {
		each(columnNames, function(column, i) {
			if (i === 0) {
				d[column] = parseKeyColumn(d[column], hasDate);
			} else {
				d[column] = parseValue(d[column], stripCharsRegex, separators.decimal);
			}
		});
		return d;
	});

	return {
		data: data,
		columnNames: columnNames,
		hasDate: hasDate
	};
}

function parseValue(val, _stripChars, decimal) {
	if (_stripChars.test(val)) {
		val = val.replace(_stripChars, "").replace(decimal, ".");
	}

	if (isNaN(parseFloat(val)) === false) {
		return +val;
	} else if (val == "null") {
		return null;
	}
}

function parseKeyColumn(entry, hasDate) {
	if (hasDate) {
		return new Date.create(entry);
	} else {
		return entry;
	}
}

module.exports = parseDelimInput;

