// Separate a flat array of `{ column: value }` objects into a multi-array, one
// for each column. Each object contains a `values` array, with each entry
// looking like:
// ```
// { entry: <rowName>, value: <callValue> }
// ```
import {each, map, remove, clone, difference} from 'lodash';

const parseDelimInput = require("./parse-delimited-input").parser;

// Parse data by series. Options:
function dataBySeries(input, chartProps, opts) {

		opts = opts || {};

		const parsedInput = parseDelimInput(input, {
				type: opts.type
		});

	const columnNames = parsedInput.columnNames;
	const columnNamesSaved = clone(columnNames);
	const keyColumn = columnNames.shift();
	const valueColumn = columnNames.length === 1 ? columnNames[0] : columnNames[1];

	const series = [];
	let uniquesParsed;

	// parse when there is a group column
	if (columnNames.length === 2) {

		const uniques = [];
		map(parsedInput.data, function (z) {
			if (uniques.indexOf(z[columnNames[0]]) < 0) uniques.push(z[columnNames[0]]);
		});

		const priorUniques = [];
		each(chartProps.chartSettings, function (z) {
			if (z.label !== undefined) priorUniques.push(z.label);
		});

		const uniquesDifference = difference(uniques, priorUniques);
		const uniquesLess = difference(priorUniques, uniques);

		uniquesParsed = clone(uniques);
		// order the groups so that any new groups are put last. remove any outdated groups.
		if (uniquesLess.length) {
			uniquesParsed = remove(uniques, function(n) {
						return n !== uniquesLess[0];
					});
		}
		else if (priorUniques.length <= uniques.length && priorUniques.length) {
			each(uniquesDifference, function(z) {
					priorUniques.push(z);
			});
			uniquesParsed = priorUniques;
		}
	}
	// parse when there is not
	else {

		series.push({
			name: 'Legend group',
			index: 0,
			values: parsedInput.data.filter(function(d) {
									return {
											name: 'Legend group',
											entry: d[keyColumn],
											value: d[valueColumn]
									};
					})
		});
	}

	map(uniquesParsed, function(q,i) {
			series.push({
					name: q,
					index: i,
					values: parsedInput.data.filter(function(d) {
							if (q === d[columnNames[0]]) {
									return {
											name: q,
											entry: d[keyColumn],
											value: d[valueColumn]
									};
							}
					})
			});
	});


	parsedInput.columnNames = columnNamesSaved;

		return {
				series: series,
				data: parsedInput,
				input: { raw: input, type: opts.type },
				isNumeric: parsedInput.isNumeric && (!opts.type || opts.type === "numeric")
		};
}

module.exports = dataBySeries;
