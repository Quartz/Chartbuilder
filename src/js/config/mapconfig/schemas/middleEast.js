
const countries = require('./helpers/world');

const ME = {
	label: 'Middle East 1 (wide)',
	name: 'middleeast1',
	values: countries,
	proj: 'mercator',
	translate: [-55, 410],
	translateCartogram: [-55, 410],
	precision: 1,
	scale: 500,
	topojson : require('./../mapfiles/world/me1.topo.json'),
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
