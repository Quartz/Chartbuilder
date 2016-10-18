/**
 * Global config not specific to a chart type
 * @name config
 */

/**
 * Global style config that is not specific to any one chart type
 * @name chart_style
 * @property {Nem|number} overtick_top
 * @property {Nem|number} overtick_bottom
 * @property {number} numColors
 * @property {Nem|number} xOvertick - Font size at this breakpoint. This is used to
 * @property {Nem|number} creditMargin - Distance btwn credit and the logo/text beside it
 * @memberof config
 * @static
 */
var chart_style = {
	overtick_top: "0.8em",
	overtick_bottom: 10,
	numColors: 11,
	xOverTick: "1em", // horizontal the distance between the yAxes and xAxis
	creditMargin: "0.6em"
};

module.exports = chart_style;
