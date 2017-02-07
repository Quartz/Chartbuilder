
const nycSchema = require('./schemas/nyc.js');
const us50Schema = require('./schemas/us50.js');
const usCountiesSchema = require('./schemas/usCounties.js');

const maps = [us50Schema,nycSchema,usCountiesSchema];

module.exports = maps;
