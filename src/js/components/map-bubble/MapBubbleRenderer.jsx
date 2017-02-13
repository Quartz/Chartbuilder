import React from 'react';
const Polygon = require('react-d3-map-core').Polygon; // https://github.com/react-d3/react-d3-map-core/blob/master/src/polygon.jsx
const convertPostaltoFIPS = require('us-abbreviations')('postal','fips');
import {centroid} from 'turf';

import d3 from 'd3';
import {filter, toNumber, assign} from 'lodash';

// Flux actions
const MapViewActions = require("../../actions/VisualViewActions");

const PolygonCollection = React.createClass({

  propTypes: {
    geoPath: React.PropTypes.func,
    polygonClass: React.PropTypes.string,
    onClick: React.PropTypes.func,
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
  render: function() {

    const mapSchema = this.props.schema;
    const chartProps = this.props.chartProps;

    const geoPath = this.props.geoPath;
    const polygonClass = this.props.polygonClass;

    let topTranslation = this.props.displayConfig.margin.maptop;

    if (this.props.metadata.subtitle) {
    	if (this.props.metadata.subtitle.length > 0) {
    		topTranslation += 20;
    	}
    }

    const translation = `translate(0,${topTranslation})`;
    const currSettings = chartProps.scale;

    const alldata = chartProps.data;

    const showLabels = this.props.stylings.showStateLabels;
    const mapStroke = this.props.stylings.stroke;

    const adjustLabels = mapSchema.adjustLabels;

    const columnNames = chartProps.columns;
    const keyColumn = columnNames[0];
    const valueColumn = columnNames.length === 2 ? columnNames[1] : columnNames[2];

    const circleReturn = [];

    const projection = this.props.proj;

    if (this.props.onClick) onClick = this.props.onClick;

    let testObj = {k: []};
    for (let l = 0; l < alldata.length; l++ ) {
    	testObj.k.push(alldata[l].values.length);
    }

    const polygonCollection = this.props.data.map((polygonData, i) => {

      let polygonType = (polygonData.type) ? polygonData.type+'_' : '';

      testObj.thisvalue = [];

      for (let l = 0; l < alldata.length; l++ ) {
      	let d = alldata[l];
      	//let toTest = testObj.k[l];
        if (!testObj.thisvalue.length) {
        	// return if nothing to look for
        	// skip alorithmically searching if first value if only one value
        	if (d.values.length === 0) break;
					if (d.values.length === 1) {
						if (mapSchema.test(d.values[0][keyColumn], polygonData)) {
	        		testObj.thisvalue = [Object.assign({'index':d.index},d.values[0])];
	        		testObj.k[l] = 1;
	        		testObj.found = true;
	        		break;
	        	}
					}

        	testObj.found = false;
        	let start = (testObj.k[l] - 3 < 0) ? 0 : testObj.k[l] - 3;
        	let stop = (testObj.k[l] + 3 > d.values.length) ? d.values.length : testObj.k[l] + 3;

        	testObj = this._searchForValue(start,stop,mapSchema,d,keyColumn,polygonData,l,testObj);

        	if (!testObj.found) {

        		let m = Math.floor(d.values.length / 2);
        		let n = Math.floor(d.values.length / 4);
        		let o = Math.floor(d.values.length / 8);

        		// divide and conquer algorithm if no initial match
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
        		}
        	}
       	}
       	else break;
      };

      const styles = {fill:'#E9E9E9', stroke: mapStroke};

      const centerPoint = centroid(polygonData).geometry.coordinates;

      const centers = projection(centerPoint);
      const attributes = {};

      if (centers) {
        attributes.x = centers[0];
        attributes.y = centers[1];
      } else {
        attributes.x = null;
        attributes.y = null;
      }

      const radius = d3.scale.sqrt()
                  .range([0, this.props.stylings.radiusVal]);

      let renderRadius = false;

      const styles2 = {};

      if (testObj.thisvalue.length) {
        styles2.stroke = currSettings[testObj.thisvalue[0].index].d3scale(testObj.thisvalue[0][valueColumn]);
        styles2.fill = currSettings[testObj.thisvalue[0].index].d3scale(testObj.thisvalue[0][valueColumn]);
      }
      else {
        styles2.stroke = '#999';
        styles2.fill = '#aaa'
      }

      assign(styles2, {fillOpacity:0.075},{strokeWidth: '0.75px'});

      if (testObj.thisvalue.length) {
        const dataMax = d3.max(this.props.chartProps.alldata, function(d){ return +d[valueColumn]; } );
        radius.domain([0, dataMax]);
        renderRadius = radius(testObj.thisvalue[0][valueColumn]);

        circleReturn.push(
          <circle
            key= {`circle_with_${i}`}
            style={styles2}
            r={renderRadius}
            cx={attributes.x}
            cy={attributes.y}
            className={'state-labels-show'}
          >
          </circle>);
      }
      return (
        <g key= {`polygon_with_${i}`}>
          <path
            id= {`polygon_${polygonType}${i}`}
            d= {geoPath(polygonData.geometry)}
            className={polygonClass}
            style={styles}
          />
        </g>
      )
    });

    return (
      <g transform={translation} clipPath="url(#ellipse-clip)">{polygonCollection}{circleReturn}</g>
    );
  }
});

module.exports = PolygonCollection
