/*
* Error/Warning names
* Types: 1 = success, 2 = warning, 3 = error
*/

var error_names = {
	"EMPTY": {
		location: "input",
		text: "Enter some data above.",
		type: "error"
	},
	"UNEVEN_SERIES": {
		location: "input",
		text: "At least one of your rows does not have the same number of columns as the rest.",
		type: "error"
	},
	"COLUMN_ZERO": {
		location: "input",
		text: "You have a column chart that doesn't have a zero axis. Double check that this is ok.",
		type: "warning"
	},
	"TOO_MANY_SERIES": {
		location: "input",
		text: "You have more than 12 columns, which is more than Chartbuilder supports.",
		type: "error"
	},
	"TOO_FEW_SERIES": {
		location: "input",
		text: "You have fewer than 2 columns, which is fewer than Chartbuilder supports.",
		type: "error"
	},
	"NAN_VALUES": {
		location: "input",
		text: "At least one of your data points cannot be converted into a number",
		type: "error"
	},
	"NOT_DATES": {
		location: "input",
		text: "A least one of your dates cannot be understood by Chartbuilder",
		type: "error"
	},
	"TOO_MUCH_DATA": {
		location: "input",
		text: "You have more data than can be rendered or saved correctly",
		type: "warning"
	},
	"CANT_AUTO_TYPE": {
		location: "input",
		text: "The type of information in the first column of your data cannot be automatically determined. Please select one below.",
		type: "warning",
	},
	"UNEVEN_TICKS": {
		location: "axis",
		text: "Adjust axis settings to make your y-axis ticks even",
		type: "warning"
	},
	"NO_PREFIX_SUFFIX": {
		location: "axis",
		text: "You are missing a prefix and suffix. Consider labelling your data",
		type: "warning"
	},
	"LARGE_NUMBERS": {
		location: "input",
		text: "Your numbers are large. Consider dividing and labelling the unit in the axis",
		type: "warning"
	},
	"UNEVEN_TZ": {
		location: "input",
		text: "Some of your dates are specified with timezones and some of them are not. This may cause erroneous plotting.",
		type: "warning"
	}
};

module.exports = error_names;
