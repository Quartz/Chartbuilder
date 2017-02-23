import React from 'react';
const Polygon = require('react-d3-map-core').Polygon; // https://github.com/react-d3/react-d3-map-core/blob/master/src/polygon.jsx
import {centroid} from 'turf';

import d3 from 'd3';

// Flux actions
const MapViewActions = require("../../actions/VisualViewActions");

const ShapesCollection = React.createClass({

  propTypes: {
    geoPath: React.PropTypes.func,
    polygonClass: React.PropTypes.string,
    onClick: React.PropTypes.func,
    chartProps: React.PropTypes.object.isRequired
  },
  _updateStyles: function(nextProps) {

  	const chartProps = nextProps.chartProps;
    const mapSchema = nextProps.schema;
    const currSettings = chartProps.scale;

    const lastdata = this.props.chartProps.data;
    const alldata = chartProps.data;

    const allpolygons = this.props.data;
    const columnNames = chartProps.columns;

  	const keyColumn = columnNames[0];
  	const valueColumn = (columnNames.length === 2) ? columnNames[1] : columnNames[2];

    const translation = this._getTranslation(chartProps);

    const svg = d3.select('.polygon-group');

    const dataDomain = currSettings.domain;
    const radius = d3.scale.sqrt()
                  .range([0, nextProps.stylings.radiusVal])
                  .domain(dataDomain);

    svg.attr('transform', translation);
    // tk
    let testObj = {k:[]};

    for (let l = 0; l < alldata.length; l++) {
    	testObj.k = allpolygons.length;
    	const indexTest = alldata[l]['index'];
		 	const seriesdata = alldata[l].values;

    	for (let i = 0; i < seriesdata.length; i++) {
    		testObj = this._matchValues(testObj, seriesdata[i], keyColumn, allpolygons, mapSchema, indexTest);

	    	if (testObj.found) {
	    		const valueSet = testObj.thisvalue[0];

     			const renderRadius = radius(valueSet[valueColumn]);
     			const newColor = currSettings[valueSet.index].color;

	    		svg.select('#circle_' + testObj.i)
	    			.attr('r',renderRadius + 'px')
			      .style('fill', newColor)
			      .style('stroke',newColor);
	    	}
	    }
    }
  },
  _updateStroke(nextProps) {
  	//update all strokes to new stroke val
    d3.select('.polygon-group')
    	.selectAll('.' + nextProps.polygonClass)
    	.style('stroke', nextProps.stylings.stroke);
  },
  _testDataChange(pastDataset, newDataset) {
  	let testDatasetChange = false;

  	pastDataset.forEach(function(d, i) {
  		if (!newDataset[i]) {
  			testDatasetChange = true;
  		} else {
  			if (d.values.length !== newDataset[i].values.length) testDatasetChange = true;
  		}
  	});

  	return testDatasetChange;
  },
  shouldComponentUpdate: function(nextProps) {
  	/* only update if the schema type changes or the dataset length or groupings change
  	otherwise just update the styles. */
  	if (this.props.schema.name !== nextProps.schema.name
  		 || this.props.chartProps.data.length !== nextProps.chartProps.data.length
  		 || this._testDataChange(this.props.chartProps.data, nextProps.chartProps.data)) {
  		return true;
  	} else if (this.props.stylings.stroke !== nextProps.stylings.stroke) {
  		this._updateStroke(nextProps);
  		return false;
  	} else {
  		this._updateStyles(nextProps);
  		return false;
  	}
  },
  _topTranslation: function(topTranslation) {
  	if (this.props.metadata.subtitle) {
    	if (this.props.metadata.subtitle.length > 0) {
    		topTranslation += 20;
    	}
    }
    return topTranslation;
  },
  _getTranslation: function(chartProps) {
    const topTranslation = (Object.keys(chartProps.legend).length === 1) ? this.props.displayConfig.margin.maptop + 50 : this.props.displayConfig.margin.maptop;
    const translation = `translate(0,${this._topTranslation(topTranslation)})`;

    return translation;
  },
  _bruteSearchForValue: function(start,stop,mapSchema,d,keyColumn,polygonData,testObj,index) {
  	for (let j = start; j<stop; j++) {
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
  },
  _binarySearch: function(polygondata, key, testObj, d, index, keyColumn) {
    let lo = 0;
    let hi = polygondata.length - 1;
    let mid;
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
  },
  _binarySearchCounty: function(polygondata, key, testObj, d, index, keyColumn) {
    let lo = 0;
    let hi = polygondata.length - 1;
    let mid;
    let element;

    while (lo <= hi) {
        mid = (lo + hi) >> 1;
        element = polygondata[mid].id;
       	if (key < element) {
            hi = mid - 1;
        } else if (key > element) {
            lo = mid + 1;
        } else {
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
  },
  _matchValues: function(testObj={}, testData, keyColumn, allpolygons, mapSchema, index) {

    testObj.thisvalue = [];
    testObj.found = false;

    if (allpolygons.length === 0) return testObj;
    if (allpolygons.length === 1) {
			if (mapSchema.test(testData[keyColumn], allpolygons[0])) {
    		testObj.thisvalue = [Object.assign({'index':index},testData)];
    		testObj.geometry = allpolygons.geometry || allpolygons[0].geometry;
    		testObj.found = true;
    		testObj.i = 0;
    		testObj.id = allpolygons.id || allpolygons[0].id;
    		return testObj;
    	}
		}

		if (!testObj.found) {
			// first search a sub selection of the array
	  	const start = (testObj.k - 3 < 0) ? 0 : testObj.k - 3;
	  	const stop = (testObj.k + 3 > allpolygons.length) ? allpolygons.length : testObj.k + 3;

	  	// first brute search inside the subarray
	  	testObj = this._bruteSearchForValue(start,stop,mapSchema,testData,keyColumn,allpolygons,testObj,index);

	  	// if still not found, use binary search
    	if (!testObj.found) {
    		return testObj = (mapSchema.name === 'countiesUS') ?
    			this._binarySearchCounty(allpolygons, mapSchema.matchLogic(testData[keyColumn]), testObj, testData, index, keyColumn) :
    			this._binarySearch(allpolygons, mapSchema.matchLogic(testData[keyColumn]), testObj, testData, index, keyColumn);
    	}
    };
    return testObj;
  },
  _renderCircles: function(testObj, chartProps, currSettings, projection, geoPath, radius, valueColumn) {

  	if (!testObj.thisvalue.length) return (null);

  	const valueSet = testObj.thisvalue[0];
		const styles = {
							fillOpacity:0.15,
							strokeWidth: '0.75px',
							stroke:currSettings[valueSet.index].color,
							fill:currSettings[valueSet.index].color
						 };

    // at the center labels if required
      const attributes = {x:null, y:null, text:''};
      testObj.type = "Feature";

      if (projection(centroid(testObj).geometry.coordinates)) {
      	const centers = projection(centroid(testObj).geometry.coordinates);

        attributes.x = centers[0];
        attributes.y = centers[1];
      }

     const renderRadius = radius(testObj.thisvalue[0][valueColumn]);

  	return (
          <circle
            key= {`circle_with_${testObj.i}`}
            style={styles}
            r={renderRadius}
            cx={attributes.x}
            cy={attributes.y}
            id= {`circle_${testObj.i}`}
            className={'state-labels-show'}
          >
          </circle>);
  },
  _renderPolygons: function(testObj, chartProps, currSettings, projection, geoPath) {

		const valueSet = testObj.thisvalue[0];
		const styles = {
						fill:'#ddd',
						stroke: chartProps.stylings.stroke
						};

      return (
        <g key={`polygon_with_${testObj.i}_${testObj.id}`}>
          <path
            d= {geoPath(testObj.geometry)}
            className={this.props.polygonClass}
            style={styles}
          />
        </g>);
  },
  render: function() {

  	const chartProps = this.props.chartProps;
    const mapSchema = this.props.schema;
    const geoPath = this.props.geoPath;
    const projection = this.props.proj;
    const currSettings = chartProps.scale;

    const alldata = chartProps.data;
    const allpolygons = this.props.data;
    const columnNames = chartProps.columns;

    // lower the map for the single legend;
    const translation = this._getTranslation(chartProps);

    // define extra variables for the needed update
  	const keyColumn = columnNames[0];
  	const valueColumn = (columnNames.length === 2) ? columnNames[1] : columnNames[2];

  	let testObj = {k:[]};
    const polygonCollection = [];
    const circleReturn = [];
    const alreadyRenderedPolygons = [];

    const dataDomain = currSettings.domain;
    const radius = d3.scale.sqrt()
                  .range([0, this.props.stylings.radiusVal])
                  .domain(dataDomain);

    for (let l = 0; l < alldata.length; l++) {
    	testObj.k = allpolygons.length;
    	const indexTest = alldata[l]['index'];

    	for (let i = 0; i < alldata[l].values.length; i++) {

    		testObj = this._matchValues(testObj, alldata[l]['values'][i], keyColumn, allpolygons, mapSchema, indexTest);

    		//if (!testObj.found) console.log(alldata[l]['values'][i]);
	    	if (testObj.found) {

					alreadyRenderedPolygons.push(testObj.i);

	    		polygonCollection.push(this._renderPolygons(testObj, chartProps, currSettings, projection, geoPath));
		    	//
		    	circleReturn.push(this._renderCircles(testObj, chartProps, currSettings, projection, geoPath, radius, valueColumn))
		    }
		  }
    };

    allpolygons.map((polygonData,i) => {
    	// return if already rendered this polygon
    	if (alreadyRenderedPolygons.indexOf(i) > -1) return null;

    	const styles = {};
  		styles.stroke = chartProps.stylings.stroke;
      styles.fill = '#eee';

  		polygonCollection.push(
        <path
          id={`polygon_${i}`}
          key={`polygon_${i}_${polygonData.id}`}
          data-id={polygonData.id}
          d= {geoPath(polygonData.geometry)}
          className={this.props.polygonClass}
          style={styles}
        />
    	);
    });

    return (
      <g transform={translation}
      	 className="polygon-group"
      	 clipPath="url(#clip)">
      	 	{polygonCollection}{circleReturn}
      </g>
    );
  }
});

module.exports = ShapesCollection
