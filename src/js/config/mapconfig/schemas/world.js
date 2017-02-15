import {toNumber} from 'lodash';

const countries = require('./helpers/world');

const world = {
	label: 'World',
	name: 'world',
	values: countries,
	proj: 'mercator',
	translate: [290, 240],
	translateCartogram: [290, 240],
	precision: 1,
	scale: 110,
	topojson : Object.freeze(require('./../mapfiles/world/world.topo.sorted.json')),
	feature: 'lsib_world',
	adjustLabels: function(adjusty=0,adjustx=0, label) {
	  return [adjusty,adjustx,label];
	},
	matchLogic: function(val) {

		//if (this.values[val]) { return this.values[val]; }
		return val;
		//if (!isNaN(val)) { return toNumber(val); }
		//else { return val; }
	},
	test: function(column_val, polygon_val) {
	  return (this.matchLogic(column_val) === polygon_val.id);
	}
 }

module.exports = world;
