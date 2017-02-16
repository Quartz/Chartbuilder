//states to include
const statePlane = require('./helpers/state-plane.js');
const statesArray = ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

//used for calculating the map bounds
const width = 600;
const height = 350;

//function to build an object for each state
function newStateObject(stateName) {

	const projObj = statePlane(stateName,width,height);

	const state = {
    label: stateName + ' county-level',
    name: 'counties' + stateName,
    proj: projObj.proj,
    translate: projObj.translate,
    translateCartogram: projObj.translate,
    precision: 1,
    parallels: projObj.parallels,
    rotate: projObj.rotate,
    scale: projObj.scale,
    topojson : projObj.shp,
    feature: 'counties',
    adjustLabels: function(adjusty=0,adjustx=0,label) {
      return [adjusty,adjustx,label];
    },
    matchLogic: function(val) {
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

const allStates = [];

statesArray.forEach(function(d) {
	const stateObj = newStateObject(d);
	allStates.push(stateObj);
});

module.exports = allStates;
