var test = require("tape");
var _ = require("lodash");
require("sugar-date");

var processDates = require("../src/js/util/process-dates");
var dateFrequencies = processDates.dateFrequencies;
var hours_ms = 3600000;
var days_ms = 86400000;
var months_ms = 2628000000;
var years_ms = 31536000000;

var minDate;
var maxDate;
var target_gap;
var freqs;
var interval;
var f;

test("date frequencies", function(t) {
	// subtract 2 because auto is tested separately
	t.plan(Object.keys(dateFrequencies).length - 2);

	f = dateFrequencies["1h"];
	target_gap = hours_ms;
	minDate = new Date(1999, 11, 31, 22, 0, 0);
	maxDate = new Date(2000, 0, 1, 24, 0, 0);
	freqs = f(minDate, maxDate);
	interval = check_ms_interval(freqs, target_gap);

	t.ok(interval, "All 1hr intervals match target date gap");

	f = dateFrequencies["2h"];
	target_gap = hours_ms * 2;
	minDate = new Date(1999, 11, 31, 22, 0, 0);
	maxDate = new Date(2000, 0, 1, 24, 0, 0);
	freqs = f(minDate, maxDate);
	interval = check_ms_interval(freqs, target_gap);

	f = dateFrequencies["3h"];
	target_gap = hours_ms * 3;
	minDate = new Date(1999, 11, 31, 22, 0, 0);
	maxDate = new Date(2000, 0, 1, 24, 0, 0);
	freqs = f(minDate, maxDate);
	interval = check_ms_interval(freqs, target_gap);

	t.ok(interval, "All 3hr intervals match target date gap");

	f = dateFrequencies["4h"];
	target_gap = hours_ms * 4;
	minDate = new Date(1999, 11, 31, 22, 0, 0);
	maxDate = new Date(2000, 0, 1, 24, 0, 0);
	freqs = f(minDate, maxDate);
	interval = check_ms_interval(freqs, target_gap);

	t.ok(interval, "All 4hr intervals match target date gap");

	f = dateFrequencies["6h"];
	target_gap = hours_ms * 6;
	minDate = new Date(1999, 11, 31, 22, 0, 0);
	maxDate = new Date(2000, 0, 1, 24, 0, 0);
	freqs = f(minDate, maxDate);
	interval = check_ms_interval(freqs, target_gap);

	t.ok(interval, "All 6hr intervals match target date gap");

	f = dateFrequencies["1d"];
	target_gap = days_ms;
	minDate = new Date(1999, 0, 1, 0);
	maxDate = new Date(2000, 0, 2, 1);
	freqs = f(minDate, maxDate);
	interval = check_ms_interval(freqs, target_gap);

	t.ok(interval, "All 1d intervals match target date gap");

	f = dateFrequencies["1w"];
	target_gap = days_ms * 7;
	minDate = new Date(1999, 0, 1);
	maxDate = new Date(2000, 0, 1);
	freqs = f(minDate, maxDate);
	interval = check_ms_interval(freqs, target_gap);

	t.ok(interval, "All 1w intervals match target date gap");

	f = dateFrequencies["1m"];
	target_gap = 1;
	minDate = new Date(1999, 0, 1);
	maxDate = new Date(2005, 0, 1);
	freqs = f(minDate, maxDate);
	interval = check_month_interval(freqs, target_gap);

	t.ok(interval, "All 1m intervals match target date gap");

	f = dateFrequencies["3m"];
	target_gap = 3;
	minDate = new Date(1999, 0, 1);
	maxDate = new Date(2005, 0, 1);
	freqs = f(minDate, maxDate);
	interval = check_month_interval(freqs, target_gap);

	t.ok(interval, "All 3m intervals match target date gap");

	f = dateFrequencies["6m"];
	target_gap = 6;
	minDate = new Date(1999, 0, 1);
	maxDate = new Date(2005, 0, 1);
	freqs = f(minDate, maxDate);
	interval = check_month_interval(freqs, target_gap);

	t.ok(interval, "All 6m intervals match target date gap");

	f = dateFrequencies["1y"];
	target_gap = 1;
	minDate = new Date(1999, 0, 1);
	maxDate = new Date(2015, 0, 1);
	freqs = f(minDate, maxDate);
	interval = check_year_interval(freqs, target_gap);

	t.ok(interval, "All 1y intervals match target date gap");

	f = dateFrequencies["2y"];
	target_gap = 2;
	minDate = new Date(1999, 0, 1);
	maxDate = new Date(2015, 0, 1);
	freqs = f(minDate, maxDate);
	interval = check_year_interval(freqs, target_gap);

	t.ok(interval, "All 2y intervals match target date gap");

	f = dateFrequencies["5y"];
	target_gap = 5;
	minDate = new Date(1999, 0, 1);
	maxDate = new Date(2015, 0, 1);
	freqs = f(minDate, maxDate);
	interval = check_year_interval(freqs, target_gap);

	t.ok(interval, "All 5y intervals match target date gap");

	f = dateFrequencies["10y"];
	target_gap = 10;
	minDate = new Date(1999, 0, 1);
	maxDate = new Date(2015, 0, 1);
	freqs = f(minDate, maxDate);
	interval = check_year_interval(freqs, target_gap);

	t.ok(interval, "All 10y intervals match target date gap");

	f = dateFrequencies["20y"];
	target_gap = 20;
	minDate = new Date(1999, 0, 1);
	maxDate = new Date(2015, 0, 1);
	freqs = f(minDate, maxDate);
	interval = check_year_interval(freqs, target_gap);

	t.ok(interval, "All 20y intervals match target date gap");

	f = dateFrequencies["100y"];
	target_gap = 100;
	minDate = new Date(1599, 0, 1);
	maxDate = new Date(2015, 0, 1);
	freqs = f(minDate, maxDate);
	interval = check_year_interval(freqs, target_gap);

	t.ok(interval, "All 100y intervals match target date gap");
});

function check_ms_interval(arr, gap) {
	return _.reduce(arr, function(a, b, i) {
		if (i === 0) {
			return gap;
		}
		return (arr[i] - arr[i - 1]) === gap;
	}, gap);
}

function check_month_interval(arr, gap) {
	return _.reduce(arr, function(a, b, i) {
		if (i === 0) {
			return gap;
		}
		return (arr[i].getMonth() - arr[i - 1].getMonth()) === gap;
	}, gap);
}

function check_year_interval(arr, gap) {
	return _.reduce(arr, function(a, b, i) {
		if (i === 0) {
			return gap;
		}
		return (arr[i].getYear() - arr[i - 1].getYear()) === gap;
	}, gap);
}

