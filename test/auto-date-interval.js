var test = require("tape");
require("sugar-date"); // sugar is used for date parsing
var processDates = require("../src/js/util/process-dates");
var auto = processDates.autoDateFormatAndFrequency;
var width = 640;
var minDate;
var maxDate;
var ff;

test("auto date interval:", function(t) {
	t.plan(4);

	minDate = new Date(2010, 0, 1);
	maxDate = new Date(2010, 0, 2);
	ff = auto(minDate, maxDate, "auto", width);
	t.equal(ff.format, "h", "return hours for proper interval");

	minDate = new Date(2010, 0, 1);
	maxDate = new Date(2010, 2, 1);
	ff = auto(minDate, maxDate, "auto", width);
	t.equal(ff.format, "M1d", "return months/days for proper interval");

	minDate = new Date(2010, 0, 1);
	maxDate = new Date(2010, 12, 1);
	ff = auto(minDate, maxDate, "auto", width);
	t.equal(ff.format, "M", "return months for proper interval");

	minDate = new Date(2010, 0, 1);
	maxDate = new Date(2015, 12, 1);
	ff = auto(minDate, maxDate, "auto", width);
	t.equal(ff.format, "yy", "return years for proper interval");

	t.end();
});
