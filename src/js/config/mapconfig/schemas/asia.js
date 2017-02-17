const countries = require('./helpers/world');

const Asia = {
	label: 'Asia',
	name: 'asia',
	values: countries,
	proj: 'mercator',
	translate: [-200, 360],
	translateCartogram: [-200, 360],
	precision: 1,
	scale: 310,
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
