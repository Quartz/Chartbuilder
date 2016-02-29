var test = require("tape");
var _ = require("lodash");

var catchChartMistakes = require("../src/js/util/catch-chart-mistakes");

test("catch common chart mistakes", function(t) {
	t.plan(8);

	var evenTicks = {
		domain: [-2.0, 0],
		tickValues: [-2.0, -1.5, -1.0, -1.5, 0]
	};

	t.ok(catchChartMistakes.axisTicksEven(evenTicks), "negative scale with even ticks passes");

	evenTicks = {
		domain: [1.0, 2.0],
		tickValues: [1.0, 1.2, 1.4, 1.6, 1.8, 2.0]
	};

	t.ok(catchChartMistakes.axisTicksEven(evenTicks), "small scale with even ticks passes");

	evenTicks = {
		domain: [0, 400],
		tickValues: [0, 100, 200, 300, 400]
	};

	t.ok(catchChartMistakes.axisTicksEven(evenTicks), "medium scale with even ticks passes");

	evenTicks = {
		domain: [50000, 200000],
		tickValues: [50000, 75000, 100000, 125000, 150000, 175000, 200000]
	};

	t.ok(catchChartMistakes.axisTicksEven(evenTicks), "large scale with even ticks passes");

	var unevenTicks = {
		domain: [0, -35],
		tickValues: [0, -7, -14, -21, -28, -35]
	};

	t.notOk(catchChartMistakes.axisTicksEven(unevenTicks), "negative scale with uneven ticks fails");

	unevenTicks = {
		domain: [0, 0.3],
		tickValues: [0, 0.075, 0.150, 0.225, 0.3]
	};

	t.notOk(catchChartMistakes.axisTicksEven(unevenTicks), "small scale with uneven ticks fails");

	unevenTicks = {
		domain: [0, 60],
		tickValues: [0, 12, 24, 36, 48, 60]
	};

	t.notOk(catchChartMistakes.axisTicksEven(unevenTicks), "medium scale with uneven ticks fails");

	unevenTicks = {
		domain: [5000, 200000],
		tickValues: [50000, 87500, 125000, 162500, 200000]
	};

	t.notOk(catchChartMistakes.axisTicksEven(unevenTicks), "large scale with uneven ticks fails");

	t.end();
});
