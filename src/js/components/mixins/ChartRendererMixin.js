var React = require("react");
var update = require("react-addons-update");
var assign = require("lodash/assign");
var map = require("lodash/map");

/**
 * ### Functions common to chart renderers
 * @instance
 * @memberof renderers
 */
var ChartRendererMixin = {

	/**
	 * _applySettingsToData
	 * Our d4 chart renderers expect any additional settings to be in the data
	 * that is passed to it, so we merge them in (from a separate
	 * `chartSettings` object). An optional `additional` parameter adds an
	 * arbitray object to this
	 * @param _chartProps - Current data and series settings
	 * @param additional - Optional additional object to apply
	 * @return {object} - Data with settings applied
	 */
	_applySettingsToData: function(_chartProps, additional) {
		return map(_chartProps.data, function(d, i) {
			var series = {};
			series.key = d.name;
			if (additional) {
				series = assign(series, additional);
			}
			return assign(series, d, _chartProps.chartSettings[i]);
		});
	},

	/**
	 * _handleStateUpdate
	 * Update a key in the renderer component's state
	 * @param k - `this.state` key
	 * @param v - `this.state` value
	 */
	_handleStateUpdate: function(k, v) {
		var newValue = {};
		newValue[k] = v;
		this.setState(update(this.state, { $merge: newValue }));
	}

};

module.exports = ChartRendererMixin;
