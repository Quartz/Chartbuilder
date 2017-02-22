import React, {Component, PropTypes} from 'react';
import {flatten, each, clone, map} from 'lodash';
import {centroid} from 'turf';

import d3 from 'd3';
// Map
const topojson = require('topojson');
const projectionFunc = require('react-d3-map-core').projection;
const geoPath = require('react-d3-map-core').geoPath;

import update from 'react-addons-update';

const CartogramCollection = require('./MapCartogramRenderer.jsx');
const ChartRendererMixin = require("../mixins/MapRendererMixin");

const radius = d3.scale.sqrt();
const cartogramClass = 'cartogram-Polygons';
const convertFipstoPostal = require('us-abbreviations')('fips','postal');
const colorScales = require('./../../util/colorscales').scalesMap;

class MapRenderer extends React.Component{

  constructCentroids(props, projection) {

    const centroidsConst = [];

    const schema = props.chartProps.schema.schema;
    const cartogramType = schema.name;

    const data = topojson.feature(schema.topojson, schema.topojson.objects[schema.feature]);

  	data.features.map((polygonData, i) => {

      const center = centroid(polygonData);
      const id = polygonData.id < 10 ? '0' + polygonData.id.toString() : polygonData.id;

      centroidsConst.push({"type":"Feature","id":polygonData,
          "geometry":{"type":"Point","coordinates": center.geometry.coordinates},
          "properties":{"name":id} });
    });

  	return centroidsConst;
  }
 	constructGrid(cartogramType) {

	  const grid = {};

 		if (cartogramType === 'states50') {

	    d3.select("#grid." + cartogramType)
	    .text().split("\n")
	    .forEach(function(line, i) {
	      let re = /\w+/g, m;
	      while (m = re.exec(line)) {
	        grid[m[0]] = [m.index / 3, i]
	      }
	    });
  	}

  	return grid;
  }
  render() {

    const chartProps = this.props.chartProps;
    const stylings = chartProps.stylings;

    const schema = chartProps.schema.schema;
    const schemaName = (schema.name === 'states50') ? 'type' : 'typeOther';
    const cartogramType = stylings[schemaName];
    const grid = this.constructGrid(schema.name);

    const metadata = this.props.metadata;
		const displayConfig = this.props.displayConfig;

    const columnNames = chartProps.columns;
    const keyColumn = columnNames[0];
    const valueColumn = columnNames.length === 2 ? columnNames[1] : columnNames[2];

    const cellSize = stylings.gridcellSize;
    const dataDomain = chartProps.scale.domain;
    const showDC = (!stylings.showDC) ? false : true;
    const cartoTranslate = (cartogramType === 'grid') ? schema.translate : schema.translateCartogram;

    let projection = d3.geo[schema.proj]()
      .translate(cartoTranslate)
      .scale(schema.scale);

    if (schema.parallels) projojection.parallels = schema.parallels;
    if (schema.rotate) projection.rotate = schema.rotate;

    const centroids = this.constructCentroids(this.props, projection);
    const dataById = d3.map(chartProps.alldata, function(d) {
    	return schema.matchLogic(d[keyColumn]); });

    const radiusVal = (cartogramType === 'dorling') ? +stylings.dorlingradiusVal : +stylings.demerssquareWidth;

    // for dorling and demers calculations
    radius
    	.range([0, radiusVal])
    	.domain(dataDomain);

    const polygonCollection = [];

    let projObj = {
      projection: schema.proj,
      scale: schema.scale,
      translate: cartoTranslate,
      precision: schema.precision
    }

    if (schema.parallels) projObj.parallels = schema.parallels;
    if (schema.rotate) projObj.rotate = schema.rotate;

    const proj = projectionFunc(projObj);
    const geo = geoPath(proj);

    if (cartogramType !== 'grid') {

    		topojson.feature(schema.topojson, schema.topojson.objects[schema.feature]).features
    			.map((polygonData,i) => {

	    	const styles = {};
	  		styles.stroke = '#E3E3E3';
	      styles.fill = '#F6F6F6';

	  		polygonCollection.push(
	        <path
	          key={`polygon_${i}_${polygonData.id}`}
	          d= {geo(polygonData.geometry)}
	          className={'polygon-render'}
	          style={styles}
	        />
	    	);
	    });
	  }

    const nodes = centroids.filter(function(d) {

      if (schema.name === 'states50') {
      	//dc id = 11
        if (showDC) {
        	return (dataById.has(schema.matchLogic(d.id.id)));// && schema.test(d.id, d.id));
        } else {
        	return (dataById.has(schema.matchLogic(d.id.id)) && d.id.id != 11);
        }
       } else {
       	return (dataById.has(schema.matchLogic(d.id.id)));
       }
      })
      .map((d) => {
        const shpData = dataById.get(schema.matchLogic(d.id.id));
        const point = projection(d.geometry.coordinates);
        const cell = grid[shpData[keyColumn].replace(/\s/g, '')];

        let cell0 = 0;
        let cell1 = 0;

        if (cell) {
        	cell0 = 17 + (cell[0] * cellSize);
        	cell1 = cell[1] * cellSize - (cellSize / 2)
        }

	      return {
	        id: d.id.id,
	        x: point[0], y: point[1],
	        x0: point[0], y0: point[1],
	        xx: cell0,
	        yy: cell1,
	        r: radius(shpData[valueColumn]),
	        r0: radius(shpData[valueColumn]),
	        value: shpData[valueColumn],
	        shp: shpData[keyColumn],
	        color: chartProps.scale[shpData.index].color
	      };
    	});

    return (
          <CartogramCollection
            chartProps= {chartProps}
            stylings={stylings}
            displayConfig={displayConfig}
            polygonClass={cartogramClass}
            nodes={nodes}
            schemaName={schemaName}
            radiusVal={radiusVal}
            metadata={metadata}
            cartogramType={cartogramType}
            polygonCollection={polygonCollection}
          />
    );
  }
};

MapRenderer.propTypes = {
  chartProps: React.PropTypes.object.isRequired
}

module.exports = MapRenderer;
