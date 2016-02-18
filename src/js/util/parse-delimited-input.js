// Parse a string of TSV or CSV. Returns a flat array of objects of the form { column: value }
// as well as the column names using `d3.dsv`

var d3 = require("d3");
var each = require("lodash/each");
require("sugar-date");
var parseUtils = require("./parse-utils");
var unique = require("lodash").uniq;

// We need this to get the current locale's thousands separator
var SessionStore = require("../stores/SessionStore");

var stripChars = [
	"$",
	"£",
	"€",
	"%"
];

var newLineRegex = /\r\n|\r|\n/;

var separators = SessionStore.get("separators");

function parseDelimInput(input, opts) {
	opts = opts || {};
	delimiter = opts.delimiter || parseUtils.detectDelimiter(input);
	specified_type = opts.type;

	// create regex of special characters we want to strip out as well as our
	// computed locale-specific thousands separator.
	var _stripCharsStr = stripChars.concat([separators.thousands]).reduce(function(a, b) {
		return a.concat(parseUtils.escapeRegExp(b));
	}, []).join("|");
	var stripCharsRegex = new RegExp(_stripCharsStr, "g");

	var columnNames = input.split(newLineRegex)[0].split(delimiter);
	var dsv = d3.dsv(delimiter, "text/plain");
	var all_index_types = [];

	var data = dsv.parse(input, function(d) {
		each(columnNames, function(column, i) {
			if (i === 0) {
				//first column

				var parsed = parseKeyColumn(d[column],opts.type);
				all_index_types.push(parsed.type);
				d[column] = parsed.val;
			}
			else {
				// all other columns

				d[column] = parseValue(d[column], stripCharsRegex, separators.decimal);
			}
		});
		return d;
	});

	var index_types = unique(all_index_types);

	if(index_types.length !== 1) {
		//throw an error or warning that chartbuilder can't auto determine types
	}
	else {
		hasDate = index_types[0] === "date";
		isNumeric = index_types[0] === "number";
	}

	return {
		data: data,
		columnNames: columnNames,
		hasDate: hasDate,
		isNumeric: isNumeric
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

function parseKeyColumn(entry, type) {
	var num = Number(entry);
	if (num || type == "numeric") {
		return {type: "number", val: num};
	}
	else {
		var date = new Date.create(entry);

		if(date || type == "date") {
			return {type: "date", val: date};
		}

		return {type: "string", val: entry};
	}
}

module.exports = parseDelimInput;

