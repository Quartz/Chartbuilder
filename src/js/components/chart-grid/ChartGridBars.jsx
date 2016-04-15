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
var SvgWrapper          = require("../svg/SvgWrapper.jsx");
var scaleUtils          = require("../../util/scale-utils.js");
var VerticalAxis        = require("../shared/VerticalAxis.jsx");

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

	render: function() {
		var props = this.props;
		var displayConfig = props.displayConfig;
		var margin = displayConfig.margin;
		var styleConfig = props.styleConfig;
		var chartProps = props.chartProps;
		var dimensions = props.dimensions;
		var tickFont = styleConfig.fontSizes.medium + "px " + styleConfig.fontFamily;
		var tickTextHeight = help.computeTextWidth("M", tickFont);

		/* Get the text values used for the labels */
		var tickLabels = map(chartProps.data[0].values, function(d) {
			return d.entry;
		});

		var tickWidths = map(tickLabels, function(t) {
			return help.computeTextWidth(t, tickFont);
		});

		var maxTickWidth = d3.max(tickWidths);
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

		var xRange = [0, chartAreaDimensions.width];
		var xAxis = scaleUtils.generateScale("linear", chartProps.scale.primaryScale, chartProps.data, xRange);
		var yRange = [chartAreaDimensions.height, 0];
		var yAxis = scaleUtils.generateScale("ordinal", chartProps.scale.primaryScale, chartProps.data, yRange);
		console.log(yAxis)

		return (
			<SvgWrapper
				outerDimensions={dimensions}
				metadata={this.props.metadata}
				displayConfig={displayConfig}
				styleConfig={this.props.styleConfig}
			>
			<g
				className="chart chart-bar"
				transform={ "translate(" + [maxTickWidth, 0] + ")" }
			>
				<HorizontalGridLines
					dimensions={chartAreaDimensions}
					translate={[maxTickWidth, 0]}
					displayConfig={displayConfig}
					styleConfig={this.props.styleConfig}
					yScale={yAxis.scale}
					tickValues={yAxis.tickValues}
				/>
				<VerticalAxis
					tickFont={tickFont}
					dimensions={chartAreaDimensions}
					tickTextHeight={tickTextHeight}
					offset={maxTickWidth * -1}
					displayConfig={displayConfig}
					styleConfig={this.props.styleConfig}
					tickValues={tickLabels}
					tickWidths={tickWidths}
					orient={"left"}
					width={chartAreaDimensions.width}
					scale={yAxis.scale}
				/>
			</g>
			</SvgWrapper>
		);
	}
});

module.exports = ChartGridBars;

/* Use d4 to actually draw the chart */
function drawBarChartGrid(el, state) {
	// We are not able to modify an existing chart because a d4 `mixout` does not
	// remove a previously existing element. So we must delete the dom element
	// before rendering
	// TODO: look into adding this feature to d4
	if (el.childNodes[0]) {
		el.removeChild(el.childNodes[0]);
	}

	var chartProps = state.chartProps;
	var scale = chartProps.scale;
	var colorIndex = chartProps.chartSettings.colorIndex;
	var gridType = state.grid.type;
	var styleConfig = state.styleConfig;

	var chart = cb_bar_grid()
		.outerHeight(state.dimensions.height)
		.margin(chartProps.margin)
		.padding(state.padding);

	chart
	.using("series-label",function(lab){
		lab.afterRender(function() {
			this.container.selectAll("text.label")
				.each(function(d,i) {
					var index = !isNaN(colorIndex) ? colorIndex : i;
					d3.select(this).attr("data-color-index", index);
				});
		});
	})
	//TODO: make the rangeband the ratio of barheight to bargap
	.y(function(y) {
		y.key("entry").rangeBands([
			this.padding.top + state.displayConfig.afterLegend,
			this.height - this.padding.bottom
		]);
	})
	.mixout("xAxis")
	.chartAreaOnTop(true)
	.using("bars", function(bar) {
		bar.height(state.displayConfig.barHeight);
		bar.y(function(d) {
			// Offset y placement based on bar height
			var axis = this.y;
			return (axis(d[axis.$key]) + axis.rangeBand() / 2) - (state.displayConfig.barHeight / 2);
		});
		bar.afterRender(function() {
			this.container.selectAll("rect.bar")
				.each(function(d,i) {
					var index = !isNaN(colorIndex) ? colorIndex : i;
					d3.select(this).attr("data-color-index", index);
				});
		});
	})
	.using("concealer_label",function(lab) {
		lab
			.stagger(false)
			.x(function(d) {
				var val = d[this.x.$key] || 0;
				return this.x(Math.max(val, 0)) + 6;
			})
			.y(function(d) {
				return (this.y(d[this.y.$key]) + this.y.rangeBand() / 2);
			})
			.format(function(d,i) {
				if (i !== 0) {
					return format_bar_labels(d);
				} else {
					return scale.primaryScale.prefix + format_bar_labels(d) + scale.primaryScale.suffix;
				}
			})
			.dy(function(d,i) {
				return "0.36em";
			})
			.text(function(d, i) {
				return d.value;
			});
	});

	if (state.positions.x === 0) {
		// The left-most bar, which contatins axis ticks
		chart = left_bar(chart, state);
	} else {
		// Bars to the right
		chart = right_bar(chart, state);
	}

	d3.select(el)
		.append("g")
		.datum(chartProps.data)
		.call(chart);
}

function left_bar(_chart, state) {
	var chartProps = state.chartProps;

	_chart.extraPadding({
		top: 0,
		left: chartProps.extraPadding.left,
		bottom: chartProps.extraPadding.bottom,
		right: chartProps.extraPadding.right + state.barLabelOverlap
	})
	.outerWidth(state.dimensions.width + chartProps.extraPadding.left)
	.mixout("no-label-tick")
	.using("leftAxis", function(axis) {
		axis.orient("left");
		axis.align("left")
		axis.innerTickSize(
			bar_tick_size(state)
		);
	})
	.x(function(x) {
		x.key("value").domain(chartProps.scale.primaryScale.domain);
		x.range([this.padding.left + state.styleConfig.xOverTick, this.outerWidth - this.padding.right])
	})

	return _chart;
}

function right_bar(_chart, state) {
	var chartProps = state.chartProps;

	_chart.extraPadding({
		top: 0,
		left: 0,
		bottom: chartProps.extraPadding.bottom,
		right: chartProps.extraPadding.right + state.barLabelOverlap
	})
	.outerWidth(state.dimensions.width)
	.mixout("leftAxis")
	.using("no-label-tick", function(line) {
		line.x2(function() {
			return bar_tick_size(state);
		});
	})
	.x(function(x) {
		x.key("value").domain(chartProps.scale.primaryScale.domain)
		x.range([0, this.outerWidth - this.padding.right - state.styleConfig.xOverTick])
	});

	return _chart;
}

// The ticks on the rightmost bar (including if there's only a single one)
// should not extend the full width of their chart area. All others should.
function bar_tick_size(state) {
	return 8;
	//if(state.positions.x === (state.grid.cols - 1)) {
		//return state.dimensions.width -
		//state.chartProps.margin.right -
		//state.chartProps.margin.left;
	//}
	//else {
		//return state.dimensions.width;
	//}
}

function format_bar_labels(label) {
	if (label === null) {
		return "no data";
	} else {
		return formatThousands(label);
	}
}

