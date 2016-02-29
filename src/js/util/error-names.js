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
		text: "You have fewer than 2 columns, which is fewer than Chartbuilder supports.",
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
	},
	"TOO_MUCH_DATA": {
		location: "input",
		text: "You have more data than can be rendered or saved correctly",
		type: 2
	},
	"CANT_AUTO_TYPE": {
		location: "input",
		text: "The type of information in the first column of your data cannot be automatically determined. Please seleect one below.",
		type: 2,
	},
	"UNEVEN_TICKS": {
		location: "axis",
		text: "Your y-axis tick intervals do not divide cleanly",
		type: 2
	},
	"NO_PREFIX_SUFFIX": {
		location: "axis",
		text: "You are missing a prefix and suffix. Consider labelling your data",
		type: 2
	},
	"LARGE_NUMBERS": {
		location: "input",
		text: "Your numbers are large. Consider dividing and labelling the unit in the axis",
		type: 2
	}
};

module.exports = error_names;
