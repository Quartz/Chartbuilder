const countries = require('./helpers/world');

const Europe = {
	label: 'Europe',
	name: 'europe',
	values: countries,
	proj: 'conicConformal',
	translate: [370, 750],
	rotate: [-15,0],
	translateCartogram: [370, 750],
	precision: 1,
	scale: 660,
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

module.exports = Europe;
