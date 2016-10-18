/**
 * Configuration of breakpoints for Chartbuilder renderers.
 * @property {string} class_name - Applied to the renderer at this break point
 * @property {number} min_size - Minimum value (most likely width) at which to
 * apply this breakpoint
 * @property {number} em_size - Font size at this breakpoint. This is used to
 * calculate relative positioning
 * @memberof config
 * @static
 */
var breakpoints = [
	{
		"class_name": "large",
		"min_size": 900,
		"em_size": 20
	},
	{
		"class_name": "medium",
		"min_size": 480,
		"em_size": 20
	},
	{
		"class_name":"small",
		"min_size": 0,
		"em_size": 12
	}
];

breakpoints.sort(function(a, b) {
	return b.min_size - a.min_size;
});

function getBreakpointObj(enableResponsive, width) {
	if (enableResponsive || !width) {
		return breakpoints.filter(function(bp) {
			return width > bp.min_size;
		})[0];
	} else {
		return breakpoints[1];
	}
}

module.exports = {
	breakpoints: breakpoints,
	getBreakpointObj: getBreakpointObj
};
