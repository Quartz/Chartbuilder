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
  _searchForValue: function(start,stop,mapSchema,d,keyColumn,polygonData,l,testObj) {
  	for (let j = start; j<stop; j++) {
  		if (mapSchema.test(d.values[j][keyColumn], polygonData)) {

    		testObj.k[l] = j;
    		testObj.found = true;
    		testObj.thisvalue = [Object.assign({'index':d.index},d.values[j])];
    		break;
  		}
  	}
  	return testObj;
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

    nextProps.data.forEach((polygonData, i) => {
    	//
    	testObj = this._matchValues(testObj, polygonData, keyColumn, valueColumn, alldata, allpolygons, mapSchema);

      svg.select('#polygon_' + i)
      .style('fill', testObj.thisvalue.length ? currSettings[testObj.thisvalue[0].index].d3scale(testObj.thisvalue[0][valueColumn]) : '#ddd')
      .style('stroke',chartProps.stylings.stroke);
    });
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
  _binarySearch: function(ar, el, compare_fn) {

  },
  _matchValues: function(testObj={}, testData, keyColumn, valueColumn, alldata, allpolygons, mapSchema) {

    testObj.thisvalue = [];
    testObj.found = false;

    let d = alldata;
  	// loop through
  	// return if nothing to look for
  	// skip alorithmically searching if first value if only one value
  	if (d.values.length === 0) break;
		if (d.values.length === 1) {
			if (mapSchema.test(d.values[0][keyColumn], polygonData)) {
    		testObj.thisvalue = [Object.assign({'index':d.index},d.values[0])];
    		testObj.found = true;
    		break;
    	}
		}

    for (let l = 0; l < allpolygons.length; l++) {
    	// stop looping if value already discovered in a previous group
    	if (testObj.found) break;



    	const start = (testObj.k[l] - 3 < 0) ? 0 : testObj.k[l] - 3;
    	const stop = (testObj.k[l] + 3 > allpolygons.length) ? allpolygons.length : testObj.k[l] + 3;



			//console.log(testObj.k[l], 'test');

    	testObj = this._searchForValue(start,stop,mapSchema,d,keyColumn,polygonData,l,testObj);

    	/*if (!testObj.found) {

    		let m = Math.floor(d.values.length / 2);
    		let n = Math.floor(d.values.length / 4);
    		let o = Math.floor(d.values.length / 8);

    		// binary search algorithm if no initial match
    		if (polygonData.id <= mapSchema.matchLogic(d.values[m][keyColumn])) {
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

    		if (!testObj.found) {
    			//fail safe...
    		}
    //	}
    //};
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

    for (let l = 0; l < alldata.length; l++) {

    	testObj.k[l] = allpolygons.length;

  		// search in the dataset for a match against this polygon.
    	testObj = this._matchValues(testObj, alldata[l][i], keyColumn, valueColumn, alldata[l], allpolygons, mapSchema);

    	if (testObj.found) {
	  		const styles = {};
	  		styles.stroke = chartProps.stylings.stroke;

	    	if (testObj.thisvalue.length) {
	      	styles.fill = currSettings[testObj.thisvalue[0].index].d3scale(testObj.thisvalue[0][valueColumn]);
	      } else {
	      	styles.fill = '#ddd';
	      }

	      // at the center labels if required
	      if (showLabels) {
	        const attributes = {x:null, y:null, text:''};
	        if (projection(centroid(polygonData).geometry.coordinates)) {
	          const adjustStateLabels = adjustLabels(null,null,testObj.thisvalue[0][keyColumn]);
	          attributes.x = centers[0] + adjustStateLabels[1];
	          attributes.y = centers[1] + adjustStateLabels[0] + 6;
	          attributes.text = adjustStateLabels[2];
	        }

	        polygonCollection.push(
	          <g key= {`polygon_with_${i}`}>
	            <path
	              id= {`polygon_${i}`}
	              d= {geoPath(polygonData.geometry)}
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
	            id={`polygon_${i}`}
	            key={`polygon_${i}`}
	            d= {geoPath(polygonData.geometry)}
	            className={this.props.polygonClass}
	            style={styles}
	          />
	        );
	      }
	    }
    };


    allpolygons.map((polygonData, i) => {

    	// return if already found
    	//if () return
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
      }
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
