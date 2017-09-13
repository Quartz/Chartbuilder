

const countries = require('./helpers/world');

const ME = {
	label: 'Middle East 4 (Isis)',
	name: 'middleeast4',
	values: countries,
	proj: 'mercator',
	translate: [-880, 1250],
	translateCartogram: [-880, 1250],
	precision: 1,
	scale: 1740,
	topojson : require('./../mapfiles/world/me4.topo.json'),
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
