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

    const geometries = d.topojson.objects[d.feature].geometries;
    /* if the first column is way longer than the schema, skip over it
    */
    if (geometries.length * 1.25 < length) {
    	testLength.push(0);
    }
    else {
    	let i = 0;
	    for (let key in geometries) {
	    	i++;
	    	/* only test the first 35 entries. if there is that much ambiguity,
	    	count on the user to override. this greatly improves speed */
	    	if (i < 35) {
		      firstColumn.forEach(function(g) {
		        if (d.test(g,key)) {
		          thisLength++;
		        }
		      });
	    	}
	    }
	    testLength.push(thisLength/geometries.length);
  	}
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

const findSchema = (schemaName) => {
	let schema;

	mapSchema.forEach(function(d,i) {
		if (schemaName === d.name) {
			schema = d;
		}
	});

	return schema;
}

const assignMap = (columnName, input, schemaName) => {
	if (!input.length) return;

  const firstColumn = buildFirstColumn(input, columnName);
  const schema = findSchema(schemaName);

  const mapType = {
    firstColumn : firstColumn,
    schema : schema
  };

	return mapType;
}

/**
 * Helper functions
 * @name helper
 */
const map_type_helper = Object.freeze({
	assign_map: assignMap,
  first_column: buildFirstColumn,
  determine_map: determineMap
});

module.exports = map_type_helper;
