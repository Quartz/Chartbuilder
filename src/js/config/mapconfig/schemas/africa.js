const countries = require('./helpers/world');

const Africa = {
	label: 'Africa',
	name: 'africa',
	values: countries,
	proj: 'conicConformal',
	rotate: [-20,0],
	translate: [290, 160],
	translateCartogram: [290, 160],
	precision: 1,
	scale: 225,
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

module.exports = Africa;
