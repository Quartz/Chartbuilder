var test = require("tape");
require("sugar-date"); // sugar is used for date parsing

var processDates = require("../src/js/util/process-dates");
var dateParsers = processDates.dateParsers;
var now = new Date();
var date1 = new Date(1982, 0, 1);
var date2 = new Date(1998, 4, 15);
var date3 = new Date(2015, 7, 31);
var date4 = new Date(2015, 2, 1);

var date5 = new Date.create("2016-02-02T12:00:00" + now.getUTCOffset());
var date6 = new Date.create("2016-02-02T12:00:00-0500");

var p;

test("date parsers", function(t) {
	t.plan(30);

	p = dateParsers["lmdy"];
	t.equal(p(date1), "1/1/82", "lmdy format");
	t.equal(p(date2), "5/15/98", "lmdy format");
	t.equal(p(date3), "8/31/15", "lmdy format");

	p = dateParsers["mmdd"];
	t.equal(p(date1), "1/1", "mmdd format");
	t.equal(p(date2), "5/15", "mmdd format");
	t.equal(p(date3), "8/31", "mmdd format");

	p = dateParsers["Mdd"];
	t.equal(p(date1), "Jan. 1", "Mdd format");
	t.equal(p(date2), "May 15", "Mdd format");
	t.equal(p(date3), "Aug. 31", "Mdd format");

	p = dateParsers["M1d"];
	t.equal(p(date1), "’82", "M1d format");
	t.equal(p(date2), "15", "M1d format");
	t.equal(p(date3), "31", "M1d format");
	t.equal(p(date4), "Mar.", "M1d format");

	p = dateParsers["ddM"];
	t.equal(p(date1), "1 Jan.", "ddM format");
	t.equal(p(date2), "15 May", "ddM format");
	t.equal(p(date3), "31 Aug.", "ddM format");

	p = dateParsers["mmyy"];
	t.equal(p(date1), "1/82", "mmy format");
	t.equal(p(date2), "5/98", "mmy format");
	t.equal(p(date3), "8/15", "mmy format");

	p = dateParsers["yy"];
	t.equal(p(date1), "’82", "yy format");
	t.equal(p(date2), "’98", "yy format");
	t.equal(p(date3), "’15", "yy format");

	p = dateParsers["yyyy"];
	t.equal(p(date1), "1982", "yy format");
	t.equal(p(date2), "1998", "yy format");
	t.equal(p(date3), "2015", "yy format");

	p = dateParsers["MM"];
	t.equal(p(date1), "1982", "MM format");
	t.equal(p(date2), "May", "MM format");
	t.equal(p(date3), "August", "MM format");

	p = dateParsers["h"]
	t.equal(p(date5), "12pm", "h format")
	t.equal(p(date6, 0, now.getTimezoneOffset() - 300), "12pm", "h format, timezone adjusted")

	t.end();
});
