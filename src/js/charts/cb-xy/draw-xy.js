if (process.env.NODE_ENV !== "test") {
	var d4 = require("d4");
}

var filter = require("lodash/filter");
var each = require("lodash/each");

var chartStyle = require("../../config/chart-style");
var cb_mixins = require("../cb-d4-mixins.js");
var help = require("../../util/helper.js");

// TODO put this in `xy-config.js`
var xy_config = {
	lineDotsThresholdSingle: 10,
	lineDotsThresholdTotal: 30,
	maxColumnWidth: 50,
	axisOrient: {
		"left": "left",
		"right": "right"
	},
	xAxisShift: 10
};

var mixin = [
	{
		"name": "xAxis",
		"feature": d4.features.xAxis
	},
	{
		"name": "leftAxis",
		"feature": d4.features.yAxis
	},
	{
		"name": "bars",
		"feature": d4.features.groupedColumnSeries
	},
	{
		"name": "lines",
		"feature": d4.features.lineSeries
	},
	{
		"name": "circles",
		"feature": d4.features.circleSeries
	},
	{
		"name": "rightAxis",
		"feature": d4.features.yAxis
	},
	{
		"name": "other-bars",
		"feature": d4.features.groupedColumnSeries
	},
	{
		"name": "other-lines",
		"feature": d4.features.lineSeries
	},
	{
		"name": "other-circles",
		"feature": d4.features.circleSeries
	},
	cb_mixins.series_label,
	cb_mixins.x_axis_label
];

var locationKey = {
	"primary":"left",
	"secondary":"right"
};

