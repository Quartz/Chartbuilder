var React = require("react");
var update = require("react-addons-update");

// Flux actions
var ChartViewActions = require("../../actions/ChartViewActions");

/**
 * ### Functions common to chart editors
 * @instance
 * @memberof editors
 */
var ChartEditorMixin = {

	/**
	 * _handlePropUpdate
	 * Initiate a flux action that updates a prop, that doesn't require reparsing
	 * @param k - `chartProp` key
	 * @param v - `chartProp` value
	 */
	_handlePropUpdate: function(k, v) {
		ChartViewActions.updateChartProp(k, v);
	},

	/**
	 * _handlePropAndReparse
	 * Initiate a flux action that updates a prop and then triggers a reparse
	 * @param k - `chartProp` key
	 * @param v - `chartProp` value
	 */
	_handlePropAndReparse: function(k, v) {
		ChartViewActions.updateAndReparse(k, v);
	},

	/**
	 * _handleStateUpdate
	 * Update a key in the editor component's state
	 * @param k - `this.state` key
	 * @param v - `this.state` value
	 */
	_handleStateUpdate: function(k, v) {
		var newValue = {};
		newValue[k] = v;
		this.setState(update(this.state, { $merge: newValue }));
	},

};

module.exports = ChartEditorMixin;
