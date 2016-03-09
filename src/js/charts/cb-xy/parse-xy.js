var clone = require("lodash/clone");
var map = require("lodash/map");
var assign = require("lodash/assign");
var each = require("lodash/each");
var filter = require("lodash/filter");

var dataBySeries = require("../../util/parse-data-by-series");
var help = require("../../util/helper");
var SessionStore = require("../../stores/SessionStore");

var scaleNames = ["primaryScale", "secondaryScale"];

/**
 * see [ChartConfig#parser](#chartconfig/parser)
 * @see ChartConfig#parser
 * @instance
 * @memberof xy_config
 */
function parseXY(config, _chartProps, callback, parseOpts) {
	// Build chart settings from defaults or provided settings

	parseOpts = parseOpts || {};
	// clone so that we aren't modifying original
	// this can probably be avoided by applying new settings differently
	var chartProps = JSON.parse(JSON.stringify(_chartProps));
	var bySeries = dataBySeries(chartProps.input.raw, {
		checkForDate: true,
		type: chartProps.input.type
	});

	var labels = chartProps._annotations.labels;
	var allColumn = true;
	// check if either scale contains columns, as we'll need to zero the axis
	var _primaryColumn = false;
	var _secondaryColumn = false;
	var _scaleComputed = {};

	each(scaleNames, function(name) {
		_scaleComputed[name] = {
			data: [],
			hasColumn: false,
			count: 0
		};
	});

	var chartSettings = map(bySeries.series, function(dataSeries, i) {
		var settings;

		if (chartProps.chartSettings[i]) {
			settings = chartProps.chartSettings[i];
		} else {
			settings = clone(config.defaultProps.chartProps.chartSettings[0]);
			settings.colorIndex = i;
		}

		if (parseOpts.columnsChanged) {
			settings.label = dataSeries.name;
		} else {
			settings.label = settings.label || dataSeries.name;
		}

		var values = map(dataSeries.values, function(d) {
			return +d.value;
		});

		// add data points to relevant scale
		if (settings.altAxis === false) {

			var _computed = _scaleComputed.primaryScale;
			_computed.data = _computed.data.concat(values);
			_computed.count += 1;
			if (settings.type == "column") {
				_computed.hasColumn = true;
			}

		} else {

			var _computed = _scaleComputed.secondaryScale;
			_computed.data = _computed.data.concat(values);
			_computed.count += 1;
			if (settings.type == "column") {
				_computed.hasColumn = true;
			}

		}

		return settings;

	});

	labels.values = map(bySeries.series, function(dataSeries, i) {

		if (labels.values[i]) {
			return assign({}, { name: chartSettings[i].label}, labels.values[i]);
		} else {
			return {
				name: dataSeries.name
			};
		}

	});

	var maxPrecision = 5;
	var factor = Math.pow(10, maxPrecision);

	var scale = {};
	var mobileScale = {};

	// Calculate domain and tick values for any scales that exist
	each(scaleNames, function(name) {
		var _computed = _scaleComputed[name];
		if (_computed.count > 0) {
			var currScale = chartProps.scale[name] || clone(config.defaultProps.chartProps.scale.primaryScale);
			var domain = help.computeScaleDomain(currScale, _computed.data, {
				nice: true,
				minZero: _computed.hasColumn
			});
			assign(currScale, domain);

			var ticks;
			if (name === "primaryScale") {
				ticks = currScale.ticks;
			} else {
				ticks = scale.primaryScale.ticks;
			}

			currScale.tickValues = help.exactTicks(currScale.domain, ticks);
			each(currScale.tickValues, function(v) {
				var tickPrecision = help.precision(Math.round(v*factor)/factor);
				if (tickPrecision > currScale.precision) {
					currScale.precision = tickPrecision;
				}
			});

			scale[name] = currScale;

			if (chartProps.mobile) {
				if (chartProps.mobile.scale) {
					var currMobile = chartProps.mobile.scale[name];
					if (currMobile) {
						var domain = help.computeScaleDomain(currMobile, _computed.data, {
							nice: true,
							minZero: _computed.hasColumn
						});
						assign(currMobile, domain);

						var ticks = (name == "primaryScale") ? currMobile.ticks : scale.primaryScale.ticks;
						currMobile.tickValues = help.exactTicks(currMobile.domain, ticks);
						each(currMobile.tickValues, function(v) {
							var tickPrecision = help.precision(Math.round(v*factor)/factor);
							if (tickPrecision > currMobile.precision) {
								currMobile.precision = tickPrecision;
							}
						});
					}
				}
			} else {
				chartProps.mobile = {};
			}
		}
	});

	// If there is only one primary and >0 secondary, color the left axis
	if (_scaleComputed.primaryScale.count === 1 && _scaleComputed.secondaryScale.count > 0) {
		scale.primaryScale.colorIndex = filter(chartSettings, function(series) {
			return (series.altAxis === false);
		})[0].colorIndex;
	} else {
		scale.primaryScale.colorIndex = null;
	}
	// If there is only one secondary and >0 primary, color the right axis
	if (_scaleComputed.secondaryScale.count === 1 && _scaleComputed.primaryScale.count > 0) {
		scale.secondaryScale.colorIndex = filter(chartSettings, function(series) {
			return (series.altAxis === true);
		})[0].colorIndex;
	} else if (_scaleComputed.secondaryScale.count > 0) {
		scale.secondaryScale.colorIndex = null;
	}

	// create the data structure for the renederer based on input
	if (bySeries.hasDate) {
		scale.hasDate = bySeries.hasDate;
		scale.dateSettings = chartProps.scale.dateSettings || clone(config.defaultProps.chartProps.scale.dateSettings);
		scale.dateSettings.inputTZ = scale.dateSettings.inputTZ || SessionStore.get("nowOffset")
	}

	if (bySeries.isNumeric) {
		scale.isNumeric = bySeries.isNumeric;
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

		currScale.ticks = currScale.ticks || help.suggestTickNum(currScale.domain);

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
				chartProps.mobile.scale.numericSettings = currMobile;
			}
		} else {
			chartProps.mobile = {};
		}


	}

	var newChartProps = assign(chartProps, {
		chartSettings: chartSettings,
		scale: scale,
		input: bySeries.input,
		data: bySeries.series,
		_numSecondaryAxis: _scaleComputed.secondaryScale.count
	});

	if (callback) {
		callback(newChartProps);
	} else {
		return newChartProps;
	}

}


module.exports = parseXY;