var using = {
	lines: function(line,location,singleLineDotThresh,totalLinePoints) {
		var isPrimary = (location === "primary");
		var scale = isPrimary ? this.left : this.right;
		line.beforeRender(function(data) {
			var isolated_data = [];

			each(data, function(d,i) {
				var isProperType = d.type == "line";
				var isProperAxis = (d.altAxis === false && isPrimary) || (d.altAxis === true && !isPrimary);

				if(isProperType && isProperAxis) {
					d.index = i;
					isolated_data.push(d);
					totalLinePoints += d.values.length;
					if (d.values.length < xy_config.lineDotsThresholdSingle) {
						singleLineDotThresh = true;
					}
				}
			});

			return isolated_data;
		});

		line.x(function(d) {
			if (this.x.$scale == "time" || this.x.$scale == "linear") {
				return this.x(d[this.x.$key]);
			} 
			else {
				return this.x(d[this.x.$key]) + this.x.rangeBand() / 2;
			}
		});

		line.y(function(d){
			return scale(d[scale.$key]);
		});

		line.defined(function(d){return d.value || d.value === 0;});

		line.afterRender(function() {
			this.container.selectAll((isPrimary ? "." : ".other-" ) + "lines g.line, .other-lines g.line")
				.each(function(d,i) {
					var index = !isNaN(d.colorIndex) ? d.colorIndex : d.index;
					d3.select(this).attr("data-color-index", index);
					d.prevIndex = index;
				});
		});
	},

	bars: function(bar, location) {
		var isPrimary = (location === "primary");
		var scale = isPrimary ? this.left : this.right;
		var yScaleId = (isPrimary) ? "left" : "right";
		var names = [];
		var num_column_series = 0;

		bar.yScaleId(yScaleId);
		bar.beforeRender(function(data) {
			var isolated_data = [];
			each(data, function(d,i) {
				var isProperType = d.type == "column";
				var isProperAxis = (d.altAxis === false && isPrimary) || (d.altAxis === true && !isPrimary);

				if(isProperType) {
					names.push(d.name);
					num_column_series += 1;
					if (isProperAxis) {
						d.index = i;
						isolated_data.push(d);
					}
				}
			});

			this.groups.domain(names);

			var mapped = isolated_data.map(function(d) {
				return d.values.map(function(c) {
					c.colorIndex = d.colorIndex;
					c.index = d.index;
					return c;
				});
			});

			var merged = [];
			merged = [].concat.apply(merged, mapped);
			var parsed = d4.parsers.nestedGroup()
				.x("entry")
				.y("value")
				.value("value")(merged);

			if (isolated_data.length > 0) {
				var numDataPoints = isolated_data[0].values.length;
				var numCols = isolated_data.length;

				// account for the case of columns in a time series. this requires
				// some special positioning because a time series is continuous and
				// the groups cannot be placed with `x.rangeBand()`
				if ((this.x.$scale == "time"  || this.x.$scale == "linear") && parsed.data.length > 0) {
					var xRange = this.x.range();
					var effectiveChartWidth = xRange[1] - xRange[0];

					// the size of each set of grouped bars
					var barGroupWidth = effectiveChartWidth / parsed.data.length;
					// set the range of each group to this per-group width
					this.groups.rangeBands([0, barGroupWidth], 0.05, 0.1);
					var groupRangeBand = this.groups.rangeBand();

					// enforce max width if necessary
					if (groupRangeBand > xy_config.maxColumnWidth) {
						bar.width(xy_config.maxColumnWidth);
						// each group width needs to be reduced if we are enforcing max width
						barGroupWidth -= (groupRangeBand - xy_config.maxColumnWidth);
					} else {
						bar.width(this.groups.rangeBand());
					}

					// place bars
					bar.x(function(d) {
						return this.groups(d[this.groups.$key]) - (barGroupWidth / 2);
					});
				} else {
					// set outer padding of groups axis to prevent column width from
					// becoming too large
					if (numDataPoints > 6) {
						groupOuterPadding = 0.1;
					} else if (numDataPoints > 3 && numDataPoints <= 6) {
						groupOuterPadding = 0.4;
					} else {
						groupOuterPadding = 0.6;
					}
					this.groups.rangeRoundBands([0, this.x.rangeBand()], 0.05, groupOuterPadding);
				}

			}
			return parsed.data;
		});

		bar.y(function(d){
			var val = d[scale.$key];
			return val > 0 ? scale(val) : scale(0);
		});

		bar.afterRender(function() {
			this.container.selectAll((isPrimary ? "." : ".other-" ) + "bars .entry").selectAll("rect")
				.each(function(d, i) {
					var index = !isNaN(d.colorIndex) ? d.colorIndex : d.index;
					d3.select(this).attr("data-color-index", index);
					d.prevIndex = index;
				});
		});
	},

	circles: function(circle, location) {
		var isPrimary = (location === "primary");
		var scale = isPrimary ? this.left : this.right;
		var singleLineDotThresh = false;

		circle.beforeRender(function(data) {
			var isolated_data = [];

			// get total number of line points and check if any single one is above
			// threshold
			var totalLinePoints = data.map(function(d) {
				if (d.values.length < xy_config.lineDotsThresholdSingle) {
					singleLineDotThresh = true;
				}
				return d.values;
			}).reduce(function(a, b) {
				return a.concat(b);
			}).length;

			var totalLineDotThresh = (totalLinePoints < xy_config.lineDotsThresholdTotal);
			var renderLineDots = (singleLineDotThresh && totalLineDotThresh);

			each(data, function(d,i) {
				var shouldHaveDots = d.type == "scatterPlot"  || (d.type == "line" && renderLineDots);
				var isProperAxis = (d.altAxis === false && isPrimary) || (d.altAxis === true && !isPrimary);
				if(shouldHaveDots  && isProperAxis) {
					d.index = i;
					isolated_data.push(d);
				}
			});
			return isolated_data;
		});

		circle
			.cx(function(d) {
				if (this.x.$scale == "time" || this.x.$scale == "linear") {
					return this.x(d[this.x.$key]);
				} else {
					return this.x(d[this.x.$key]) + this.x.rangeBand() / 2;
				}
			})
			.cy(function(d) {
				return d[scale.$key] !== null ? scale(d[scale.$key]) : -1000;
			})
			.r(function() {
				// TODO: remove this hardcoding
				if (this.width > 600) {
					return 3;
				} else {
					return 2;
				}
			});

		circle.afterRender(function() {
			this.container.select((isPrimary ? "." : ".other-") + "circles").selectAll("g")
				.each(function() {
					var d = d3.select(this).datum();
					var index = !isNaN(d.colorIndex) ? d.colorIndex : d.index;
					d3.select(this).attr("data-color-index", index);
				});
		});
	}
};

