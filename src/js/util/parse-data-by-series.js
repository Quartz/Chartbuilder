// Separate a flat array of `{ column: value }` objects into a multi-array, one
// for each column. Each object contains a `values` array, with each entry
// looking like:
// ```
// { entry: <rowName>, value: <callValue> }
// ```

var datePattern = /date|time|year/i;
var parseDelimInput = require("./parse-delimited-input");
var validateDataInput = require("./validate-data-input");

// Parse data by series. Options:
// checkForDate: bool | tell parser to return dates if key column is date/time/year
function dataBySeries(input, opts) {
	opts = opts || {};
	var parsedInput = parseDelimInput(input, {
		checkForDate: opts.checkForDate,
		type: opts.type
	});

	var columnNames = parsedInput.columnNames;
	var keyColumn = columnNames.shift();

	var series = columnNames.map(function(header, i) {
		return {
			name: header,
			values: parsedInput.data.map(function(d) {
				return {
					name: header,
					entry: d[keyColumn],
					value: d[header]
				};
			})
		};
	});
	console.log(parsedInput)
	validatedInput = validateDataInput(input, series, parsedInput.hasDate, opts.type);

	return {
		series: series,
		input: validatedInput,
		hasDate: parsedInput.hasDate,
		isNumeric: parsedInput.isNumeric
	};
}

module.exports = dataBySeries;
