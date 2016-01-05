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
		checkForDate: opts.checkForDate
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

	var reduced_series = reduce_resolution(series);

	validatedInput = validateDataInput(input, series, parsedInput.hasDate);

	return {
		series: reduced_series,
		input: validatedInput,
		hasDate: parsedInput.hasDate
	};
}

function reduce_resolution(series) {
	var max_num = 640
	var natural_direction = series[0].values[0].entry > series[0].values[1].entry ? -1 : 1
	return series.map(function(d,i) {
		if(d.values.length < max_num ) {
			return d
		}
		
		var reduced_values = []
		//this assumes equal spacing of the dates
		points_per_pixel = Math.floor(d.values.length / max_num * 2) + 1
		for (var j = 0; j < d.values.length; j += points_per_pixel) {
			var max = null;
			var min = null;
			var cur = null;

			d.values.slice(j,j+points_per_pixel)
				.forEach(function(cur,k){
					if(!max || cur.value > max.value) {
						max = cur
					}

					if(!min || cur.value < min.value) {
						min = cur;
					}
				})

			extents = [max,min]
			extents.sort(function(a,b){return (a.entry.getTime() - b.entry.getTime()) * natural_direction})

			reduced_values.push(extents[0])
			if(max != min) {
				reduced_values.push(extents[1])
			}
			
		};
		
		d.values = reduced_values;

		return d


	})
}

module.exports = dataBySeries;
