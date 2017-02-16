import {toNumber} from 'lodash';

const countries = require('./helpers/world');

const ME = {
	label: 'Middle East 3 (Iran)',
	name: 'middleeast3',
	values: countries,
	proj: 'mercator',
	translate: [-370, 650],
	translateCartogram: [-370, 650],
	precision: 1,
	scale: 770,
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
