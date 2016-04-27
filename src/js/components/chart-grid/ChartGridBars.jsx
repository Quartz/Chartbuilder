/*
 * ### ChartGridBars
 * Render a grid of N columns by N rows of bar (row) charts
*/

var React           = require("react");
var PropTypes       = React.PropTypes;
var update          = require("react-addons-update");
var d4              = require("d4");

var bind            = require("lodash/bind");
var clone           = require("lodash/clone");
var map             = require("lodash/map");
var max             = require("lodash/max");
var reduce          = require("lodash/reduce");

var SessionStore    = require("../../stores/SessionStore");
var separators      = SessionStore.get("separators");
var d3 = require("d3");
var formatThousands = d3.format(separators.thousands);

/* Helper functions */
var cb_bar_grid = require("../../charts/cb-charts").cb_bar_grid;
var help = require("../../util/helper.js");

/* Renderer mixins */
var ChartRendererMixin = require("../mixins/ChartRendererMixin.js");

/* One `GridChart` will be drawn for every column used in our grid */
var HorizontalGridLines = require("../shared/HorizontalGridLines.jsx");
var VerticalGridLines   = require("../shared/VerticalGridLines.jsx");
var BarGroup            = require("../series/BarGroup.jsx");
var SvgWrapper          = require("../svg/SvgWrapper.jsx");
var scaleUtils          = require("../../util/scale-utils.js");
var seriesUtils         = require("../../util/series-utils.js");
var gridUtils           = require("../../util/grid-utils.js");
var XYChart             = require("../chart-xy/XYChart.jsx");
var VerticalAxis        = require("../shared/VerticalAxis.jsx");
var SeriesLabel         = require("../shared/SeriesLabel.jsx");

/**
 * ### Component that renders bar (row) charts in a chart grid
 * @property {boolean} editable - Allow the rendered component to interacted with and edited
 * @property {object} displayConfig - Parsed visual display configuration for chart grid
 * @property {object} chartProps - Properties used to draw this chart
 * @instance
 * @memberof ChartGridRenderer
 */
var ChartGridBars = React.createClass({

	propTypes: {
		editable: PropTypes.bool.isRequired,
		displayConfig: PropTypes.shape({
			margin: PropTypes.obj,
			padding: PropTypes.obj
		}).isRequired,
		chartProps: PropTypes.shape({
			chartSettings: PropTypes.array.isRequired,
			data: PropTypes.array.isRequired,
			scale: PropTypes.object.isRequired,
			_grid: PropTypes.object.isRequired
		}).isRequired
	},

	mixins: [ ChartRendererMixin ],

	getInitialState: function() {
		return {
			maxTickWidth: 0,
			barLabelOverlap: 0 // how far a bar label is overlapping the available chart width
		};
	},

	// render a single bar grid
	_barGridBlock: function(d, i) {
		var props = this.props;

		var barProps = {
			key: i,
			data: d.values,
			colorIndex: props.chartProps.chartSettings[i].colorIndex
		};

		var bar = seriesUtils.createSeries("column", {
			key: "bar",
			bars: [ barProps ],
			orientation: "horizontal"
		});

		return [
			<SeriesLabel
				key="label"
				text={props.chartProps.chartSettings[i].label}
				colorIndex={props.chartProps.chartSettings[i].colorIndex}
			/>,
			bar,
			<VerticalGridLines
				key="vert"
				tickValues={[0]}
				className="zero"
			/>
		];
	},

	render: function() {
		var props = this.props;
		var displayConfig = props.displayConfig;
		var margin = displayConfig.margin;
		var styleConfig = props.styleConfig;
		var chartProps = props.chartProps;
		var dimensions = props.dimensions;
		var primaryScale = chartProps.scale.primaryScale;
		var tickFont = styleConfig.fontSizes.medium + "px " + styleConfig.fontFamily;
		var tickTextHeight = help.computeTextWidth("M", tickFont);

		/* Get the text values used for the labels */
		var tickLabels = map(chartProps.data[0].values, function(d) {
			return d.entry;
		});

		var tickWidths = map(tickLabels, function(t) {
			return help.computeTextWidth(t, tickFont);
		});

		var maxTickWidth = max(tickWidths);
		var chartAreaDimensions = {
			width: (
				dimensions.width - margin.left - margin.right -
				displayConfig.padding.left - displayConfig.padding.right -
				maxTickWidth
			),
			height: (
				dimensions.height - margin.top - margin.bottom -
				displayConfig.padding.top - displayConfig.padding.bottom
			)
		};

		var xRangeOuter = [0, chartAreaDimensions.width];
		var yRangeOuter = [chartAreaDimensions.height, 0];

		var gridScales = gridUtils.createGridScales(chartProps._grid, {
			x: xRangeOuter,
			y: yRangeOuter
		}, {
			xInnerPadding: 0.2, // TODO: put these in config
			xOuterPadding: 0
		});

		// range and axes for each chart in the grid (inner)
		var xRangeInner = [0, gridScales.cols.rangeBand()];
		var yRangeInner = [props.displayConfig.afterLegend, gridScales.rows.rangeBand()];
		var xAxis = scaleUtils.generateScale("linear", primaryScale, chartProps.data, xRangeInner);
		var yAxis = scaleUtils.generateScale("ordinal", primaryScale, chartProps.data, yRangeInner);

		var Outer = React.createFactory(XYChart);
		var outerProps = {
			chartType: "bar",
			styleConfig: props.styleConfig,
			displayConfig: displayConfig,
			editable: props.editable,
			xScale: xAxis.scale,
			yScale: yAxis.scale,
			tickTextHeight: tickTextHeight,
			tickFont: tickFont
		};

		var grid = gridUtils.makeMults(Outer, outerProps, chartProps.data, gridScales, this._barGridBlock);

		// create vertical axis and grid lines for each row.
		// this should possibly be part of the grid generation
		// and could be its own wrapper component
		var verticalAxes = map(gridScales.rows.domain(), function(row, i) {
			var yPos = gridScales.rows(i);
			return (
				<g
					className="axis grid-row-axis"
					key={"grid-row-" + i}
					transform={ "translate(" + [0, yPos] + ")" }
				>
					<HorizontalGridLines
						tickValues={yAxis.tickValues}
						dimensions={{
							width: dimensions.width - margin.right - margin.left,
							height: dimensions.height
						}}
						yScale={yAxis.scale}
						styleConfig={props.styleConfig}
						displayConfig={displayConfig}
						translate={[0, 0]}
						tickValues={tickLabels}
					/>
					<VerticalAxis
						tickValues={tickLabels}
						tickWidths={tickWidths}
						dimensions={chartAreaDimensions}
						styleConfig={props.styleConfig}
						displayConfig={displayConfig}
						xScale={xAxis.scale}
						yScale={yAxis.scale}
						tickTextHeight={tickTextHeight}
						tickFont={tickFont}
					/>
				</g>
			)
		});

		return (
			<SvgWrapper
				outerDimensions={dimensions}
				metadata={props.metadata}
				displayConfig={displayConfig}
				styleConfig={props.styleConfig}
			>
				{verticalAxes}
				<g
					className="grid-wrapper"
					transform={ "translate(" + [maxTickWidth, 0] + ")" }
				>
					{grid}
				</g>
			</SvgWrapper>
		);
	}
});

module.exports = ChartGridBars;

function format_bar_labels(label) {
	if (label === null) {
		return "no data";
	} else {
		return formatThousands(label);
	}
}

