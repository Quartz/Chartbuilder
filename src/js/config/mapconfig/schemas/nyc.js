const boroughs = {
    1: ['Staten Island'],
    2: ['Queens'],
    4: ['Brooklyn'],
    3: ['Manhattan'],
    5: ['Bronx'],
    'Staten Island': 1,
    'Queens': 2,
    'Brooklyn': 4,
    'Manhattan':3,
    'Bronx':5
}

const nyc = {
		label: 'NYC',
    name: 'NYC',
    values: boroughs,
    proj: 'mercator',
    translate: [37500, 22600],
    translateCartogram: [37500, 22600],
    precision: 1,
    scale: [31500],
    topojson: require('./../mapfiles/nyc/nyc.json'),
    feature: 'nyc',
    adjustLabels: function(adjusty=0,adjustx=0, label) {
      return [adjusty,adjustx,label];
    },
    matchLogic: function(val) {

        if (this.values[val]) { return this.values[val]; }
        else if (!isNaN(val)) { return +val; }
        else { return val; }
    },
    test: function(column_val, polygon_val) {
      return (this.matchLogic(polygon_val.id) == column_val);
    }
  }

module.exports = nyc;
