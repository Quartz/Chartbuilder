const MapConfig = require("../MapConfig");
let now = new Date();

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



let display = Object.freeze({
  labelRectSize: "0.6em",
  labelXMargin: "0.6em",
  labelTextMargin: "0.3em",
  labelRowHeight: "1.2em",
  afterTitle: "1.6em",
  afterLegend: "1.6em",
  blockerRectOffset: "0.3em",
  columnPaddingCoefficient: 0.3,
  minPaddingOuter: "1em",
  bottomPaddingWithoutFooter: "3em",
  aspectRatio: {
    wide: (6 / 7),
    longSpot: (4 / 3),
    smallSpot: (3 / 4)
  },
  margin: {
    top: "1.4em",
    right: "0.8em",
    bottom: "1.2em",
    left: "0.8em",
    maptop: "2.2em",
    subtitle: "2em",
    legendleft: "0.8em",
    legendsOneRow: "22.5em",
    legendsTwoRow: "22.5em"
  },
  padding: {
    top: 0,
    right: 0,
    bottom: "4em",
    left: 0
  }
});

/**
* @name xy_defaultProps
* @static
* @memberof xy_config
*/
const defaultProps = Object.freeze({
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

		visualType: "map",

    data: [],
    input: {},
	  stylings: {
	    corners: '2',
	    legendText: 'Write the legend text here',
	    legendMove: {
	      top:0,
	      left:0
	    },
	    stroke:'#aaa',
	    type: "grid",
	    dorlingradiusVal: 32,
	    demerssquareWidth: 30,
	    gridsquareWidth: '43',
	    gridcellSize: 52,
	    showDC: false,
	    showLegendTicks: false,
	    showStateLabels: true,
	    showValuesLabels: false
	  },
    chartSettings: [
      {
        colorIndex: 0,
        scale: {
            prefix: "",
            suffix: "",
            type: "quantize"
        }
      },
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
    chartType: 'mapCartogram',
    title: "Title",
    subtitle: "Subtitle",
    source: "TK",
    credit: "",
    size: "auto"
  }
});

const map_config = new MapConfig({
  displayName: "Cartogram",
  parser: require("./Cartogram-parse"),
  calculateDimensions: require("./mb-cartogram-dimensions"),
  display: display,
  defaultProps: defaultProps
});

module.exports = map_config;
