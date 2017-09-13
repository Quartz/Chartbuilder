
const countries = require('./helpers/world');

const ME = {
	label: 'Middle East 5 (Af-Pak)',
	name: 'middleeast5',
	values: countries,
	proj: 'mercator',
	translate: [-715, 660],
	translateCartogram: [-715, 660],
	precision: 1,
	scale: 870,
	topojson : require('./../mapfiles/world/me5.topo.json'),
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
