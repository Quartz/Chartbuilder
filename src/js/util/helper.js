var isArray = require("lodash/isArray");
var isUndefined = require("lodash/isUndefined");
var keys = require("lodash/keys");
var reduce = require("lodash/reduce");
var d3 = require("d3");
var processDates = require("./process-dates");

/**
 * Generate an exact number of ticks given a domain
 *
 * @param {number[]} domain - min/max of the current scale
 * @param {number} numticks - desired number of ticks
 * @return {string[]} Array of ticks
 * @static
 * @memberof helper
 */
function exact_ticks(domain, numticks) {
	numticks -= 1;
	var ticks = [];
	var delta = domain[1] - domain[0];
	var i;
	for (i = 0; i < numticks; i++) {
		ticks.push(domain[0] + (delta / numticks) * i);
	}
	ticks.push(domain[1]);

	if (domain[1] * domain[0] < 0) {
		//if the domain crosses zero, make sure there is a zero line
		var hasZero = false;
		for (i = ticks.length - 1; i >= 0; i--) {
			//check if there is already a zero line
			if (ticks[i] === 0) {
				hasZero = true;
			}
		}
		if (!hasZero) {
			ticks.push(0);
		}
	}

	return ticks;
}

/**
 * compute_scale_domain
 *
 * @param scaleObj - Current scale before generating new domain
 * @param {number[]} data - All values in the current scale
 * @param {object} opts - Whether to return nice values or force a minimum of 0
 * or below
 * @return {object} { domain: [min, max], custom: <boolean> }
 * @static
 * @memberof helper
 */
function compute_scale_domain(scaleObj, data, opts) {
	// Compute the domain (`[min, max]`) of a scale based on its data points.
	// `data` is a flat array of all values used in this scale, and is
	// created by `input-parsers/parse-<chart>.js`
	opts = opts || {};
	var scaleDomain = scaleObj.domain || [];
	var _domain;
	var defaultMin;
	var defaultMax;

	if (!isArray(data)) {
		throw new TypeError("data passed to compute_scale_domain must be an array");
	}

	var extent = d3.extent(data);
	var niced = d3.scale.linear()
			.domain(extent)
			.nice()
			.domain();

	if (!scaleObj.domain || !scaleObj.custom) {
		if (opts.nice) {
			_domain = niced;
		} else {
			_domain = extent;
		}
		defaultMin = true;
		defaultMax = true;
	} else {
		_domain = (opts.nice) ? niced : extent;
		defaultMin = (_domain[0] === scaleDomain[0] || isUndefined(scaleDomain[0]));
		defaultMax = (_domain[1] === scaleDomain[1] || isUndefined(scaleDomain[1]));
		_domain = scaleDomain;
	}

	if (opts.minZero) {
		_domain[0] = Math.min(_domain[0], 0);
	}

	return {
		domain: _domain,
		custom: (!defaultMin || !defaultMax)
	};
}

/**
 * round_to_precision
 * Round a number to N decimal places
 *
 * @param {number} num - Number to be rounded
 * @param {number} precision - Desired precision
 * @param {boolean} supress_thou_sep
 * @static
 * @memberof helper
 * @return {number} Rounded number
 */
function round_to_precision(num, precision, supress_thou_sep) {
	if (num === 0) {
		//zero should always be "0"
		return "0";
	}

	var s = Math.round(num * Math.pow(10,precision)) / Math.pow(10,precision);
	s = s + "";

	s = s.split(".");

	if (s.length == 1) {
		s[1] = "";
	}

	if (s[1].length < precision) {
		s[1] += Array(precision-s[1].length + 1).join("0");
	}

	if (!supress_thou_sep) {
		s[0] = d3.format(",")(parseInt(s[0]));
	}

	if (precision === 0) {
		return s[0];
	}

	return s.join(".");
}

/**
 * combine_margin_pading
 *
 * @param m
 * @param p
 * @static
 * @memberof helper
 * @return {object}
 */
