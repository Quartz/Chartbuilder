const countries = require('./helpers/world');

const NA = {
	label: 'North America',
	name: 'northamerica',
	values: countries,
	proj: 'mercator',
	translate: [680, 380],
	translateCartogram: [680, 380],
	precision: 1,
	scale: 220,
	topojson : require('./../mapfiles/world/world.topo.json'),
	feature: 'lsib_world',
	adjustLabels: function(adjusty=0,adjustx=0, label) {
	  return [adjusty,adjustx,label];
	},
	matchLogic: function(val) {
		return val;
	},
	test: function(column_val, polygon_val) {
	  return (this.matchLogic(column_val) == polygon_val.id);
	}
 }

module.exports = NA;
