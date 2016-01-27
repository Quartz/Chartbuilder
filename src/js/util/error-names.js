/*
* Error/Warning names
* Types: 1 = success, 2 = warning, 3 = error
*/

var error_names = {
	"EMPTY": {
		location: "input",
		text: "Enter some data above.",
		type: 3
	},
	"UNEVEN_SERIES": {
		location: "input",
		text: "At least one of your rows does not have the same number of columns as the rest.",
		type: 3
	},
	"COLUMN_ZERO": {
		location: "input",
		text: "You have a column chart that doesn't have a zero axis. Double check that this is ok.",
		type: 2
	},
	"TOO_MANY_SERIES": {
		location: "input",
		text: "You have more than 12 columns, which is more than Chartbuilder supports.",
		type: 3
	},
	"TOO_FEW_SERIES": {
		location: "input",
		text: "You have fewer than 2 rows, which is fewer than Chartbuilder supports.",
		type: 3
	},
	"NAN_VALUES": {
		location: "input",
		text: "At least one of your data points cannot be converted into a number",
		type: 3
	},
	"NOT_DATES": {
		location: "input",
		text: "A least one of your dates cannot be understood by Chartbuilder",
		type: 3
	}
};

module.exports = error_names;
