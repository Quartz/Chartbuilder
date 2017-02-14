
const nycSchema = require('./schemas/nyc.js');
const us50Schema = require('./schemas/us50.js');
const usCountiesSchema = require('./schemas/usCounties.js');
const worldSchema = require('./schemas/world.js');
const meSchema = require('./schemas/middleEast.js');
const asiaSchema = require('./schemas/asia.js');
const africaSchema = require('./schemas/africa.js');
const europeSchema = require('./schemas/europe.js');
const naSchema = require('./schemas/northamerica.js');
const ozSchema = require('./schemas/oz.js');
const caSchema = require('./schemas/centralamerica.js');
const saSchema = require('./schemas/southamerica.js');
const russia = require('./schemas/russia.js');

const maps = [us50Schema,nycSchema,usCountiesSchema,worldSchema,
							meSchema,asiaSchema,africaSchema,europeSchema,naSchema,
							ozSchema,saSchema,caSchema,russia];

module.exports = maps;
