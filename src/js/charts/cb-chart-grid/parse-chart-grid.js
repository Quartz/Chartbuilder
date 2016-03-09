var clone = require("lodash/clone");
var map = require("lodash/map");
var assign = require("lodash/assign");
var each = require("lodash/each");

var SessionStore = require("../../stores/SessionStore");
var dataBySeries = require("../../util/parse-data-by-series");
var help = require("../../util/helper");

/**
 * see [ChartConfig#parser](#chartconfig/parser)
 * @see ChartConfig#parser
 * @instance
 * @memberof chart_grid_config
 */
function parseChartgrid(config, _chartProps, callback, parseOpts) {
	// Build chart settings from defaults or provided settings
	var chartProps = JSON.parse(JSON.stringify(_chartProps));
	var chartgrid_defaults = config.defaultProps.chartProps;
	var primaryScale = chartProps.scale.primaryScale || clone(config.defaultProps.chartProps.scale.primaryScale);
	var scaleData = [];
	var domain;
	var height;
	var isColumnOrBar;

	parseOpts = parseOpts || {};
	// dont check for date column if grid type is bar
	var checkForDate = chartProps._grid.type !== "bar";
	var bySeries = dataBySeries(chartProps.input.raw, {
			checkForDate: checkForDate,
			type: chartProps.input.type
		});

	var gridSettings = {
		rows: +chartProps._grid.rows || chartgrid_defaults._grid.rows,
		cols: +chartProps._grid.cols || bySeries.series.length
	};

	var chartSettings = map(bySeries.series, function(dataSeries, i) {
		var settings;
		// add data points to relevant scale
		scaleData = scaleData.concat(map(dataSeries.values, function(d) {
			return +d.value;
		}));

		if (chartProps.chartSettings[i]) {
			settings = chartProps.chartSettings[i];
		} else {
			settings = clone(chartgrid_defaults.chartSettings[0]);
			settings.colorIndex = i;
		}

		if (parseOpts.columnsChanged) {
			settings.label = dataSeries.name;
		} else {
			settings.label = settings.label || dataSeries.name;
		}

		return settings;
	});

	chartProps.scale.hasDate = bySeries.hasDate;
	chartProps.scale.isNumeric = bySeries.isNumeric;

	if (bySeries.hasDate) {
		chartProps.scale.dateSettings = chartProps.scale.dateSettings || clone(config.defaultProps.chartProps.scale.dateSettings);
		chartProps.scale.dateSettings.inputTZ = chartProps.scale.dateSettings.inputTZ || SessionStore.get("nowOffset")
		// for dates, default type should be line
		gridSettings.type = _chartProps._grid.type || "line";
		isColumnOrBar = (gridSettings.type === "column" || gridSettings.type === "bar");
		domain = help.computeScaleDomain(primaryScale, scaleData, {
			nice: true,
			minZero: isColumnOrBar
		});
		assign(primaryScale, domain);
	} else if (bySeries.isNumeric) {
		var maxPrecision = 5;
		var factor = Math.pow(10, maxPrecision);
		gridSettings.type = _chartProps._grid.type || "line";

		_computed = {
			//TODO look at entries for all series not just the first
			data: bySeries.series[0].values.map(function(d){return +d.entry}),
			hasColumn: false,
			count: 0
		};

		var currScale = chartProps.scale.numericSettings || clone(config.defaultProps.chartProps.scale.numericSettings);
		var domain = help.computeScaleDomain(currScale, _computed.data, {
			nice: true,
			minZero: false
		});

		assign(currScale, domain);

		var ticks = currScale.ticks;
		currScale.tickValues = help.exactTicks(currScale.domain, ticks);

		each(currScale.tickValues, function(v) {
			var tickPrecision = help.precision(Math.round(v*factor)/factor);
			if (tickPrecision > currScale.precision) {
				currScale.precision = tickPrecision;
			}
		});

		scale.numericSettings = currScale;

		if (chartProps.mobile) {
			if (chartProps.mobile.scale) {
				var currMobile = chartProps.mobile.scale.numericSettings;
				if (currMobile) {
					var domain = help.computeScaleDomain(currMobile, _computed.data, {
						nice: true,
						minZero: false
					});
					assign(currMobile, domain);

					var ticks = currMobile.ticks;
					currMobile.tickValues = help.exactTicks(currMobile.domain, ticks);
					each(currMobile.tickValues, function(v) {
						var tickPrecision = help.precision(Math.round(v*factor)/factor);
						if (tickPrecision > currMobile.precision) {
							currMobile.precision = tickPrecision;
						}
					});
				}
				chartProps.mobile.scale.numericSettings = currMobile
			}
		} else {
			chartProps.mobile = {};
		}
	} else {
		// ordinals default type should be bar
		gridSettings.type = _chartProps._grid.type || "bar";
		isColumnOrBar = (gridSettings.type == "column" || gridSettings.type == "bar");
		domain = help.computeScaleDomain(primaryScale, scaleData, {
			minZero: isColumnOrBar
		});
		assign(primaryScale, domain);
	}

	chartProps.scale.primaryScale = primaryScale;
	if (!chartProps.mobile) {
		chartProps.mobile = {};
	}

	if (chartProps.mobile.scale) {
		chartProps.mobile.scale.hasDate = bySeries.hasDate;
	}

	if (gridSettings.type != "bar") {
		primaryScale.ticks = primaryScale.ticks || 5;
		primaryScale.precision = primaryScale.precision || 0;
	}

	var newChartProps = assign(chartProps, {
		chartSettings: chartSettings,
		scale: chartProps.scale,
		input: bySeries.input,
		_grid: gridSettings,
		data: bySeries.series
	});

	if (callback) {
		callback(newChartProps);
	} else {
		return newChartProps;
	}
}

module.exports = parseChartgrid;
