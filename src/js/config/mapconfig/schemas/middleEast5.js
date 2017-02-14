import {toNumber} from 'lodash';

const countries = require('./helpers/world');

const ME = {
	label: 'Middle East 5 (Af-Pak)',
	name: 'middleeast5',
	values: countries,
	proj: 'mercator',
	translate: [-725, 700],
	translateCartogram: [-725, 700],
	precision: 1,
	scale: 870,
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