function combine_margin_pading(m,p) {
	return {
		top: m.top + p.top,
		right: m.right + p.right,
		bottom: m.bottom + p.bottom,
		left: m.left + p.left
	};
}

/**
 * precision
 *
 * @param a
 * @static
 * @memberof helper
 * @return {undefined}
 */
function precision(a) {
  // http://stackoverflow.com/a/27865285/1181761

  // guard for NaN
  if (a === a) {
		var e = 1;
		while (Math.round(a * e) / e !== a) e *= 10;
		return Math.round(Math.log(e) / Math.LN10);
  } else {
		return 0;
  }
}

/**
 * transform_coords
 *
 * @param transformString
 * @static
 * @memberof helper
 * @return {undefined}
 */
function transform_coords(transformString) {
	// Split on both space and comma because IE10 likes spaces?
	var s = transformString.split(/\s|,/);
	return [s[0].split("(")[1],s[1].split(")")[0]].map(parseFloat);
}

/**
 * Given a defaults object and a source object, copy the value from the source
 * if it contains the same key, otherwise return the default. Skip keys that
 * only exist in the source object.
 * @param {object} defaults - Default schema
 * @param {object} source - Source object to copy properties from
 * @returns {object} - Result has identical keys to defaults
 * @static
 * @memberof helper
*/
function merge_or_apply(defaults, source) {
	var defaultKeys = keys(defaults);
	var sourceKeys = keys(source);
	return reduce(defaultKeys, function(result, key) {
		if (sourceKeys.indexOf(key) > -1) {
			result[key] = source[key];
			return result;
		} else {
			result[key] = defaults[key];
			return result;
		}
	}, {});
}

/**
 * Given a the domain of a scale suggest the most numerous number 
 * of round number ticks that it cold be divided into while still containing
 values evenly divisible by 1, 2, 2.5, 5, 10, or 25.
 * @param {array} domain - An array of two number like objects
 * @returns {integer} - Result is a single integer representing a nice number of ticks to use
 * @static
 * @memberof helper
*/
function suggest_tick_num(domain) {
	var MAX_TICKS = 10;
	var INTERVAL_BASE_VALS = [1, 2, 2.5, 5, 10, 25];
	var range = Math.abs(domain[0] - domain[1])
	var minimum = range / MAX_TICKS;
	var digits = Math.floor(range).toString().length;
	var multiplier = Math.pow(10, (digits - 2));

	var acceptable_intervals = reduce(INTERVAL_BASE_VALS, function(prev, curr) {
		var mult = curr * multiplier;

		if (mult >= minimum) {
			prev = prev.concat([mult]);
		}

		return prev;
	}, []);

	for (var i = 0; i < acceptable_intervals.length; i++) {
		var interval = acceptable_intervals[i]
		if(range % interval == 0) {
			return (range / interval) + 1
		}
	};

	return 11;
}

/**
 * Given a timezone offset in an hour:minute format and return the equivalent
 * number of minutes as a number
 * only exist in the source object.
 * @param {object} offset - A string in a hh:mm format or "Z" for no offset
 * @returns {number} - Number of minutes
 * @static
 * @memberof helper
*/
function tz_offset_to_minutes(offset) {
	if (offset == "Z") {
		return 0
	}

	var offset = offset.split(":")

	if(offset.length == 1) {
		offset = offset[0]
		split_loc = offset.length - 2
		offset = [offset.substring(0, split_loc), offset.substring(split_loc)]
	}
	sign = offset[0].indexOf("-") > -1 ? -1 : 1

	offset = offset.map(parseFloat)

	return (offset[0]*60) + (sign * offset[1])
}

/**
 * Helper functions!
 * @name helper
 */
var helper = {
	exactTicks : exact_ticks,
	roundToPrecision: round_to_precision,
	combineMarginPadding: combine_margin_pading,
	computeScaleDomain: compute_scale_domain,
	precision: precision,
	transformCoords: transform_coords,
	mergeOrApply: merge_or_apply,
	suggestTickNum: suggest_tick_num,
	TZOffsetToMinutes: tz_offset_to_minutes
};

module.exports = helper;
