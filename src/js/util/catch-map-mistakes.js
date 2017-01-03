const map = require("lodash/map");
const some = require("lodash/some");
const reduce = require("lodash/reduce");
const sizeof = require("sizeof");

const INTERVAL_BASE_VALS = [1, 2, 2.5, 5, 10, 25]; // used to determine "good" tick intervals
const MAX_TICKS = 8;


function axis_ticks_even(scale) {
	return;
	scale
	const range = (scale.domain[1] - scale.domain[0]);
	const minimum = range / MAX_TICKS;
	const digits = Math.floor(range).toString().length;
	const multiplier = Math.pow(10, (digits - 2));

	const acceptable_intervals = reduce(INTERVAL_BASE_VALS, function(prev, curr) {
		const mult = curr * multiplier;

		if (mult >= minimum) {
			prev = prev.concat([mult]);
		}

		return prev;
	}, []);

	const are_ticks_even = some(acceptable_intervals, function(inter) {
		return all_modulo(scale.tickValues, inter);
	});

	return are_ticks_even;
}

function no_prefix_suffix(scale) {
	return (scale.prefix === "" && scale.suffix === "");
}

// Determine if all tickValues are modulo some interval value
function all_modulo(tickValues, interval) {

	// we can't modulo-check decimals so we need to multiply by 10^Ndecimals
	var maxDecimals = reduce(tickValues, function(prevMax, tick) {
		if ((tick % 1) !== 0) {
			return Math.max(prevMax, tick.toString().split(".")[1].length);
		} else {
			return prevMax;
		}
	}, 0);

	var decimalOffset = Math.pow(10, maxDecimals);
	interval = interval * decimalOffset;

	return reduce(tickValues, function(prev, curr) {
		return prev && ((curr * decimalOffset) % interval === 0);
	}, true);

}

module.exports = {
	axisTicksEven: axis_ticks_even,
	noPrefixSuffix: no_prefix_suffix
};
