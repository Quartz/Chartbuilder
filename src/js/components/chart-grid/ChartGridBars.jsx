/*
 * ### ChartGridBars
 * Render a grid of N columns by N rows of bar (row) charts
*/

var React           = require("react");
var PropTypes       = React.PropTypes;
var update          = require("react-addons-update");

var bind            = require("lodash/bind");
var clone           = require("lodash/clone");
var each            = require("lodash/each");
var map             = require("lodash/map");
var max             = require("lodash/max");
var maxBy           = require("lodash/maxBy");
var reduce          = require("lodash/reduce");

var SessionStore    = require("../../stores/SessionStore");
var separators      = SessionStore.get("separators");
var d3 = require("d3");
var formatThousands = d3.format(separators.thousands);

/* Helper functions */
var help = require("../../util/helper.js");

/* Renderer mixins */
var ChartRendererMixin = require("../mixins/ChartRendererMixin.js");

var HorizontalGridLines = require("../shared/HorizontalGridLines.jsx");
var VerticalGridLines   = require("../shared/VerticalGridLines.jsx");
var BarGroup            = require("../series/BarGroup.jsx");
var SvgWrapper          = require("../svg/SvgWrapper.jsx");
var scaleUtils          = require("../../util/scale-utils.js");
var seriesUtils         = require("../../util/series-utils.js");
var gridUtils           = require("../../util/grid-utils.js");
var Chart               = require("../shared/Chart.jsx");
var VerticalAxis        = require("../shared/VerticalAxis.jsx");
var BarLabels           = require("../shared/BarLabels.jsx");
var BlockerRects        = require("../shared/BlockerRects.jsx");
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

	// render a single bar in the grid. this gets passed to `gridUtils.makeMults` to
	// render one for each column of data
	// TODO: have in mind a maybe better way to do this
	_barGridBlock: function(d, i) {
		var props = this.props;

		var barProps = {
			key: "bar",
			bars: [{
				data: d.values,
				colorIndex: props.chartProps.chartSettings[i].colorIndex
			}],
			orientation: "horizontal"
		};

		var bar = seriesUtils.createSeries("column", barProps);

		return [
			<SeriesLabel
				key="label"
				xVal={0}
				colorIndex={props.chartProps.chartSettings[i].colorIndex}
				text={props.chartProps.chartSettings[i].label}
			/>,
			bar,
			<BlockerRects
				key="blockers"
				seriesNumber={i}
				data={d.values}
			/>,
			<BarLabels
				key="barlabels"
				data={d.values}
				prefix={props.chartProps.scale.primaryScale.prefix}
				suffix={props.chartProps.scale.primaryScale.suffix}
			/>,
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
		var tickFont = styleConfig.fontSizes.medium + "px " + styleConfig.fontFamilies.axes;
		var tickTextHeight = help.computeTextWidth("M", tickFont);

		/* Get the text values used for the labels */
		var tickLabels = map(chartProps.data[0].values, function(d) {
			return d.entry;
		});

		var widthPerTick = map(tickLabels, function(t) {
			return help.computeTextWidth(t, tickFont);
		});

		var tickWidths = {
			widths: widthPerTick,
			max: max(widthPerTick)
		};

		var chartAreaDimensions = {
			width: (
				dimensions.width - margin.left - margin.right -
				displayConfig.padding.left - displayConfig.padding.right -
				tickWidths.max
			),
			height: (
				dimensions.height +
			(displayConfig.afterLegend * chartProps._grid.rows)
			)
		};

		var outerDimensions = {
			width: dimensions.width,
			height: dimensions.height +
			(displayConfig.margin.top + displayConfig.margin.bottom) +
			displayConfig.padding.bottom +
			(displayConfig.afterLegend * chartProps._grid.rows)
		}

		// range for all charts in grid (outer)
		var xRangeOuter = [props.styleConfig.xOverTick, chartAreaDimensions.width - props.styleConfig.xOverTick];
		var yRangeOuter = [chartAreaDimensions.height, 0];

		// place grid elements using gridScales generated by d3
		var gridScales = gridUtils.createGridScales(chartProps._grid, {
			x: xRangeOuter,
			y: yRangeOuter
		}, {
			xInnerPadding: props.displayConfig.gridPadding.xInnerPadding,
			xOuterPadding: props.displayConfig.gridPadding.xOuterPadding,
			yInnerPadding: props.displayConfig.gridPadding.yInnerPadding,
			yOuterPadding: props.displayConfig.gridPadding.yOuterPadding
		});

		// Create temporary x axis to figure out where the furthest bar label is, so
		// that we can offset it
		var _tmpXAxis = scaleUtils.generateScale("linear", primaryScale, chartProps.data, [0, gridScales.cols.rangeBand()]);

		// TODO: this is ugly
		var barLabels = { widths: [], xVals: []};
		each(chartProps.data, function(series, i) {
			barLabels.widths[i] = [];
			each(series.values, function(val, ix) {
				var renderPrefSuf = (ix === 0);
				var formatted = help.addPrefSuf(val.value, renderPrefSuf, primaryScale.prefix, primaryScale.suffix);
				var txtWidth = help.computeTextWidth(formatted, tickFont);
				barLabels.widths[i].push(txtWidth);
				barLabels.xVals.push(txtWidth + _tmpXAxis.scale(val.value) + props.displayConfig.blockerRectOffset);
			});
		});

		var barLabelsMaxX = max(barLabels.xVals);
		var barLabelOverlap = Math.max(0, barLabelsMaxX - gridScales.cols.rangeBand());

		// range and axes for each individual small chart in the grid (inner)
		var xRangeInner = [0, gridScales.cols.rangeBand() - barLabelOverlap];
		var yRangeInner = [displayConfig.afterLegend, gridScales.rows.rangeBand() - displayConfig.afterLegend];
		var xAxis = scaleUtils.generateScale("linear", primaryScale, chartProps.data, xRangeInner);
		var yAxis = scaleUtils.generateScale("ordinal", primaryScale, chartProps.data, yRangeInner, {
			inner: displayConfig.barInnerPadding,
			outer: displayConfig.barOuterPadding
		});

		// `Outer` is the common wrapper component that will be used for each chart
		// in the grid
		var Outer = React.createFactory(Chart);
		var outerProps = {
			chartType: "bar",
			styleConfig: props.styleConfig,
			displayConfig: displayConfig,
			editable: props.editable,
			xScale: xAxis.scale,
			yScale: yAxis.scale,
			tickTextHeight: tickTextHeight,
			tickFont: tickFont,
			labelWidths: barLabels.widths,
			tickWidths: tickWidths
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
						yScale={yAxis.scale}
						x2={dimensions.width - margin.right - margin.left}
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
						textAlign="inside"
					/>
				</g>
			)
		});

		return (
			<SvgWrapper
				outerDimensions={outerDimensions}
				metadata={props.metadata}
				displayConfig={displayConfig}
				styleConfig={props.styleConfig}
			>
			<g
				className="grid-wrapper"
				transform={ "translate(" + [0, props.displayConfig.padding.top] + ")" }
			>
				{verticalAxes}
				<g
					className="grid-charts"
					transform={ "translate(" + [tickWidths.max, 0] + ")" }
				>
					{grid}
				</g>
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

