if (process.env.NODE_ENV !== "test") {
	var d4 = require("d4");
}

var cb_mixins = require("../cb-d4-mixins.js");

// D4 mixins used in the bar grid
var mixin = [
	{
		"name": "leftAxis",
		"feature": d4.features.yAxis,
		"index" : 0,
	},
	{
		"name": "no-label-tick",
		"feature": cb_mixins.no_label_tick.feature,
		index: 1
	},
	cb_mixins.concealer_label,
	cb_mixins.series_label,
	{
		"name": "zero-line",
		"feature": d4.feature("zero-line", function(name) {
			return {
				accessors: {
					x: function(d) {
						return this.x(0);
					},
					y1: function(d) {
						var yRange = this.y.rangeExtent();
						return yRange[0];
					},
					y2: function(d) {
						var yRange = this.y.rangeExtent();
						return yRange[1];
					}
				},
				render: function(scope, data, selection) {
					var line = d4.appendOnce(selection,"line.zero")
						.data(data);

					line
						.attr("x1", d4.functor(scope.accessors.x).bind(this))
						.attr("x2", d4.functor(scope.accessors.x).bind(this))
						.attr("y1", d4.functor(scope.accessors.y1).bind(this))
						.attr("y2", d4.functor(scope.accessors.y2).bind(this));
				}
			};
		})
	},
];

cb_bar_grid = d4.chart("cb-bar-grid", function() {
	return d4.charts.row()
		.mixin(mixin)
		.mixout(["yAxis"])
		.x(function(x){
			x.clamp(false);
		})
		.using("leftAxis", function(axis) {
			axis.align("left");
			axis.stagger(false);
			axis.wrap(false);
		})
		.using("xAxis", function(axis) {
			axis.stagger(false);
		});
	}
);

module.exports = cb_bar_grid;
