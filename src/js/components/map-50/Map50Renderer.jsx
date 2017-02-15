import React from 'react';
import d3 from 'd3';
import {filter, find, isEqual, differenceby} from 'lodash';
import {centroid} from 'turf';

// Flux actions
const MapViewActions = require("../../actions/VisualViewActions");

const PolygonsRender = React.createClass({

  propTypes: {
    geoPath: React.PropTypes.func,
    polygonClass: React.PropTypes.string,
    chartProps: React.PropTypes.object.isRequired
  },
  _filterDifference: function(old, newval, keyColumn, valueColumn) {
  	const diffArr = [];

		newval.forEach(function(e) {
		    if(!old.some(s => s[keyColumn] == e[keyColumn] || s[valueColumn] == e[valueColumn])) {
		        diffArr.push(e);
		    }
		});
		return diffArr;
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

    const svg = d3.select('.polygon-group');
    // tk
    let testObj = {k:[]};

    for (let l = 0; l < alldata.length; l++) {
    	testObj.k = allpolygons.length;
    	const indexTest = alldata[l]['index'];
		 	const seriesdata = alldata[l].values;

    	for (let i = 0; i < seriesdata.length; i++) {
    		//console.log(seriesdata[i], 'seriesdata');
    		testObj = this._matchValues(testObj, seriesdata[i], keyColumn, allpolygons, mapSchema, indexTest);

	    	if (testObj.found) {
	    		const valueSet = testObj.thisvalue[0];

	    		svg.select('#polygon_' + testObj.i)
		      .style('fill', currSettings[valueSet.index].d3scale(valueSet[valueColumn]))
		      .style('stroke',chartProps.stylings.stroke);
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
  		 || this.props.stylings.showStateLabels !== nextProps.stylings.showStateLabels
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
  _bruteSearchForValue: function(start,stop,mapSchema,d,keyColumn,polygonData,testObj,index) {
  	for (let j = start; j<stop; j++) {
  		if (testObj.found) break;
  		if (mapSchema.test(d[keyColumn], polygonData[j])) {
    		testObj.k = j;
    		testObj.i = j;
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

    key = (typeof key === 'string') ? key.toLowerCase().replace(/\s+/g, '') : key;

    while (lo <= hi) {
        mid = (lo + hi) >> 1;
        element = (typeof polygondata[mid].id === 'string') ? polygondata[mid].id.toLowerCase().replace(/\s+/g, '') : polygondata[mid].id;
       	if (key < element) {
            hi = mid - 1;
            //
        } else if (key > element) {
            lo = mid + 1;
            //
        } else {
        	testObj.k = mid;
	    		testObj.i = mid;
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
    		testObj.geometry = allpolygons[0].geometry;
    		testObj.found = true;
    		testObj.i = 0;
    		return testObj;
    	}
		}
		if (!testObj.found) {
			// first search a sub selection of the array
	  	const start = (testObj.k - 4 < 0) ? 0 : testObj.k - 4;
	  	const stop = (testObj.k + 4 > allpolygons.length) ? allpolygons.length : testObj.k + 4;

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
  render: function() {
  	const chartProps = this.props.chartProps;
    const mapSchema = this.props.schema;
    const geoPath = this.props.geoPath;
    const projection = this.props.proj;
    const currSettings = chartProps.scale;

    const alldata = chartProps.data;
    const allpolygons = this.props.data;
    const columnNames = chartProps.columns;

    const showLabels = chartProps.stylings.showStateLabels;
    const adjustLabels = mapSchema.adjustLabels;

    // lower the map for the single legend;
    let topTranslation = (Object.keys(chartProps.legend).length === 1) ? this.props.displayConfig.margin.maptop + 50 : this.props.displayConfig.margin.maptop;
    const translation = `translate(0,${this._topTranslation(topTranslation)})`;

    // define extra variables for the needed update
  	const keyColumn = columnNames[0];
  	const valueColumn = (columnNames.length === 2) ? columnNames[1] : columnNames[2];

  	let testObj = {k:[]};
    const polygonCollection = [];
    const alreadyRenderedPolygons = [];

    for (let l = 0; l < alldata.length; l++) {

    	testObj.k = allpolygons.length;
    	const indexTest = alldata[l]['index'];

    	for (let i = 0; i < alldata[l].values.length; i++) {
    		testObj = this._matchValues(testObj, alldata[l]['values'][i], keyColumn, allpolygons, mapSchema, indexTest);

	    	if (testObj.found) {

	    		const valueSet = testObj.thisvalue[0];
	    		alreadyRenderedPolygons.push(testObj.i);
		  		const styles = {
		  							stroke:chartProps.stylings.stroke,
		  							fill:currSettings[valueSet.index].d3scale(valueSet[valueColumn])
		  						 };

		      // at the center labels if required
		      if (showLabels) {
		        const attributes = {x:null, y:null, text:''};
		        testObj.type = "Feature";

		        if (projection(centroid(testObj).geometry.coordinates)) {
		        	const centers = projection(centroid(testObj).geometry.coordinates);

		          const adjustStateLabels = adjustLabels(-4,-4,valueSet[keyColumn]);
		          attributes.x = centers[0] + adjustStateLabels[1];
		          attributes.y = centers[1] + adjustStateLabels[0] + 6;
		          attributes.text = adjustStateLabels[2];
		        }

		        polygonCollection.push(
		          <g key= {`polygon_with_${testObj.i}`}>
		            <path
		              id= {`polygon_${testObj.i}`}
		              d= {geoPath(testObj.geometry)}
		              className={this.props.polygonClass}
		              style={styles}
		            />
		            <text
		              x={attributes.x}
		              y={attributes.y}
		              className={'state-labels-show'}
		            >{attributes.text}</text>
		          </g>
		        );
		      }
		      else {
		        polygonCollection.push(
		          <path
		            id={`polygon_${testObj.i}`}
		            key={`polygon_${testObj.i}`}
		            d= {geoPath(testObj.geometry)}
		            className={this.props.polygonClass}
		            style={styles}
		          />
		        );
		      }
		    }
		  }
    };

    //console.log(JSON.stringify(alreadyRenderedPolygons), 'hm');
    allpolygons.map((polygonData,i) => {

    	// return if already found
    	if (alreadyRenderedPolygons.indexOf(i) > -1) return null;
    	// otherwise just show the defalt path
  		const styles = {};
  		styles.stroke = chartProps.stylings.stroke;
      styles.fill = '#ddd';
      polygonCollection.push(
        <path
          id={`polygon_${i}`}
          key={`polygon_${i}`}
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
      	 clipPath="url(#ellipse-clip)">
      	{polygonCollection}
      </g>
    );
  }
});

module.exports = PolygonsRender
