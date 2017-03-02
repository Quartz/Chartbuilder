//Premade map schemas
const us50Schema = require('./schemas/us50.js');
//const usCountiesSchema = require('./schemas/usCounties.js');
const nycSchema = require('./schemas/nyc.js');
const worldSchema = require('./schemas/world.js');
const meSchema = require('./schemas/middleEast.js');
const meSchema2 = require('./schemas/middleEast2.js');
const meSchema3 = require('./schemas/middleEast3.js');
const meSchema4 = require('./schemas/middleEast4.js');
const meSchema5 = require('./schemas/middleEast5.js');
const asiaSchema = require('./schemas/asia.js');
const africaSchema = require('./schemas/africa.js');
const europeSchema = require('./schemas/europe.js');
const naSchema = require('./schemas/northamerica.js');
const ozSchema = require('./schemas/oz.js');
const caSchema = require('./schemas/centralamerica.js');
const saSchema = require('./schemas/southamerica.js');
const russia = require('./schemas/russia.js');

const maps = [us50Schema,nycSchema,worldSchema,
							meSchema,meSchema2,meSchema3,meSchema4,meSchema5,asiaSchema,
							africaSchema,europeSchema,naSchema,ozSchema,saSchema,caSchema,russia];

//const maps = [us50Schema,usCountiesSchema];

//Optional
//States Counties arrives as an array of all states objects
const showCounties = true;
if (showCounties) {
	//const statesCounties = require('./schemas/statesCounties.js')
	statesCounties.forEach(function(d) {
		maps.push(d);
	});
}

module.exports = maps;
