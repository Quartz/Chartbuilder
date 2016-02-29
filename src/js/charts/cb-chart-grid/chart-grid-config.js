var ChartConfig = require("../ChartConfig");

/**
 * ### Configuration of a Chart grid
 * @name chart_grid_config
 */

/**
* display
* @static
* @memberof chart_grid_config
* @property {Nem|number} afterTitle - Distance btwn top of title and top of legend or chart
* @property {Nem|number} afterLegend - Distance btwn top of legend and top of chart
* @property {Nem|number} blockerRectOffset - Distance btwn text of axis and its background blocker
* @property {Nem|number} paddingBerBar - Space btwn two bars in a bar grid
* @property {Nem|number} barHeight - Height of an individual bar in a bar grid
* @property {Nem|number} afterXYBottom - Vert distance btwn two chart grids that are stacked
* @property {Nem|number} afterXYRight - Horiz distance btwn two chart grids that are next to each other
* @property {Nem|number} columnExtraPadding - Extra padding given if a chart grid XY has columns
* @property {Nem|number} bottomPaddingWithoutFooter - Bottom padding if footer is not drawn
* @property {Nem|number} bottomPaddingWithoutFooter - Bottom padding if footer is not drawn
* @property {object} xy - Copy of `xy_config.display`, used in XY chart grids
* @property {object} margin - Distances btwn outer chart elements and container
* @property {object} padding - Distances btwn inner chart elements and container
*/
var display = {
	afterTitle: "1.25em", // distance between top of title and top of legend or chart
	afterLegend: "0.5em", // distance between top of legend and top of chart
	blockerRectOffset: 6, // distance between text and background blocker rect
	paddingPerBar: "0.7em", // extra space around bars
	barHeight: "0.9em", // height of each bars
	afterXYBottom: "2em",
	afterXYRight: "0.8em",
	columnExtraPadding: "0.5em",
	bottomPaddingWithoutFooter: "0.5em",
	xy: require("../cb-xy/xy-config").display,
	margin: {
		top: "0.8em",
		right: "0.25em",
		bottom: "0.15em",
		left: "0.25em"
	},
	padding: {
		top: "0.5em",
		right: 0,
		bottom: "1.5em",
		left: 0
	}
};
/**
* @name chart_grid_defaultProps
* @static
* @memberof chart_grid_config
*/
var defaultProps = {
	/**
	 * @name chartProps
	 * @property {object} scale - Default settings for date and primary scales
	 * @property {object} input
	 * @property {array} chartSettings - Default settings for a given series (column) of data
	 * @property {object} extraPadding - Additional padding. This is a dynamic
	 * value and is mostly changed within the component itself
	 * @property {object} _grid - Grid settings
	 * @property {number} _grid.rows - Number of rows in the grid
	 * @property {number} _grid.cols - Number of columns in the grid
	 * @property {string} _grid.type - Grid type `(bars|lines|dots|columns)`
	 * @property {object} mobile - Mobile-specific override settings
	 * @static
	 * @memberof chart_grid_defaultProps
	 */
	chartProps: {
		input: {},
		extraPadding: {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		},
		scale: {
			primaryScale: {
				ticks: 5,
				precision: 0,
				prefix: "",
				suffix: ""
			},
			dateSettings: {
				dateFrequency: "auto",
				dateFormat: "auto",
				inputTZ: null,
				displayTZ: "as-entered"
			},
			numericSettings: {
				ticks: null,
				precision: 0,
				prefix: "",
				suffix: ""
			}
		},
		chartSettings: [
			{
				colorIndex: 0,
				barHeight: "0.85em"
			}
		],
		_grid: {
			rows: 1,
			type: null
		},
		mobile: {}
	},
	/**
	 * @name metadata
	 * @property {string} chartType
	 * @property {string} size
	 * @static
	 * @memberof chart_grid_defaultProps
	 */
	metadata: {
		id: null,
		chartType: "chartgrid",
		title: "",
		source: "",
		credit: "Made with Chartbuilder",
		size: "auto"
	}
};

var chart_grid_config = new ChartConfig({
	displayName: "Chart grid",
	parser: require("./parse-chart-grid"),
	calculateDimensions: require("./chart-grid-dimensions"),
	display: display,
	defaultProps: defaultProps
});

module.exports = chart_grid_config;
