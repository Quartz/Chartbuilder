const React = require('react');
const d3 = require('d3');
import {clone} from 'lodash';
const centroid = require('turf-centroid');

// Flux actions
const MapViewActions = require("../../actions/VisualViewActions");
const RenderHelper = require("../../util/map-render-helpers");
//
class PolygonsRender extends React.Component {

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

    svg.attr('transform', translation);
    // tk
    let testObj = {k:[]};

    for (var l = 0; l < alldata.length; l++) {
    	testObj.k = allpolygons.length;
    	const indexTest = alldata[l]['index'];
		 	const seriesdata = alldata[l].values;

    	for (var i = 0; i < seriesdata.length; i++) {
    		testObj = this._matchValues(testObj, seriesdata[i], keyColumn, allpolygons, mapSchema, indexTest);

	    	if (testObj.found) {
	    		const valueSet = testObj.thisvalue[0];

	    		svg.selectAll('#polygon_' + testObj.i)
			      .style('fill', currSettings[valueSet.index].d3scale(valueSet[valueColumn]))
			      .style('stroke', chartProps.stylings.stroke);
	    	}
	    }
    }
  }
  shouldComponentUpdate (nextProps) {
  	/* only update if the schema type changes or the dataset length or groupings change
  	otherwise just update the styles. */
  	const props = this.props;

  	if (props.schema.name !== nextProps.schema.name
  		 || props.stylings.showStateLabels !== nextProps.stylings.showStateLabels
  		 || props.chartProps.data.length !== nextProps.chartProps.data.length
  		 || RenderHelper.test_data_change(props.chartProps.data, nextProps.chartProps.data)) {
  		return true;
  	} else if (this.props.stylings.stroke !== nextProps.stylings.stroke) {
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
    		// use a special search alg for the counties dataset
    		return testObj = (mapSchema.name === 'countiesUS') ?
    			RenderHelper.binary_search_numeric(allpolygons, mapSchema.matchLogic(testData[keyColumn]), testObj, testData, index, keyColumn) :
    			RenderHelper.binary_search(allpolygons, mapSchema.matchLogic(testData[keyColumn]), testObj, testData, index, keyColumn);
    	}
    };
    return testObj;
  }
  _renderPolygons(testObj, chartProps, currSettings, showLabels, projection, adjustLabels, valueColumn, keyColumn, geoPath) {

		const valueSet = testObj.thisvalue[0];
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

      return (
        <g key={`polygon_with_${testObj.i}_${testObj.id}`}>
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
        </g>);
    } else {
    	return (
        <path
        	data-id={testObj.id}
          id={`polygon_${testObj.i}`}
          key={`polygon_${testObj.i}_${testObj.id}`}
          d= {geoPath(testObj.geometry)}
          className={this.props.polygonClass}
          style={styles}
        />);
    }
  }
  render () {
  	//grab some props for convienience
  	const props = this.props;
  	const chartProps = props.chartProps;
    const mapSchema = props.schema;
    const geoPath = props.geoPath;
    const projection = props.proj;
    const currSettings = chartProps.scale;


    const alldata = chartProps.data;
    const allpolygons = props.data;
    const columnNames = chartProps.columns;

    const showLabels = chartProps.stylings.showStateLabels;
    const adjustLabels = mapSchema.adjustLabels;

    // lower the map for the single legend;
    const translation = RenderHelper.get_translation(chartProps, props);

    // define extra variables for the needed update
  	const keyColumn = columnNames[0];
  	const valueColumn = (columnNames.length === 2) ? columnNames[1] : columnNames[2];

  	let testObj = {k:[]};
  	const testMap = d3.map();
    const polygonCollection = [];
    const alreadyRenderedPolygons = [];
    const alreadyRenderedFips = [];

    for (var l = 0; l < alldata.length; l++) {
    	testObj.k = allpolygons.length;
    	const indexTest = alldata[l]['index'];

    	for (var i = 0; i < alldata[l].values.length; i++) {

    		testObj = this._matchValues(testObj, alldata[l]['values'][i], keyColumn, allpolygons, mapSchema, indexTest);

    		//if (!testObj.found) console.log(alldata[l]['values'][i]);
	    	if (testObj.found) {

					alreadyRenderedPolygons.push(testObj.i);
					alreadyRenderedFips.push(testObj.id);
					testMap.set(testObj.id, clone(testObj));

	    		polygonCollection.push(this._renderPolygons(testObj, chartProps, currSettings, showLabels, projection, adjustLabels, valueColumn, keyColumn, geoPath));
		    }
		  }
    };

    allpolygons.map((polygonData, i) => {
    	// return if already rendered this polygon
    	if (alreadyRenderedPolygons.indexOf(i) > -1) return null;

    	const styles = {};
  		styles.stroke = chartProps.stylings.stroke;
      styles.fill = '#e8e8e8';

    	if (alreadyRenderedFips.indexOf(polygonData.id) > -1) {
    		testObj = testMap.get(polygonData.id);
    		testObj.i = i;
    		testObj.geometry = polygonData.geometry;
    		polygonCollection.push(this._renderPolygons(testObj, chartProps, currSettings, showLabels, projection, adjustLabels, valueColumn, keyColumn, geoPath));
    	} else {
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
    	}
    });

    return (
	      <g transform={translation}
	      	 className={"polygon-group " +  props.isSmall}
	      	 clipPath="url(#clip)">
	      	{polygonCollection}
	      </g>
    );
  }
};

PolygonsRender.propTypes = {
  geoPath: React.PropTypes.func,
  polygonClass: React.PropTypes.string,
  chartProps: React.PropTypes.object.isRequired
};

module.exports = PolygonsRender
