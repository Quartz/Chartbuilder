const fipscounties = require('./helpers/counties-fips');

const nyc = {
    label: 'U.S. Counties',
    name: 'countiesUS',
    values: fipscounties,
    proj: 'albersUsa',
    translate: [310, 180],
    translateCartogram: [270, 180],
    precision: 1,
    scale: 710,
    topojson : require('./../mapfiles/us-counties/us-simple.json'),
    feature: 'counties',
    adjustLabels: function(adjusty=0,adjustx=0, label) {
      return [adjusty,adjustx,label];
    },
    matchLogic: function(val) {

        if (this.values[val]) { return this.values[val]; }
        else if (!isNaN(val)) { return +val; }
        else { return val; }
    },
    test: function(column_val, polygon_val) {
    	//console.log(this.matchLogic(polygon_val));
      return (this.matchLogic(+polygon_val) == +column_val);
    }
  }

module.exports = nyc;
