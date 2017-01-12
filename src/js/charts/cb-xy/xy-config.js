var ChartConfig = require("../ChartConfig");
var now = new Date();

/**
 * ### Configuration of an XY chart
 * @name xy_config
 */

/**
* display
* @static
* @memberof xy_config
* @property {Nem|number} labelRectSize - Size of the legend label rectangle
* @property {Nem|number} labelXMargin - Horiz distance btwn labels
* @property {Nem|number} labelTextMargin - Horiz distance btwn label rect and text
* @property {Nem|number} labelRowHeight - Vert distance btwn rows of labels
* items with colors the appropriate indexed CSS class
* @property {Nem|number} afterTitle - Distance btwn top of title and top of legend or chart
* @property {Nem|number} afterLegend - Distance btwn top of legend and top of chart
* @property {Nem|number} blockerRectOffset - Distance btwn text of axis and its background blocker
* @property {Nem|number} columnPaddingCoefficient - Distance relative to
* width that column charts should be from edge of the chart
* @property {Nem|number} minPaddingOuter - Minimum distance between the
* outside of a chart and a graphical element
* @property {Nem|number} bottomPaddingWithoutFooter - Bottom padding if footer is not drawn
* @property {object} aspectRatio
* @property {number|fraction} aspectRatio.wide
* @property {number|fraction} aspectRatio.longSpot
* @property {number|fraction} aspectRatio.smallSpot
* @property {object} margin - Distances btwn outer chart elements and container
* @property {object} padding - Distances btwn inner chart elements and container
*/

var display = {
	labelRectSize: "0.6em",
	labelXMargin: "0.6em",
	labelTextMargin: "0.3em",
	labelRowHeight: "1.2em",
	afterTitle: "1.4em",
	afterLegend: "1em",
	blockerRectOffset: "0.2em",
	lineMarkThreshold: 10, // render marks (dots) on lines if data < N
	columnOuterPadding: 0.01, // % of width to pad for columns
	columnInnerPadding: 0, // % of col group width to pad btwn each
	minPaddingOuter: "1em",
	bottomPaddingWithoutFooter: "3em",
	yAxisOrient: {
		primaryScale: "left",
		secondaryScale: "right",
	},
	aspectRatio: {
		wide: (9 / 16),
		longSpot: (4 / 3),
		smallSpot: (3 / 4)
	},
	margin: {
		top: "0.8em",
		right: "0.25em",
		bottom: "0.15em",
		left: "0.25em"
	},
	padding: {
		top: 0,
		right: 0,
		bottom: "3.5em",
		left: 0
	}
};

/**
* @name xy_defaultProps
* @static
* @memberof xy_config
*/
var defaultProps = {
	/**
	 * @name chartProps
	 * @property {object} scale - Default settings for date and primary scales
	 * @property {array} data
	 * @property {object} input
	 * @property {object[]} chartSettings - Default settings for a given series (column) of data
	 * @property {object} extraPadding - Additional padding. This is a dynamic
	 * value and is mostly changed within the component itself
	 * @property {object} _annotations - Additional informative graphical elements
	 * @property {object} _annotations.labels - If labels are dragged, their
	 * position settings are saved here
	 * @property {object[]} _annotations.labels.values - Array of settings for
	 * dragged labels
	 * @property {object} mobile - Mobile-specific override settings
	 * @static
	 * @memberof xy_defaultProps
	 */
	chartProps: {
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
		data: [],
		input: {},
		chartSettings: [
			{
				altAxis: false,
				type: "line",
				colorIndex: 0
			}
		],
		extraPadding: {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		},
		_annotations: {
			labels: {
				hasDragged: false,
				values: []
			}
		},
		mobile: {}
	},
	/**
	 * @name metadata
	 * @property {string} chartType
	 * @property {string} size
	 * @static
	 * @memberof xy_defaultProps
	 */
	metadata: {
		chartType: 'xy',
		title: "",
		source: "",
		credit: "Made with Chartbuilder",
		size: "auto"
	}
};

var xy_config = new ChartConfig({
	displayName: "XY Chart",
	parser: require("./parse-xy"),
	calculateDimensions: require("./xy-dimensions"),
	display: display,
	defaultProps: defaultProps
});

module.exports = xy_config;
