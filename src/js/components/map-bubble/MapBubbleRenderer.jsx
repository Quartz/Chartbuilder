import React from 'react';
const Polygon = require('react-d3-map-core').Polygon; // https://github.com/react-d3/react-d3-map-core/blob/master/src/polygon.jsx
import {centroid} from 'turf';

import d3 from 'd3';
const RenderHelper = require("../../util/map-render-helpers");

// Flux actions
const MapViewActions = require("../../actions/VisualViewActions");

class ShapesCollection extends React.Component {

  _returnRadius (props, dataDomain) {
  	const radiusComputed = RenderHelper.radius_size(props);

  	return d3.scale.sqrt().range([0, radiusComputed])
                  .domain(dataDomain);
  }
  _updateStyles (nextProps) {

  	const chartProps = nextProps.chartProps;
    const mapSchema = nextProps.schema;
    const currSettings = chartProps.scale;

    const lastdata = this.props.chartProps.data;
    const alldata = chartProps.data;

    const allpolygons = this.props.data;
    const columnNames = chartProps.columns;

  	const keyColumn = columnNames[0];
  	const valueColumn = (columnNames.length === 2) ? columnNames[1] : columnNames[2];

    const translation = RenderHelper.get_translation(chartProps, nextProps);

    const svg = d3.select('.polygon-group' + '.' + nextProps.isSmall);

    const dataDomain = currSettings.domain;
    const radius = this._returnRadius(nextProps, dataDomain);

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
  }
  shouldComponentUpdate (nextProps) {
  	const props = this.props;
  	/* only update if the schema type changes or the dataset length or groupings change
  	otherwise just update the styles. */
  	if (props.schema.name !== nextProps.schema.name
  		 || props.chartProps.data.length !== nextProps.chartProps.data.length
  		 || RenderHelper.test_data_change(props.chartProps.data, nextProps.chartProps.data)) {
  		return true;
  	} else if (props.stylings.stroke !== nextProps.stylings.stroke) {
  		RenderHelper.update_stroke(nextProps);
  		return false;
  	} else {
  		this._updateStyles(nextProps);
  		return false;
  	}
  }
  _matchValues (testObj={}, testData, keyColumn, allpolygons, mapSchema, index) {

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
	  	testObj = RenderHelper.brute_search(start,stop,mapSchema,testData,keyColumn,allpolygons,testObj,index);

	  	// if still not found, use binary search
    	if (!testObj.found) {
    		return testObj = (mapSchema.name === 'countiesUS') ?
    			RenderHelper.binary_search_numeric(allpolygons, mapSchema.matchLogic(testData[keyColumn]), testObj, testData, index, keyColumn) :
    			RenderHelper.binary_search(allpolygons, mapSchema.matchLogic(testData[keyColumn]), testObj, testData, index, keyColumn);
    	}
    };
    return testObj;
  }
  _renderCircles (testObj, chartProps, currSettings, projection, geoPath, radius, valueColumn) {

  	if (!testObj.thisvalue.length) return (null);

  	const valueSet = testObj.thisvalue[0];
		const styles = {
							fillOpacity: 0.15,
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
      />
    );
  }
  _renderPolygons (testObj, chartProps, currSettings, projection, geoPath) {

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
  }
  render () {

  	const props = this.props;

  	const chartProps = props.chartProps;
    const mapSchema = props.schema;
    const geoPath = props.geoPath;
    const projection = props.proj;
    const currSettings = chartProps.scale;

    const alldata = chartProps.data;
    const allpolygons = props.data;
    const columnNames = chartProps.columns;

    // lower the map for the single legend;
    const translation = RenderHelper.get_translation(chartProps, props);

    // define extra variables for the needed update
  	const keyColumn = columnNames[0];
  	const valueColumn = (columnNames.length === 2) ? columnNames[1] : columnNames[2];

  	let testObj = {k:[]};
    const polygonCollection = [];
    const circleReturn = [];
    const alreadyRenderedPolygons = [];

    const dataDomain = currSettings.domain;
    const radius = this._returnRadius(props, dataDomain);

    for (let l = 0; l < alldata.length; l++) {
    	testObj.k = allpolygons.length;
    	const indexTest = alldata[l]['index'];

    	for (let i = 0; i < alldata[l].values.length; i++) {

    		testObj = this._matchValues(testObj, alldata[l]['values'][i], keyColumn, allpolygons, mapSchema, indexTest);

    		//if (!testObj.found) console.log(alldata[l]['values'][i]);
	    	if (testObj.found) {
	    		//
					alreadyRenderedPolygons.push(testObj.i);
					//
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
          className={props.polygonClass}
          style={styles}
        />
    	);
    });

    return (
      <g transform={translation}
      	 className={"polygon-group " +  props.isSmall}
      	 clipPath="url(#clip)">
      	 	{polygonCollection}{circleReturn}
      </g>
    );
  }
};

 ShapesCollection.propTypes = {
  geoPath: React.PropTypes.func,
  polygonClass: React.PropTypes.string,
  onClick: React.PropTypes.func,
  chartProps: React.PropTypes.object.isRequired
};

module.exports = ShapesCollection
