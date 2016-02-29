// Functions that process dates given a certain set of frequency and formatting
// settings

// Node modules
var d3 = require("d3");
require("sugar-date");

// Parse dates and return strings based on selected format
var dateParsers = {

	"lmdy": function(d, i, o) {
		if(o) {
			d.addMinutes(o)
		}
		return d.format('{M}/{d}/{yy}');
	},

	"mmdd": function(d, i, o) {
		if(o) {
			d.addMinutes(o)
		}
		return d.format('{M}/{d}');
	},

	"Mdd": function(d, i, o) {
		if(o) {
			d.addMinutes(o)
		}
		var month = d.getMonth() + 1;
		if (month == 5) {
			return d.format('{Month} {d}');
		} else {
			return d.format('{Mon}. {d}');
		}
	},

	"M1d": function(d,i,o) {
		if(o) {
			d.addMinutes(o)
		}
		var date = d.getDate();
		if(date == 1) {
			return dateParsers.M(d);
		} else if (i === 0) {
			return dateParsers.M(d) + d.format(' {d}');
		} else {
			return d.format('{d}');
		}
	},

	"ddM": function(d, i, o) {
		if(o) {
			d.addMinutes(o)
		}
		var month = d.getMonth() + 1;
		if (month == 5) {
			return d.format('{d} {Month}');
		} else {
			return  d.format('{d} {Mon}.');
		}
	},

	"mmyy": function(d, i, o) {
		if(o) {
			d.addMinutes(o)
		}
		return d.format('{M}/' + dateParsers.yyyy(d).slice(-2));
	},

	"yy": function(d, i, o) {
		if(o) {
			d.addMinutes(o)
		}
		return "’" + dateParsers.yyyy(d).slice(-2);
	},

	"yyyy": function(d, i, o) {
		if(o) {
			d.addMinutes(o)
		}
		return "" + d.getFullYear();
	},

	"MM": function(d, i, o) {
		if(o) {
			d.addMinutes(o)
		}
		var month = d.getMonth() + 1;
		if (month == 1) {
			return "" + d.getFullYear();
		} else {
			return d.format('{Month}');
		}
	},

	"M": function(d, i, o) {
		if(o) {
			d.addMinutes(o)
		}
		var month = d.getMonth() + 1;
		if (month == 1) {
			return "’" + dateParsers.yyyy(d).slice(-2);
		} else if (month == 5) {
			return d.format('{Mon}');
		} else {
			return d.format('{Mon}.');
		}
	},

	"hmm": function(d, i, o) {
		if(o) {
			d.addMinutes(o)
		}
		return d.format("{h}:{mm}");
	},

	"h": function(d, i, o) {
		if(o) {
			d.addMinutes(o)
		}
		return d.format("{h}{tt}");
	},

	"QJan": function(d, i, o) {
		if(o) {
			d.addMinutes(o)
		}
		var year = d.getFullYear();
		var month = d.getMonth() + 1;
		var day = d.getDate();
		if (day == 1) {
			if (month == 1) {
				return year;
			}

			if (month == 4 || month == 7 || month == 10) {
				return "Q" + (((month - 1) / 3) + 1);
			}

		}

		return "";
	},

	"QJul": function(d, i, o) {
		if(o) {
			d.addMinutes(o)
		}
		var year = d.getFullYear();
		var month = d.getMonth() + 1;
		var day = d.getDate();
		if (day == 1) {
			if (month == 7) {
				return year;
			}

			if (month == 1) {
				return "Q3";
			}

			if (month == 4) {
				return "Q4";
			}

			if (month == 10) {
				return "Q2";
			}

		}
		return "";
	}
};

// Define time intervals and number of steps for date frequency options
var dateFrequencies = {
	"auto": {
		interval: null,
		steps: null
	},
	"1h": function(minDate, maxDate) {
		var interval = d3.time.hour;
		return interval.range(minDate, maxDate, 1);
	},
	"2h": function(minDate, maxDate) {
		var interval = d3.time.hour;
		return interval.range(minDate, maxDate, 2);
	},
	"3h": function(minDate, maxDate) {
		var interval = d3.time.hour;
		return interval.range(minDate, maxDate, 3);
	},
	"4h": function(minDate, maxDate) {
		var interval = d3.time.hour;
		return interval.range(minDate, maxDate, 4);
	},
	"6h": function(minDate, maxDate) {
		var interval = d3.time.hour;
		return interval.range(minDate, maxDate, 6);
	},
	"1d": function(minDate, maxDate) {
		var interval = d3.time.day;
		return interval.range(minDate, maxDate, 1);
	},
	"1w": function(minDate, maxDate) {
		var interval = d3.time.week;
		return interval.range(minDate, maxDate, 1);
	},
	"1m": function(minDate, maxDate) {
		var interval = d3.time.month;
		return interval.range(minDate, maxDate, 1);
	},
	"3m": function(minDate, maxDate) {
		var interval = d3.time.month;
		return interval.range(minDate, maxDate, 3);
	},
	"6m": function(minDate, maxDate) {
		var interval = d3.time.month;
		return interval.range(minDate, maxDate, 6);
	},
	"1y": function(minDate, maxDate) {
		var interval = d3.time.year;
		maxDate = d3.time.day.offset(maxDate, 1);
		return interval.range(minDate, maxDate, 1);
	},
	"2y": function(minDate, maxDate) {
		var interval = d3.time.year;
		maxDate = d3.time.day.offset(maxDate, 1);
		return interval.range(minDate, maxDate, 2);
	},
	"5y": function(minDate, maxDate) {
		var interval = d3.time.year;
		maxDate = d3.time.day.offset(maxDate, 1);
		return interval.range(minDate, maxDate, 5);
	},
	"10y": function(minDate, maxDate) {
		var interval = d3.time.year;
		maxDate = d3.time.day.offset(maxDate, 1);
		return interval.range(minDate, maxDate, 10);
	},
	"20y": function(minDate, maxDate) {
		var interval = d3.time.year;
		maxDate = d3.time.day.offset(maxDate, 1);
		return interval.range(minDate, maxDate, 20);
	},
	"100y": function(minDate, maxDate) {
		var interval = d3.time.year;
		maxDate = d3.time.day.offset(maxDate, 1);
		return interval.range(minDate, maxDate, 100);
	},
};

