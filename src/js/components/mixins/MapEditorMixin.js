
import React from 'react';
import update from 'react-addons-update';

// Flux actions
const MapViewActions = require("../../actions/VisualViewActions");

/**
 * ### Functions common to chart editors
 * @instance
 * @memberof editors
 */
const MapEditorMixin = {

	/**
	 * _handlePropUpdate
	 * Initiate a flux action that updates a prop, that doesn't require reparsing
	 * @param k - `chartProp` key
	 * @param v - `chartProp` value
	 */
	_handlePropUpdate: function(k, v) {
		MapViewActions.updateChartProp(k, v);
	},

	/**
	 * _handlePropAndReparse
	 * Initiate a flux action that updates a prop and then triggers a reparse
	 * @param k - `chartProp` key
	 * @param v - `chartProp` value
	 */
	_handlePropAndReparse: function(k, v) {
		//console.info('handlePropAndReparse',k,v);
		MapViewActions.updateAndReparse(k, v);
	},

	/**
	 * _handleStateUpdate
	 * Update a key in the editor component's state
	 * @param k - `this.state` key
	 * @param v - `this.state` value
	 */
	_handleStateUpdate: function(k, v) {
		let newValue = {};
		newValue[k] = v;
		this.setState(update(this.state, { $merge: newValue }));
	},

};

module.exports = MapEditorMixin;
