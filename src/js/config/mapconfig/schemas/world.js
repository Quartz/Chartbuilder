import {toNumber} from 'lodash';

const countries = require('./helpers/world');

const world = {
	label: 'World',
	name: 'world',
	values: countries,
	proj: 'mercator',
	translate: [290, 240],
	translateCartogram: [260, 240],
	precision: 1,
	scale: 110,
	topojson : Object.freeze(require('./../mapfiles/world/world.topo.json')),
	feature: 'lsib_world',
	adjustLabels: function(adjusty=0,adjustx=0, label) {
	  return [adjusty,adjustx,label];
	},
	matchLogic: function(val) {
		return val;
	},
	test: function(column_val, polygon_val) {
	  return (this.matchLogic(column_val) === polygon_val.id);
	}
 }

module.exports = world;
