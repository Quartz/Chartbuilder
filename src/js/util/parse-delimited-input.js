// Parse a string of TSV or CSV. Returns a flat array of objects of the form { column: value }
// as well as the column names using `d3.dsv`

var d3 = require("d3");
var each = require("lodash/each");
require("sugar-date");
var parseUtils = require("./parse-utils");
var unique = require("lodash/uniq");
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
var parseErrors = [];

function parseDelimInput(input, opts) {
	opts = opts || {};
	delimiter = opts.delimiter || parseUtils.detectDelimiter(input);
	type = opts.type;

	parseErrors = [];
	// create regex of special characters we want to strip out as well as our
	// computed locale-specific thousands separator.
	var _stripCharsStr = stripChars.concat([separators.thousands]).reduce(function(a, b) {
		return a.concat(parseUtils.escapeRegExp(b));
	}, []).join("|");
	var stripCharsRegex = new RegExp(_stripCharsStr, "g");

	var columnNames = input.split(newLineRegex)[0].split(delimiter);
	var dsv = d3.dsv(delimiter, "text/plain");
	var all_index_types = [];

	var casted_data = cast_data(input, type, columnNames, stripCharsRegex, delimiter);
	var data = casted_data.data;
	all_index_types = casted_data.indexes;
	var all_entry_values = casted_data.entries;
	var index_types = unique(all_index_types);

	if(index_types.length !== 1 && !type) {
		//there is possilby more than one type of data, an error will be thrown in validate-data-input
	} else {
		hasDate = type ? type == "date" : index_types[0] === "date";
		isNumeric = type ? type == "numeric" : index_types[0] === "number";

		if(isNumeric && !type) {
			// if the entries are certain four digit numbers that look like years reparse as years if there isn't a specified type
			var entry_extent = d3.extent(all_entry_values);
			if(entry_extent[0] > 1500 && entry_extent[1] < 3000) {
				data = cast_data(input, "date", columnNames, stripCharsRegex, delimiter).data;
				isNumeric = false;
				hasDate = true;
			}
		}
	}

	return {
		data: data,
		columnNames: columnNames,
		hasDate: hasDate,
		isNumeric: isNumeric,
		type: type
	};
}

function cast_data(input, type, columnNames, stripCharsRegex, delimiter) {
	var dsv = d3.dsv(delimiter, "text/plain");
	var all_index_types = [];
	var all_entry_values = [];
	var data = dsv.parse(input, function(d) {
		each(columnNames, function(column, i) {
			if (i === 0) {
				//first column

				var parsed = parseKeyColumn(d[column],type);
				all_index_types.push(parsed.type);
				all_entry_values.push(parsed.val);
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

	if(index_types.length !== 1 && !type) {

	}
	else {
		hasDate = type ? type == "date" : index_types[0] === "date";
		isNumeric = type ? type == "numeric" : index_types[0] === "number";
	}

	return {
		data: data,
		indexes: all_index_types,
		entries: all_entry_values
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
	} else {
		return val;
	}
}

function parseKeyColumn(entry, type) {

	if (type == "ordinal") {
		return {type: "string", val: entry};
	}

	var num = Number(entry);
	if ((num && !type) || type == "numeric") {
		return {type: "number", val: num};
	}
	else {
		var date = new Date.create(entry);
		if((!isNaN(date) && !type) || type == "date") {
			return {type: "date", val: date};
		}

		return {type: "string", val: entry};
	}
}

module.exports = parseDelimInput;

