var cb_xy = require("./cb-xy/draw-xy");
var cb_bar_grid = require("./cb-chart-grid/draw-bar-grid");

/**
 * Object that exposes Chartbulider's d4 chart constructors
 */
var cb_charts = {
	/**
	 * Chartbuilder's XY chart constructor. It is capable of rendering line, column, and
	 * dot (scatter) charts, and any combination of those, as well as dual axes.
	 * @return {object} xy
	 */
	cb_xy: cb_xy,
	/**
	 * Chartbuilder's bar grid constructor. It is a slightly modified version of d4's row chart
	 * @return {object} bar_grid
	 */
	cb_bar_grid: cb_bar_grid
};

module.exports = cb_charts;
