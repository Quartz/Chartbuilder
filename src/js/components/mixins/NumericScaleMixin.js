var clone = require("lodash/clone");
var map = require("lodash/map");
var reduce = require("lodash/reduce");

/**
 * ### Mixin for renderers that require construction of a numeric scale
 * @instance
 * @memberof renderers
 */
var NumericScaleMixin = {

	/**
	 * generateNumericScale
	 * Create a numeric scale given data, scale, and dimensions settings
	 * @param props
	 * @return {object} - `{ numericTicks: ...,  domain: ..., numericFormatter: ...}`
	 */
	generateNumericScale: function(props) {
		// Return the ticks used for a time scale based on the time span and settings
		// var formatAndFreq = {};
		// var _numericSettings = clone(props.chartProps.scale.numericSettings, true);
		// var numericFrequency = _numericSettings.numericFrequency;

		// // Create a flat array of all numerics so that we know that we can calculate
		// // the max and min
		// var allNumerics = reduce(props.chartProps.data, function(prevArr, series) {
		// 	return map(series.values, function(values) {
		// 		return values.entry;
		// 	}).concat(prevArr);
		// }, []);

		// var numericRange = d3.extent(allNumerics);
		// var minNumeric = numericRange[0];
		// var maxNumeric = numericRange[1];

		// var extraPadding = props.chartProps.extraPadding;
		// var width = props.dimensions.width;
		// var availableWidth = props.dimensions.width - extraPadding.left - extraPadding.right;
		return props.chartProps.scale.numericSettings;
	}
};

module.exports = NumericScaleMixin;
