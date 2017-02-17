const countries = require('./helpers/world');

const Asia = {
	label: 'Asia',
	name: 'asia',
	values: countries,
	proj: 'transverseMercator',
	translate: [-200, 320],
	translateCartogram: [-200, 320],
	precision: 1,
	scale: 260,
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

module.exports = Asia;
