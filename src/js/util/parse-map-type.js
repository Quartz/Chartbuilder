import {clone, includes, keys, isUndefined, isArray, max, reduce} from 'lodash';

const mapSchema = require('./../config/mapconfig/map-schema.js');

//given some incoming data, we need to determine which type of map it is, based on the schema
// the map with the most matching features is the one that will be chosen

const buildFirstColumn = (data, columnName) => {

  const names = [];

  if (!data) return;

  data.forEach(function(d, j) {
    d.values.forEach(function(g, k) {
      names.push(g[columnName]);
    });
  });

  return names;
}

const testSchema = (mapSchema, firstColumn) => {

  const length = firstColumn.length;
  const testLength = [];

  mapSchema.forEach(function(d) {
    let thisLength = 0;
    for (let key in d.topojson.objects[d.feature].geometries) {
      firstColumn.forEach(function(g) {
        if (d.test(g,key)) {
          thisLength++;
        }
      })
    }
    testLength.push(thisLength/d.topojson.objects[d.feature].geometries.length);
  });

  const objIndex = testLength.indexOf(max(testLength));
  const schema = mapSchema[objIndex];

  return schema;
}
 
const determineMap = (columnName, input) => {

  if (!input.length) return;

  const firstColumn = buildFirstColumn(input, columnName);
  const schema = testSchema(mapSchema, firstColumn);

  const mapType = {
    firstColumn : firstColumn,
    schema : schema
  };

  return mapType;
}

/**
 * Helper functions!
 * @name helper
 */
const map_type_helper = Object.freeze({
  first_column: buildFirstColumn,
  determine_map: determineMap
});

module.exports = map_type_helper;
