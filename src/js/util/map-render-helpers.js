import d3 from 'd3';

const binarySearch = (polygondata, key, testObj, d, index, keyColumn) => {
	var lo = 0;
  var hi = polygondata.length - 1;
  var mid;
  let element;

  key = (typeof key === 'string' && isNaN(key)) ? key.toLowerCase().replace(/\s+/g, '') : +key;

  while (lo <= hi) {
      mid = (lo + hi) >> 1;

      const thisPolygon = polygondata[mid].id;
      element = (typeof thisPolygon === 'string' && isNaN(thisPolygon)) ? thisPolygon.toLowerCase().replace(/\s+/g, '') : +thisPolygon;

     	if (key < element) {
          hi = mid - 1;
          //
      } else if (key > element) {
          lo = mid + 1;
          //
      } else {
      	if (key !== element) return testObj;
      	testObj.k = mid;
    		testObj.i = mid;
    		testObj.id = element;
    		testObj.found = true;
    		testObj.geometry = polygondata[mid].geometry;
    		testObj.thisvalue = [Object.assign({'index':index},d)];
      	return testObj;
      	break;
      }
  }
  return testObj;
}

const binarySearchNumeric = (polygondata, key, testObj, d, index, keyColumn) => {
  var lo = 0;
  var hi = polygondata.length - 1;
  var mid;
  let element;

  while (lo <= hi) {
      mid = (lo + hi) >> 1;
      element = polygondata[mid].id;
     	if (key < element) {
          hi = mid - 1;
      } else if (key > element) {
          lo = mid + 1;
      } else {
      	if (key !== element) return testObj;
      	testObj.k = mid;
    		testObj.i = mid;
    		testObj.found = true;
    		testObj.id = element;
    		testObj.geometry = polygondata[mid].geometry;
    		testObj.thisvalue = [Object.assign({'index':index},d)];
      	return testObj;
      	break;
      }
  }
  return testObj;
}

const bruteSearchForValue = (start,stop,mapSchema,d,keyColumn,polygonData,testObj,index) => {
	for (var j = start; j<stop; j++) {
		if (testObj.found) break;
		if (mapSchema.test(d[keyColumn], polygonData[j])) {
  		testObj.k = j;
  		testObj.i = j;
  		testObj.id = polygonData[j].id;
  		testObj.found = true;
  		testObj.geometry = polygonData[j].geometry;
  		testObj.thisvalue = [Object.assign({'index':index},d)];
  		break;
		}
	}
	return testObj;
}

const testDataChange = (pastDataset, newDataset) => {
	let testDatasetChange = false;

	pastDataset.forEach(function(d, i) {
		if (!newDataset[i]) {
			testDatasetChange = true;
		} else {
			if (d.values.length !== newDataset[i].values.length) testDatasetChange = true;
		}
	});

	return testDatasetChange;
}

const getProjection = (schema, updatedScale, updatedTranslate) => {
	const projObj = {
    projection: schema.proj,
    scale: updatedScale,
    translate: updatedTranslate,
    precision: schema.precision
  }

  if (schema.parallels) projObj.parallels = schema.parallels;
  if (schema.rotate) projObj.rotate = schema.rotate;

  return projObj;
}

const topTranslationCalc = (topTranslation, props) => {
	if (props.metadata.subtitle.length > 0) {
		topTranslation += props.displayConfig.margin.subtitle;
	}
  return topTranslation;
}

const getTranslation = (chartProps, props) => {
	const withMobile = (props.isSmall) ? props.displayConfig.margin.mobile.extraMapMarginTop : 0;
  const topTranslation = (Object.keys(chartProps.legend).length === 1) ?
  				withMobile + props.displayConfig.margin.maptop + props.displayConfig.margin.legendsOneRow
  			: props.displayConfig.margin.maptopMultiple;

  return `translate(0,${topTranslationCalc(topTranslation, props)})`;
}

const updateStroke = (nextProps) => {
	//update all strokes to new stroke val
  d3.select('.polygon-group'  + '.' + nextProps.isSmall)
  	.selectAll('.' + nextProps.polygonClass)
  	.style('stroke', nextProps.stylings.stroke);
}

const RadiusSize = (props) => {
	const computedR = (props.isSmall) ? props.stylings.radiusVal / 2 : props.stylings.radiusVal;
	return computedR;
}

const helper = {
	binary_search: binarySearch,
	binary_search_numeric: binarySearchNumeric,
	get_projection: getProjection,
	test_data_change: testDataChange,
	brute_search: bruteSearchForValue,
	get_translation: getTranslation,
	update_stroke: updateStroke,
	radius_size: RadiusSize
};

module.exports = helper;
