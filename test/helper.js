var test = require("tape");
var help = require("../src/js/util/helper");
var util = require("./util/util");

function isInteger(x) {
	return x % 1 === 0;
}

test("helper: exact ticks", function(t) {
	t.plan(2);

	var et = help.exactTicks;
	var domain_no_zero = [util.randInt(1, 10), util.randInt(11, 1000)];
	var domain_pass_zero = [util.randInt(-1000, -500), util.randInt(500, 1000)];
	var numTicks = 5;

	t.equal(et(domain_no_zero, numTicks).length, numTicks, "length of tick array matches number given");

	var passZero = et(domain_pass_zero, numTicks);
	t.ok((passZero.indexOf(0) > -1), "domain that passes zero contains tick of zero");
	t.end();
});

test("helper: round to precision", function(t) {
	t.plan(3);

	var rtp = help.roundToPrecision;
	var rand_float = util.randInt(1, 200) + Math.random();
	var precision_float = util.randInt(1, 4);
	var decimalPoints;

	t.equal(rtp(0, util.randInt(1, 4)), "0", "if passed 0 return \"0\" regardless of precision");

	t.ok(isInteger(rtp(rand_float, 0)), "precision 0 returns an integer");

	// using this method instead of ours as we have to test ours
	digits_after_dec = rtp(rand_float, precision_float).split(".")[1].length;
	t.equal(digits_after_dec, precision_float, "number of digits following decimal point matches argument");
});

test("helper: compute scale domain", function(t) {
	t.plan(6);

	var csd = help.computeScaleDomain;
	var scaleObj = {};
	var expect;
	var processScale;

	var no_opts = [1, 25, 50, 75, 99];
	expect = { domain: [1, 99], custom: false };
	t.deepEqual(csd(scaleObj, no_opts), expect, "returns [ data[0], data[data.length - 1] ] if no options given");

	var nice = [1, 25, 50, 75, 99];
	expect = { domain: [0, 100], custom: false };
	t.deepEqual(csd(scaleObj, nice, { nice: true }), expect, "returns niced values if { nice: true } set");

	var force_zero = [10, 20, 30, 40];
	t.equal(csd(scaleObj, force_zero, { minZero: true }).domain[0], 0, "sets domain[0] to 0 if { minZero: true } set");

	var negative = [-50, -25, 0, 25, 50];
	t.equal(csd(scaleObj, negative, { minZero: true }).domain[0], -50, "sets domain[0] to negative number even if { minZero: true } set");

	scaleObj = { domain: [5, 95], custom: true };
	processScale = csd(scaleObj, nice, { nice: true });
	t.ok(processScale.custom, "respects custom values even if { nice: true } set");

	scaleObj = { domain: [0, 100], custom: false };
	var new_data = [0, 100, 200, 300, 400, 500];
	expect = { domain: [0, 500], custom: false };
	processScale = csd(scaleObj, new_data, { nice: true });
	t.deepEqual(processScale, expect, "updates domain if new data extent entered and scale is not custom");

	t.end();
});

test("helper: detect precision", function(t) {
	t.plan(1);
	var p = help.precision;
	var rand_float = util.randInt(1, 10) + Math.random();
	var rand_precision = util.randInt(1, 6);
	var to_fixed = parseFloat(rand_float.toFixed(rand_precision));
	digits_after_dec = to_fixed.toString().split(".")[1].length;
	t.equal(p(to_fixed), digits_after_dec, "precision returns same value passed to toFixed");
	t.end();
});

test("helper: precision of NaN is 0", function(t) {
	t.plan(1);
	var p = help.precision;
	t.equal(p(0 / 0), 0);
	t.end();
});

test("helper: convert timezone strings", function(t) {
	t.plan(8);
	var p = help.TZOffsetToMinutes
	t.equal(p("Z"),0,"Z timezone returns offset of 0 mintues")
	t.equal(p("-00:00"), 0, "+0000 tz offset returns 0 minutes")
	t.equal(p("+00:00"), 0, "+0000 tz offset returns 0 minutes")
	t.equal(p("-08:00"), -480, "-0800 tz offset returns -480 minutes")
	t.equal(p("+05:00"), 300, "+0500 tz offset returns 600 minutes")
	t.equal(p("+04:30"), 270, "+0430 tz offset returns 270 minutes")
	t.equal(p("-04:30"), -270, "-0430 tz offset returns -270 minutes")
	t.equal(p("+10:00"), 600, "+1030 tz offset returns 600 minutes")
	t.end();
})
