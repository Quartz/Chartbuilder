/*
 * ### ChartGridBars
 * Render a grid of N columns by N rows of bar (row) charts
*/

var React = require("react");
var PropTypes = React.PropTypes;
var update = require("react-addons-update");
var d4 = require("d4");

var bind = require("lodash/bind");
var clone = require("lodash/clone");
var map = require("lodash/map");
var reduce = require("lodash/reduce");

var SessionStore = require("../../stores/SessionStore");
var separators = SessionStore.get("separators");
var formatThousands = require("d3").format(separators.thousands);

/* Helper functions */
var cb_bar_grid = require("../../charts/cb-charts").cb_bar_grid;
var help = require("../../util/helper.js");

/* Renderer mixins */
var ChartRendererMixin = require("../mixins/ChartRendererMixin.js");

/* Svg components */
var HiddenSvg = require("../svg/HiddenSvg.jsx");

/* One `GridChart` will be drawn for every column used in our grid */
var GridChart = require("./GridChart.jsx");

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
		var displayConfig = this.props.displayConfig;
		var hiddenSvg = [];

		var chartProps = update(this.props.chartProps, { $merge: {
			data: this._applySettingsToData(this.props.chartProps, { barHeight: displayConfig.barHeight }),
			scale: this.props.scale
		}});
		var scale = chartProps.scale.primaryScale;

		/*
		 * Set `extraPadding.left` to the width of the widest axis tick.
		*/
		var extraPadding = {
			top: chartProps.extraPadding.top,
			right: chartProps.extraPadding.right,
			bottom: chartProps.extraPadding.bottom,
			left: this.state.maxTickWidth
		};

		var dimensions = clone(this.props.dimensions);

		/* Divide total width by number of grids */
		var dimensionsPerGrid = {
			width: (dimensions.width - this.state.maxTickWidth) / chartProps._grid.cols
		};

		/* Height of each grid block */
		dimensionsPerGrid.height = (dimensions.height) / chartProps._grid.rows;

		if (this.props.hasTitle) {
			extraPadding.top = extraPadding.top + displayConfig.afterTitle;
			dimensionsPerGrid.height -= displayConfig.afterTitle;
		}


		/* Get the number of charts and only render that many */
		var numCharts = chartProps._grid.rows * chartProps._grid.cols;

		/*
		 * Render a hidden set of SVG axis labels in order to find out the
		 * maximum width the labels will take up. Doing this in a hidden component
		 * cuts down on the number of chart redraws. The max width is set to this
		 * component as `this.state.maxTickWidth`.
		*/

		/* Get the text values used for the labels */
		var tickLabels = map(chartProps.data[0].values, function(d) {
			return d.entry;
		});

		/* render a hidden SVG to get the width of the y axis labels */
		hiddenSvg.push(
			<HiddenSvg.HiddenSvgAxis
				className="tick"
				chartWidth={dimensions.width}
				maxTickWidth={this.state.maxTickWidth}
				formattedText={tickLabels}
				blockerRectOffset={this.props.displayConfig.blockerRectOffset}
				onUpdate={this._handleStateUpdate.bind(null, "maxTickWidth")}
				key="hiddenText"
			/>
		);

		if (this.state.maxTickWidth <= 0) {
			// We have not yet calculated maxTickWidth
			return (
				<g>{hiddenSvg}</g>
			);
		}

		/*
		 * A second hidden SVG is rendered to calculate whether the labels to the
		 * right of bars exceed the width of the chart area. This is set to
		 * `this.state.barLabelOverlap` and will be passed to the `GridChart`.
		*/
		var barLabels = reduce(chartProps.data, function(arr, d) {
			return map(d.values, function(val, i) {
				var formatted = format_bar_labels(val.value);
				if (i === 0) {
					formatted = scale.prefix + formatted + scale.suffix;
				}
				return {
					value: val.value,
					formatted: formatted
				};
			}).concat(arr);
		}, []);

		/* Relative position of chart area, used to place hidden labels correctly */
		var offset = {
			left: displayConfig.padding.left + displayConfig.margin.left,
			right: displayConfig.padding.right + displayConfig.margin.right
		};

		hiddenSvg.push(
			<HiddenSvg.HiddenSvgBarLabels
				className="concealer-label"
				labelOverlap={this.state.barLabelOverlap}
				chartWidth={dimensionsPerGrid.width}
				margin={displayConfig.margin}
				blockerRectOffset={this.props.displayConfig.blockerRectOffset + 5}
				formattedText={barLabels}
				scale={scale}
				offset={offset}
				onUpdate={this._handleStateUpdate.bind(null, "barLabelOverlap")}
				key="hiddenLabel"
			/>
		);
		var gridCharts = map(chartProps.data.slice(0, numCharts), bind(function(d, i) {
			// Get the props we need for each chart
			var gridChartProps = {
				chartSettings: chartProps.chartSettings[i],
				data: [d],
				scale: chartProps.scale,
				margin: this.props.displayConfig.margin,
				extraPadding: extraPadding
			};

			return (
				<GridChart
					chartProps={gridChartProps}
					rendererFunc={drawBarChartGrid}
					displayConfig={displayConfig}
					styleConfig={this.props.styleConfig}
					key={i}
					index={i}
					barLabelOverlap={this.state.barLabelOverlap}
					grid={chartProps._grid}
					dimensions={dimensionsPerGrid}
					padding={displayConfig.padding}
				/>
			);
		}, this));

		/*
		 * Pass the following JSX components to the `Svg` component, which will
		 * render all SVG. See `../svg/Svg.jsx`.
		*/
		var chartComponents = [
		];

		return (
			<g>
				<g key="chart-wrapper" className="renderer-chart-wrapper">
					{gridCharts}
				</g>
				<g key="chart-annotations" className="chart-annotations"></g>
				{ hiddenSvg }
			</g>
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

