const countries = require('./helpers/world');

const CA = {
	label: 'Central America',
	name: 'centralamerica',
	values: countries,
	proj: 'conicConformal',
	rotate: [100,0],
	translate: [210, 410],
	translateCartogram: [210, 410],
	precision: 1,
	scale: 970,
	topojson : require('./../mapfiles/world/ca.topo.json'),
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

module.exports = CA;
