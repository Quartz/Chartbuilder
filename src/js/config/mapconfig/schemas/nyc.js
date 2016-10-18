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
    name: 'NYC',
    values: [boroughs],
    proj: 'mercator',
    translate: [46400, 28000],
    precision: 1,
    scale: [35700],
    topojson: require('./../mapfiles/nyc/nyc.json'),
    feature: 'nyc',
    adjustLabels: function(adjusty=0,adjustx=0, label) {
      return [adjusty,adjustx,label];
    },
    matchLogic: function(val) {

        if (boroughs[val]) { return boroughs[val]; }
        else if (!isNaN(val)) { return +val; }
        else { return val; }
    },
    test: function(column_val, polygon_val) {

      return (this.matchLogic(polygon_val) == column_val);
    }
  }

module.exports = nyc;
