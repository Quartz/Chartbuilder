import {toNumber} from 'lodash';

const countries = require('./helpers/world');

const ME = {
	label: 'Middle East 1 (wide)',
	name: 'middleeast1',
	values: countries,
	proj: 'mercator',
	translate: [-55, 470],
	translateCartogram: [-55, 470],
	precision: 1,
	scale: 500,
	topojson : require('./../mapfiles/world/world.topo.json'),
	feature: 'lsib_world',
	adjustLabels: function(adjusty=0,adjustx=0, label) {
	  return [adjusty,adjustx,label];
	},
	matchLogic: function(val) {

		//if (this.values[val]) { return this.values[val]; }
		if (!isNaN(val)) { return toNumber(val); }
		else { return val; }
	},
	test: function(column_val, polygon_val) {
	  return (this.matchLogic(column_val) == polygon_val.id);
	}
 }

module.exports = ME;
