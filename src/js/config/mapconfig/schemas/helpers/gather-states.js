
//states to include
const statePlane = require('./state-plane.js');
const statesArray = ['AZ','AR']
const width = 800;
const height = 600;

//function to build an object for each state
function newStateObject(stateName) {

	const projObj = statePlane(stateName,width,height);

	const state = {
    label: stateName + ' County-level',
    name: 'counties' + stateName,
    proj: projObj.proj,
    translate: projObj.translate,
    translateCartogram: projObj.translate,
    precision: 1,
    scale: projObj.scale,
    topojson : projObj.shp,
    feature: 'counties',
    adjustLabels: function(adjusty=0,adjustx=0,label) {
      return [adjusty,adjustx,label];
    },
    matchLogic: function(val) {
        //if (this.values[val]) { return this.values[val]; }
        if (!isNaN(val)) { return +val; }
        else { return val; }
    },
    test: function(column_val, polygon_val) {
    	//console.log(this.matchLogic(polygon_val));
      return (this.matchLogic(+polygon_val.id) == +column_val);
    }
  };


	return state;
}


// object to return
const allStates = [];

statesArray.forEach(function(d) {
	const stateObj = newStateObject(d);
	allStates.push(stateObj);
});

module.exports = allStates;
