var clone = require("lodash/clone");
var map = require("lodash/map");
var reduce = require("lodash/reduce");
var help = require("../../util/helper.js");

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
		// TODO: auto-generate some kind of "good" numeric scale? For now just
		// return the settings
		var cur = props.chartProps.scale.numericSettings;

		return {
			custom: cur.custom,
			domain: cur.domain,
			precision: cur.precision,
			prefix: cur.prefix,
			suffix: cur.suffix,
			tickValues: cur.tickValues,
			ticks: cur.ticks
		}
	}
};

module.exports = NumericScaleMixin;
