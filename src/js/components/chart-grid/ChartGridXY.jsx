/*
 * ### ChartGridXY
 * Render a grid of N columns by N rows of XY (line, column, dot) charts
*/

var React = require("react");
var PropTypes = React.PropTypes;
var update = require("react-addons-update");
var d4 = require("d4");

var bind = require("lodash/bind");
var clone = require("lodash/clone");
var filter = require("lodash/filter");
var map = require("lodash/map");

/* Helper functions */
var cb_xy = require("../../charts/cb-charts").cb_xy;
var help = require("../../util/helper.js");

/* Renderer mixins */
var ChartRendererMixin = require("../mixins/ChartRendererMixin.js");

/* Svg components */
var HiddenSvg = require("../svg/HiddenSvg.jsx");

/* One `GridChart` will be drawn for every column used in our grid */
var GridChart = require("./GridChart.jsx");

/**
 * ### Component that renders xy charts in a chart grid
 * @property {boolean} editable - Allow the rendered component to interacted with and edited
 * @property {object} styleConfig - Parsed global style config
 * @property {object} displayConfig - Parsed visual display configuration for chart grid
 * @property {object} chartProps - Properties used to draw this chart
 * @instance
 * @memberof ChartGridRenderer
 */
var ChartGridXY = React.createClass({

	propTypes: {
		editable: PropTypes.bool.isRequired,
		styleConfig: PropTypes.object.isRequired,
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

	mixins: [ChartRendererMixin],

	getInitialState: function() {
		return {
			maxTickWidth: 0, // widest y axis tick, needed to compute padding
			extraHeight: 0 // height added to chart by wrapped source line
		};
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		// Don't render if data is for some reason unavailable
		if (nextProps.chartProps.data) {
			return true;
		} else {
			return false;
		}
	},

	render: function() {
		var chartProps = update(this.props.chartProps, { $merge: {
			data: this._applySettingsToData(this.props.chartProps, { altAxis: false }),
			scale: this.props.scale
		}});

		var displayConfig = this.props.displayConfig;
		xyConfig = displayConfig.xy;

		var hiddenSvg = [];

		/*
		 * Set `extraPadding.left` to the width of the widest axis tick.
		 * Add extraHeight to the bottom if there is height added by source wrapping
		*/
		var extraPadding = {
			top: chartProps.extraPadding.top,
			right: chartProps.extraPadding.right + displayConfig.afterXYRight,
			bottom: chartProps.extraPadding.bottom + this.state.extraHeight,
			left: this.state.maxTickWidth
		};

		var dimensions = clone(this.props.dimensions);

		if (this.props.hasTitle) {
			extraPadding.top = extraPadding.top + displayConfig.afterTitle;
		}

		/* Divide total width by number of grids, also subtracting the spade to be
		* used to the right of a chart */
		var dimensionsPerGrid = {
			width: (dimensions.width - this.state.maxTickWidth - displayConfig.afterXYRight) / chartProps._grid.cols
		};

		/*
		 * Render a hidden set of SVG axis labels in order to find out the
		 * maximum width the labels will take up. Doing this in a hidden component
		 * cuts down on the number of chart redraws. The max width is set to this
		 * component as `this.state.maxTickWidth`.
		*/
		var currScale = chartProps.scale.primaryScale;

		/*
		 * Get the tick values so that we can pass them both to the actual chart
		 * renderer and to the component that will render hidden ticks
		*/
		var tickValues = help.exactTicks(currScale.domain, currScale.ticks);

		/* We dont want to check against the first value */
		var skipFirstValue = filter(tickValues, function(d) {
			return (d !== currScale.domain[1]);
		});

		var formattedTicks = map(skipFirstValue, function(tick) {
			return help.roundToPrecision(tick, currScale.precision);
		});

		var axisTicks = {
			name: "scale",
			tickValues: tickValues,
			formattedTicks: formattedTicks,
			precision: currScale.precision,
			max: currScale.domain[1]
		};

		/*
		 * Render hidden y-axis ticks in order to compute the maxTickWidth
		 * independent of rendering the chart itself, this is needed to set the
		 * appropriate padding for the chart. We must do this for each y-axis.
		*/
		hiddenSvg.push(
			<HiddenSvg.HiddenSvgAxis
				className="tick"
				chartWidth={dimensions.width}
				maxTickWidth={this.state.maxTickWidth}
				formattedText={axisTicks.formattedTicks}
				blockerRectOffset={this.props.displayConfig.blockerRectOffset}
				key={"hidden-ticks"}
				onUpdate={this._handleStateUpdate.bind(null, "maxTickWidth")}
			/>
		);

		/* Width and height of each grid block */
		var paddingAfterOffset = (xyConfig.padding.bottom - displayConfig.afterXYBottom) / chartProps._grid.rows;

		dimensionsPerGrid.width = dimensionsPerGrid.width - displayConfig.afterXYRight;
		dimensionsPerGrid.height =
			(dimensions.height - this.state.extraHeight - extraPadding.top - paddingAfterOffset) /
			chartProps._grid.rows;

		/* Get the number of charts and only render that many */
		var numCharts = chartProps._grid.rows * chartProps._grid.cols;
		var gridCharts = map(chartProps.data.slice(0, numCharts), bind(function(d, i) {
			// Get the props we need for each chart
			var gridChartProps = {
				chartSettings: chartProps.chartSettings[i],
				data: [d],
				scale: chartProps.scale,
				margin: this.props.displayConfig.margin,
				extraPadding: extraPadding
			};

			return <GridChart
				chartProps={gridChartProps}
				key={i}
				index={i}
				styleConfig={this.props.styleConfig}
				rendererFunc={drawXYChartGrid}
				displayConfig={this.props.displayConfig}
				barLabelOverlap={this.state.barLabelOverlap}
				grid={chartProps._grid}
				dimensions={dimensionsPerGrid}
				padding={displayConfig.padding}
			/>
		}, this));

		return (
			<g>
				<g ref="gridCharts" key="chart-wrapper" className="renderer-chart-wrapper">
					{gridCharts}
				</g>
				<g key="chart-annotations" className="chart-annotations"></g>
				{hiddenSvg}
			</g>
		);
	}
});

function drawXYChartGrid(el, state) {
	// clear the previous d4 chart if necessary
	// TODO: this is not working otherwise because a d4 `mixout` does not remove
	// a previously existing element. look into adding this feature

	if (el.childNodes[0]) {
		el.removeChild(el.childNodes[0]);
	}

	var chartProps = state.chartProps;
	var scale = chartProps.scale;
	var displayConfig = state.displayConfig;
	var styleConfig = state.styleConfig;
	var colorIndex = chartProps.chartSettings.colorIndex;
	var gridType = state.grid.type;
	var dateSettings = state.dateSettings;
	var numericSettings = state.numericSettings;


	xyConfig = displayConfig.xy;

	var chart = cb_xy()
		.outerHeight(state.dimensions.height)
		.margin(chartProps.margin)

	chartProps.data[0].type = gridType;
	// set right padding to zero for xy chartgrid
	chart.padding({
		top: displayConfig.padding.top,
		right: 0,
		bottom: displayConfig.padding.bottom,
		left: displayConfig.padding.left
	})

	var extraPadding = {
		top: 0,
		right: 0
	};

	// If this is the bottom row (or the top row in a one-row grid), apply XY
	// bottom padding and add it back to the height, accounting for chartGrid
	// afterXY setting
	if ((state.positions.y === 0) && (state.grid.rows === 1)) {
		extraPadding.bottom = xyConfig.padding.bottom;
		chart.outerHeight(state.dimensions.height + xyConfig.padding.bottom - displayConfig.afterLegend);
	} else if (state.positions.y === state.grid.rows - 1) {
		extraPadding.bottom = xyConfig.padding.bottom;
		chart.outerHeight(state.dimensions.height + (Math.abs(xyConfig.padding.bottom - displayConfig.afterXYBottom)));
	} else {
		// Otherwise for non-bottom-row grids, apply afterXY for bottom padding
		extraPadding.bottom = displayConfig.afterXYBottom;
	}

	if (state.positions.x === 0) {
		chart.using("series-label",function(lab){
			lab.x(function() {
				return 0;
			})
			lab.afterRender(function() {
				this.container.selectAll("text.label")
					.each(function(d,i) {
						var index = !isNaN(colorIndex) ? colorIndex : i;
						d3.select(this).attr("data-color-index", index);
					});
			})
		})
		.using("leftAxis", function(axis){
			yAxisUsing.call(this, "primary", axis, state);
		})
		.using("x-axis-label", function(label) {
			label.beforeRender(function(data){

				return [{
					ypos: numericSettings ? state.dimensions.height - state.padding.bottom + state.styleConfig.overtick_bottom : 0,
					xval: numericSettings ? scale.numericSettings.domain[0] : 0,
					text: numericSettings ? numericSettings.suffix : "",
					dy: state.grid.rows == 1 ? "1.2em" : 0
				}]
			})			
			
		})
		.using("xAxis", function(axis) {
			if(chartProps.scale.isNumeric) {
				axis.tickValues(chartProps.scale.numericSettings.tickValues)
				axis.tickFormat(function(d,i) {
					return (i == 0 ? chartProps.scale.numericSettings.prefix : "") +  help.roundToPrecision(d, chartProps.scale.numericSettings.precision)
				})
			}

			axis.innerTickSize(styleConfig.overtick_bottom);
		})
		.outerWidth(state.dimensions.width + chartProps.extraPadding.left);
		// set tick width to left padding for first row
		extraPadding.left = chartProps.extraPadding.left;
		chart.extraPadding(extraPadding);
	} else {
		chart
		.outerWidth(state.dimensions.width)
		.using("series-label",function(lab){
			lab.x(function() {
				return 0;
			})
			lab.afterRender(function() {
				this.container.selectAll("text.label")
					.each(function(d,i) {
						var index = !isNaN(colorIndex) ? colorIndex : i;
						d3.select(this).attr("data-color-index", index);
					});
			});
		})
		.using("leftAxis", function(axis){
			axis.innerTickSize(state.dimensions.width);
			axis.tickValues(help.exactTicks(scale.primaryScale.domain, scale.primaryScale.ticks));
			axis.tickFormat(function() {
				return "";
			});
		})
		.using("xAxis", function(axis) {
			if(chartProps.scale.isNumeric) {
				axis.tickValues(chartProps.scale.numericSettings.tickValues)
				axis.tickFormat(function(d,i) {
					return help.roundToPrecision(d, chartProps.scale.numericSettings.precision)
				})
			}

			axis.innerTickSize(styleConfig.overtick_bottom);
		})
		.using("x-axis-label", function(label) {
			label.beforeRender(function(data){
				return [{
					text: "",
					dy: 0
				}]
			})			
			
		})
		chart.outerWidth(state.dimensions.width);
		chart.extraPadding(extraPadding);
	}
	chart
	.x(function(x) {
		x.key("entry");
		var rangeL = this.padding.left + styleConfig.xOverTick;
		var rangeR = this.width - this.padding.right - (chartProps._numSecondaryAxis > 0 ? styleConfig.xOverTick : 0);
		if (state.hasColumn) {
			rangeL += displayConfig.columnExtraPadding;
			rangeR -= displayConfig.columnExtraPadding;
		}
		if (dateSettings) {
			x.scale("time");
			x.domain(dateSettings.domain);
		}
		else if (numericSettings) {
			x.scale("linear");
			x.clamp(false)
			x.domain(numericSettings.domain);
		}
		x.range([rangeL, rangeR]);
	})
	.left(function(y) {
		y.key("value")
			.domain(chartProps.scale.primaryScale.domain)
			.range([this.height - this.padding.bottom, this.padding.top + displayConfig.afterTitle]);
	})
	.chartAreaOnTop(false)
	.mixout("rightAxis")
	.using("xAxis", function(axis) {
		if (chartProps.scale.hasDate) {
			axis.tickValues(dateSettings.dateTicks);
			var curOffset = Date.create().getTimezoneOffset();
			var displayTZ = state.chartProps.scale.dateSettings.displayTZ;
			var inputOffset = state.chartProps.scale.dateSettings.inputTZ ? -help.TZOffsetToMinutes(state.chartProps.scale.dateSettings.inputTZ) : curOffset;
			var timeOffset = 0;
			axis.tickFormat(function(d,i) {
				if(displayTZ === "as-entered") {
					timeOffset = curOffset - inputOffset;
				}

				return dateSettings.dateFormatter(d.clone(),i,timeOffset);
			});
		}

		axis.innerTickSize(styleConfig.overtick_bottom);
	})

	d3.select(el)
		.append("g")
		.datum(chartProps.data)
		.call(chart);
}

function yAxisUsing(location, axis, state) {
	var chartProps = state.chartProps;
	var isPrimary = (location === "primary");
	var scale = chartProps.scale;

	axis.tickValues(help.exactTicks(scale.primaryScale.domain, scale.primaryScale.ticks));
	axis.innerTickSize(state.dimensions.width);

	var maxTickVal = d3.max(axis.tickValues());
	axis.tickFormat(function(d) {
		if (d == maxTickVal) {
			return [
				scale.primaryScale.prefix,
				help.roundToPrecision(d, scale.primaryScale.precision),
				scale.primaryScale.suffix
			].join("");
		} else {
			return help.roundToPrecision(d, scale.primaryScale.precision);
		}
	});
}


module.exports = ChartGridXY;
