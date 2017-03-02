const countries = require('./helpers/world');

const Europe = {
	label: 'Europe',
	name: 'europe',
	values: countries,
	proj: 'conicConformal',
	translate: [320, 640],
	rotate: [-15,0],
	translateCartogram: [320, 640],
	precision: 1,
	scale: 600,
	topojson : countries,
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
