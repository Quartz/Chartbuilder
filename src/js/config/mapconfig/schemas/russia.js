import {toNumber} from 'lodash';

const countries = require('./helpers/world');

const ME = {
	label: 'Russia',
	name: 'russia',
	values: countries,
	proj: 'conicConformal',
	translate: [-55, 490],
	translateCartogram: [-55, 490],
	precision: 1,
	scale: 190,
	topojson : require('./../mapfiles/world/world.topo.json'),
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

module.exports = ME;