var cb_xy = d4.chart("cb-xy", function() {
	var singleLineDotThresh = false;
	var totalLinePoints = 0;

	var xyChart = d4.baseChart({
		config: {
			axes: {
				x: {
					scale: "ordinal",
					roundBands: 0.1
				},
				left : {
					scale: "linear"
				},
				right: {
					scale: "linear"
				},
				groups: {
					scale: "ordinal",
					dimension: "x",
					roundBands: 0.1
				}
			}
		}
	})
		.mixin(mixin)
		.using("leftAxis", function(axis) {
			axis.stagger(false);
			axis.wrap(false);
			axis.scaleId("left");
			axis.orient(xy_config.axisOrient.left);
			axis.align(xy_config.axisOrient.left);
		})
		.using("rightAxis", function(axis) {
			axis.stagger(false);
			axis.wrap(false);
			axis.scaleId("right");
			axis.orient(xy_config.axisOrient.right);
			axis.align(xy_config.axisOrient.right);
		})
		.using("xAxis", function(axis) {
			axis.stagger(false);

			axis.afterRender(function(curAxis, data, chartArea, axisNode) {
				var self = this;
				var numColumns = filter(data, function(d) {
					return d.type === "column";
				}).length;

				if (numColumns === data.length) {
					this.container.selectAll(".xAxis .tick").attr("data-anchor", "middle");
				}
				if(self.x.$scale == "time") {
					axisNode.selectAll("text").each(function(d) {
						var text = d3.select(this);
						// We will handle this in CSS. Override d3's default settings here.
						text.style("text-anchor", null);
						var textLength = this.getComputedTextLength();
						if ((self.x(d) + textLength) > self.width) {
							text.attr("x", function() {
								return self.width - (self.x(d) + textLength);
							});
						}
					});
				}
				var coords = help.transformCoords(axisNode.attr("transform"));
				coords[1] = coords[1] + xy_config.xAxisShift;
				axisNode.attr("transform","translate(" + coords + ")");
				


				

				

			});
		})
		.using("x-axis-label", function(label) {
			label.afterRender(function(curLabel, data, chartArea){
				var first_tick = this.container.selectAll(".xAxis .tick")[0][0]
				chartArea.selectAll(".xAxislabel").attr("dx",first_tick.getBoundingClientRect().width/-2)
			})
		})
		.y(function(y){
			y.clamp(false);
		})
		.x(function(x){
			if(x.clamp) {
				x.clamp(false);
			}
		})
		.left(function(y){
			y.clamp(false);
		})
		.right(function(y){
			y.clamp(false);
		})
		.groups(function(groups) {
			groups.key("name");
		})
		.using("lines", function(line) {
			using.lines.call(this, line, "primary");
		})
		.using("bars", function(bars) {
			using.bars.call(this, bars, "primary");
		})
		.using("circles", function(circ) {
			using.circles.call(this, circ, "primary");
		})
		.using("other-lines", function(line) {
			using.lines.call(this, line, "secondary");
		})
		.using("other-bars", function(bars) {
			using.bars.call(this, bars, "secondary");
		})
		.using("other-circles", function(circ) {
			using.circles.call(this, circ, "secondary");
		});

	return xyChart;
});

module.exports = cb_xy;
