// Helpers for test data

var _ = require("lodash");

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randArrElement(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function flattenLengthsToTotal(arr) {
	return _.reduce(arr, function(total, d) {
		return total + d.length;
	}, 0);
}

module.exports = {
	randInt: randInt,
	randArrElement: randArrElement,
	flattenLengthsToTotal: flattenLengthsToTotal
};
