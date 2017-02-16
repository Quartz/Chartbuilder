const countries = require('./helpers/world');

const SA = {
	label: 'South America',
	name: 'southamerica',
	values: countries,
	proj: 'mercator',
	translate: [590, 75],
	translateCartogram: [590, 75],
	precision: 1,
	scale: 230,
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

module.exports = SA;
