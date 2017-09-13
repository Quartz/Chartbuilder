
const countries = require('./helpers/world');

const ME = {
	label: 'Middle East 2 (Gulf of Aden)',
	name: 'middleeast2',
	values: countries,
	proj: 'mercator',
	translate: [-260, 310],
	translateCartogram: [-260, 310],
	precision: 1,
	scale: 640,
	topojson : require('./../mapfiles/world/me2.topo.json'),
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
