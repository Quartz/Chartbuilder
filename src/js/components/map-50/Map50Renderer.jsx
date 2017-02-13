import React from 'react';
import d3 from 'd3';
import {filter, reduce, difference, concat} from 'lodash';
import {centroid} from 'turf';

// Flux actions
const MapViewActions = require("../../actions/VisualViewActions");

const PolygonsRender = React.createClass({

  propTypes: {
    geoPath: React.PropTypes.func,
    polygonClass: React.PropTypes.string,
    chartProps: React.PropTypes.object.isRequired
  },
  _updateStyles: function(nextProps) {

  	const chartProps = nextProps.chartProps;
    const mapSchema = nextProps.schema;
    const currSettings = chartProps.scale;

    const alldata = chartProps.data;
    const allpolygons = this.props.data;
    const columnNames = chartProps.columns;

  	const keyColumn = columnNames[0];
  	const valueColumn = (columnNames.length === 2) ? columnNames[1] : columnNames[2];

    const svg = d3.select('.polygon-group');

    // tk
    let testObj = {k:[]};
    for (let l = 0; l < alldata.length; l++) {
    	testObj.k[l] = allpolygons.length;
    }

    /*nextProps.data.forEach((polygonData, i) => {
    	//
    	testObj = this._matchValues(testObj, polygonData, keyColumn, valueColumn, alldata, allpolygons, mapSchema);

      svg.select('#polygon_' + i)
      .style('fill', testObj.thisvalue.length ? currSettings[testObj.thisvalue[0].index].d3scale(testObj.thisvalue[0][valueColumn]) : '#ddd')
      .style('stroke',chartProps.stylings.stroke);
    });*/
  },
  shouldComponentUpdate: function(nextProps) {
  	/* only update if the schema type changes.
  	otherwise just update the styles. */
  	if (this.props.schema.name !== nextProps.schema.name
  		 || this.props.chartProps.stylings.showStateLabels !== nextProps.chartProps.stylings.showStateLabels) {
  		return true;
  	} else {
  		this._updateStyles(nextProps);
  		return false;
  	}
  	return false;
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
  		console.log(mapSchema.test(d[keyColumn], polygonData[j]));
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

    while (lo <= hi) {
        mid = ((lo + hi) >> 1);
        element = polygondata[mid].id;
        console.log(mid,'mid search');
        if (element < key) {
            lo = mid + 1;
            //
        } else if (element > key) {
            hi = mid - 1;
            //
        } else {
        	testObj.k = mid;
	    		testObj.i = mid;
	    		testObj.found = true;
	    		testObj.geometry = polygondata[mid].geometry;
	    		testObj.thisvalue = [Object.assign({'index':index},d)];
        	return testObj;
        }
    }
    return testObj;
  },
  _matchValues: function(testObj={}, testData, keyColumn, allpolygons, mapSchema, index) {
  	//testObj = this._matchValues(testObj, alldata[l][i], keyColumn, allpolygons, mapSchema);;
    testObj.thisvalue = [];
    testObj.found = false;

    //const d = alldata;

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
	  	const start = (testObj.k - 3 < 0) ? 0 : testObj.k - 3;
	  	const stop = (testObj.k + 3 > allpolygons.length) ? allpolygons.length : testObj.k + 3;

	  	testObj = this._bruteSearchForValue(start,stop,mapSchema,testData,keyColumn,allpolygons,testObj,index);

	  	// if still not found, perform binary search
    	if (!testObj.found) {

    		testObj = this._binarySearch(allpolygons, mapSchema.matchLogic(testData[keyColumn]), testObj, testData, index, keyColumn);
    		return testObj;

    		/*let m = Math.floor(d.values.length / 2);
    		let n = Math.floor(d.values.length / 4);
    		let o = Math.floor(d.values.length / 8);*/

    		// binary search algorithm if no initial match
    		/*if (polygonData.id <= mapSchema.matchLogic(d.values[m][keyColumn])) {
    			if (polygonData.id < mapSchema.matchLogic(d.values[n][keyColumn])) {
    				if (polygonData.id < mapSchema.matchLogic(d.values[o][keyColumn])) {
      				testObj = this._searchForValue(0,o + 1,mapSchema,d,keyColumn,polygonData,l,testObj);
      			} else {
      				testObj = this._searchForValue(o,n + 1,mapSchema,d,keyColumn,polygonData,l,testObj);
      			}
    			} else {
    				if (polygonData.id < mapSchema.matchLogic(d.values[n + o][keyColumn])) {
      				testObj = this._searchForValue(n,n + o + 1,mapSchema,d,keyColumn,polygonData,l,testObj);
      			} else {
      				testObj = this._searchForValue(n + o,m + 1,mapSchema,d,keyColumn,polygonData,l,testObj);
      			}
    			}

    		} else {
    			if (polygonData.id < mapSchema.matchLogic(d.values[m + n][keyColumn])) {
    				if (polygonData.id < mapSchema.matchLogic(d.values[m + o][keyColumn])) {
      				testObj = this._searchForValue(m,m + o + 1,mapSchema,d,keyColumn,polygonData,l,testObj);
      			} else {
      				testObj = this._searchForValue(m + o,m + n + 1,mapSchema,d,keyColumn,polygonData,l,testObj);
      			}
    			} else {
    				if (polygonData.id < mapSchema.matchLogic(d.values[m + n + o][keyColumn])) {
      				testObj = this._searchForValue(m + n,m + o + n + 1,mapSchema,d,keyColumn,polygonData,l,testObj);
      			} else {
      				testObj = this._searchForValue(m + n + o,d.values.length,mapSchema,d,keyColumn,polygonData,l,testObj);
      			}
    			}
    		}*/
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

    	for (let i = 0; i < alldata[l].values.length; i++) {
  		// search in the dataset for a match against this polygon.
  		//console.log(alldata[l], 'hm');
    	testObj = this._matchValues(testObj, alldata[l]['values'][i], keyColumn, allpolygons, mapSchema, alldata[l]['index']);

	    	if (testObj.found) {

	    		//console.log(JSON.stringify(testObj), 'test');
	    		const valueSet = testObj.thisvalue[0];
	    		alreadyRenderedPolygons.push(testObj.i);
		  		const styles = {
		  							stroke:chartProps.stylings.stroke,
		  							fill:currSettings[valueSet.index].d3scale(valueSet[valueColumn])
		  						 };

		      // at the center labels if required
		      if (showLabels) {
		        const attributes = {x:null, y:null, text:''};
		        if (projection(centroid(testObj).geometry.coordinates)) {
		          const adjustStateLabels = adjustLabels(null,null,valueSet[keyColumn]);
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
