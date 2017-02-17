const countries = require('./helpers/world');

const SA = {
	label: 'South America',
	name: 'southamerica',
	values: countries,
	proj: 'conicConformal',
	rotate: [70,0],
	translate: [270, 60],
	translateCartogram: [250, 80],
	precision: 1,
	scale: 180,
	topojson : require('./../mapfiles/world/sa.topo.json'),
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
