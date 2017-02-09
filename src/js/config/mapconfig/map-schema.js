
const nycSchema = require('./schemas/nyc.js');
const us50Schema = require('./schemas/us50.js');
const usCountiesSchema = require('./schemas/usCounties.js');
const worldSchema = require('./schemas/world.js');
const meSchema = require('./schemas/middleEast.js');

const maps = [us50Schema,nycSchema,usCountiesSchema,worldSchema,meSchema];

module.exports = maps;