function humanReadableNumber(n) {
	//turns a number into an int that is either 1, 2, 5, or a multiple of 10
	var rounded = Math.round(n);
	if (rounded < 2) {
		return 1;
	}

	if (n < 3.5) {
		return 2;
	}

	if (n < 7) {
		return 5;
	}

	if (n <= 10) {
		return 10;
	}

	var magnitude = Math.floor((Math.log(n) / Math.LN10)) + 1;
	var factor = Math.pow(10,magnitude);
	return humanReadableNumber(n/factor) * factor;
}

// Automatically calculate date frequency if not selected
function autoDateFormatAndFrequency(minDate, maxDate, dateFormat, availableWidth) {
	var timespan = Math.abs(maxDate - minDate);
	var years = timespan / 31536000000;
	var months = timespan / 2628000000;
	var days = timespan / 86400000;
	var yearGap;
	var hourGap;
	var interval;

	var targetPixelGap = 64;
	var maximum_ticks = Math.floor(availableWidth / targetPixelGap);
	var time_gap = timespan / maximum_ticks;

	if (dateFormat == "auto") {
		//lets go small to large
		if (days <= 2) {
			dateFormat = "h";
		}
		else if (days <= 91) {
			dateFormat = "M1d";
		}
		else if (months < 36) {
			dateFormat = "M";
		}
		else {
			dateFormat = "yy";
		}
	}

	var gapInYears = humanReadableNumber(Math.floor(time_gap / 31536000000));
	var gapInMonths = Math.ceil(time_gap / 2628000000);
	var gapInDays = humanReadableNumber(time_gap / 86400000);
	var gapInHours = humanReadableNumber(time_gap / 3600000);

	//make sure that the interval include the maxDate in the interval list
	maxDate.addMilliseconds(0.1);

	switch (dateFormat) {
		case "yy":
			// Add a day to the max date for years to make inclusive of max date
			// irrespective of time zone / DST
			maxDate = d3.time.day.offset(maxDate, 1);
			interval = d3.time.year.range(minDate, maxDate, gapInYears);
			break;

		case "yyyy":
			// See above
			maxDate = d3.time.day.offset(maxDate, 1);
			interval = d3.time.year.range(minDate, maxDate, gapInYears);
			break;

		case "MM":
			interval = d3.time.month.range(minDate, maxDate, gapInMonths);
			break;

		case "M":
			interval = d3.time.month.range(minDate, maxDate, gapInMonths);
			break;

		case "Mdd":
			interval = d3.time.day.range(minDate, maxDate, gapInDays);
			break;

		case "M1d":
			interval = d3.time.day.range(minDate, maxDate, gapInDays);
			break;

		case "YY":
			interval = d3.time.year.range(minDate, maxDate, gapInYears);
			break;

		case "QJan":
			interval = d3.time.month.range(minDate, maxDate, 4);
			break;

		case "QJul":
			interval = d3.time.month.range(minDate, maxDate, 4);
			break;

		case "h":
			interval = d3.time.hour.range(minDate, maxDate, gapInHours);
			break;

		default:
			interval = d3.time.year.range(minDate, maxDate, 1);
	}

	interval = cleanInterval(interval);
	return {"format": dateFormat, "frequency": interval};
}

function cleanInterval(interval) {
	return interval.reduce(function(out, currDate, i, arr) {
		if (i === 0) {
			return [currDate];
		}
		var prevDate = out[out.length - 1].getDate();
		var excludeRange = (prevDate >= 28 && prevDate <= 31);
		if(excludeRange && currDate.getDate() == 1) {
			out.pop();
			return out.concat(currDate);
		} else {
			return out.concat(currDate);
		}
	}, []);
}

module.exports = {
	dateParsers: dateParsers,
	dateFrequencies: dateFrequencies,
	autoDateFormatAndFrequency: autoDateFormatAndFrequency
};
