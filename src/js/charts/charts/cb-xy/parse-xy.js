import {clone, map, assign, each, filter} from 'lodash';

const dataBySeries = require("../../../util/parse-data-by-series");
const help = require("../../../util/helper");
const SessionStore = require("../../../stores/SessionStore");

const scaleNames = ["primaryScale", "secondaryScale"];

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
	const chartProps = JSON.parse(JSON.stringify(_chartProps));
	const bySeries = dataBySeries(chartProps.input.raw, {
		checkForDate: true,
		type: chartProps.input.type
	});

	const labels = chartProps._annotations.labels;
	//let allColumn = true;
	// check if either scale contains columns, as we'll need to zero the axis
	//const _primaryColumn = false;
	//const _secondaryColumn = false;
	const _scaleComputed = {};

	each(scaleNames, function(name) {
		_scaleComputed[name] = {
			data: [],
			hasColumn: false,
			count: 0
		};
	});

	let chartSettings = map(bySeries.series, function(dataSeries, i) {
		let settings;

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

		const values = map(dataSeries.values, function(d) {
			return +d.value;
		});

		let _computed;

		// add data points to relevant scale
		if (settings.altAxis === false) {

			_computed = _scaleComputed.primaryScale;
			_computed.data = _computed.data.concat(values);
			_computed.count += 1;
			if (settings.type == "column") {
				_computed.hasColumn = true;
			}

		} else {

			_computed = _scaleComputed.secondaryScale;
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
			return { name: dataSeries.name };
		}
	});

	const maxPrecision = 5;
	const factor = Math.pow(10, maxPrecision);

	const scale = {};
	const mobileScale = {};

	// Calculate domain and tick values for any scales that exist
	each(scaleNames, function(name) {
		let _computed = _scaleComputed[name];
		if (_computed.count > 0) {
			let currScale = chartProps.scale[name] || clone(config.defaultProps.chartProps.scale.primaryScale);
			let domain = help.computeScaleDomain(currScale, _computed.data, {
				nice: true,
				minZero: _computed.hasColumn
			});
			assign(currScale, domain);

			let ticks;
			if (name === "primaryScale") {
				ticks = currScale.ticks;
			} else {
				ticks = scale.primaryScale.ticks;
			}

			currScale.tickValues = help.exactTicks(currScale.domain, ticks);
			each(currScale.tickValues, function(v) {
				const tickPrecision = help.precision(Math.round(v*factor)/factor);
				if (tickPrecision > currScale.precision) {
					currScale.precision = tickPrecision;
				}
			});

			scale[name] = currScale;

			if (chartProps.mobile) {
				if (chartProps.mobile.scale) {
					const currMobile = chartProps.mobile.scale[name];
					if (currMobile) {
						domain = help.computeScaleDomain(currMobile, _computed.data, {
							nice: true,
							minZero: _computed.hasColumn
						});
						assign(currMobile, domain);

						const ticks = (name == "primaryScale") ? currMobile.ticks : scale.primaryScale.ticks;
						currMobile.tickValues = help.exactTicks(currMobile.domain, ticks);
						each(currMobile.tickValues, function(v) {
							const tickPrecision = help.precision(Math.round(v*factor)/factor);
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
		let _computed = {
			//TODO look at entries for all series not just the first
			data: bySeries.series[0].values.map(function(d){return +d.entry}),
			hasColumn: false,
			count: 0
		};

		let currScale = chartProps.scale.numericSettings || clone(config.defaultProps.chartProps.scale.numericSettings);
		let domain = help.computeScaleDomain(currScale, _computed.data, {
			nice: true,
			minZero: false
		});

		assign(currScale, domain);

		currScale.ticks = currScale.ticks || help.suggestTickNum(currScale.domain);

		const ticks = currScale.ticks;
		currScale.tickValues = help.exactTicks(currScale.domain, ticks);

		each(currScale.tickValues, function(v) {
			const tickPrecision = help.precision(Math.round(v*factor)/factor);
			if (tickPrecision > currScale.precision) {
				currScale.precision = tickPrecision;
			}
		});

		scale.numericSettings = currScale;

		if (chartProps.mobile) {
			if (chartProps.mobile.scale) {
				const currMobile = chartProps.mobile.scale.numericSettings;
				if (currMobile) {
					let domain = help.computeScaleDomain(currMobile, _computed.data, {
						nice: true,
						minZero: false
					});
					assign(currMobile, domain);

					const ticks = currMobile.ticks;
					currMobile.tickValues = help.exactTicks(currMobile.domain, ticks);
					each(currMobile.tickValues, function(v) {
						const tickPrecision = help.precision(Math.round(v*factor)/factor);
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

	const newChartProps = assign(chartProps, {
		chartSettings: chartSettings,
		scale: scale,
		input: bySeries.input,
		data: bySeries.series,
    visualType: config.defaultProps.chartProps.visualType,
		_numSecondaryAxis: _scaleComputed.secondaryScale.count
	});

	if (callback) {
		callback(newChartProps);
	} else {
		return newChartProps;
	}

}


module.exports = parseXY;
