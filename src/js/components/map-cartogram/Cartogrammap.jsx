import React, {Component, PropTypes} from 'react';
import {flatten, each, clone, map} from 'lodash';
import {centroid} from 'turf';

import d3 from 'd3';
// Map
const topojson = require('topojson');
import update from 'react-addons-update';

const CartogramCollection = require('./MapCartogramRenderer.jsx');
const ChartRendererMixin = require("../mixins/MapRendererMixin");

const radius = d3.scale.sqrt();
const cartogramClass = 'cartogram-Polygons';
const convertFipstoPostal = require('us-abbreviations')('fips','postal');

class MapRenderer extends React.Component{

  constructCentroids(props) {

    const centroidsConst = [];

    const schema = props.chartProps.schema.schema;
    const cartogramType = schema.name;

    const data = topojson.feature(schema.topojson, schema.topojson.objects[schema.feature]);

  	data.features.map((polygonData, i) => {

      const center = centroid(polygonData);
      const id = polygonData.id < 10 ? '0' + polygonData.id.toString() : polygonData.id;

      centroidsConst.push({"type":"Feature","id":id,
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

    const grid = this.constructGrid(schema.name);
    const centroids = this.constructCentroids(this.props);

    const metadata = this.props.metadata;

		const displayConfig = this.props.displayConfig;

    const columnNames = chartProps.columns;
    const keyColumn = columnNames[0];
    const valueColumn = columnNames.length === 2 ? columnNames[1] : columnNames[2];
    const cellSize = stylings.gridcellSize;

    const projection = d3.geo[schema.proj]()
      .translate((stylings[schemaName] === 'grid') ? schema.translate : schema.translateCartogram)
      .scale(schema.scale);

    const scales = {};
    const dataById = d3.map(chartProps.alldata, function(d) { return schema.matchLogic(d[keyColumn]); });

    // for dorling and demers calculations
    radius
    	.range([0, (stylings[schemaName] === 'dorling') ? +stylings.dorlingradiusVal : +stylings.demerssquareWidth])
    	.domain([0, d3.max(chartProps.alldata, function(d){ return +d[valueColumn]} )]);

    const showDC = (!stylings.showDC) ? false : true;

    const nodes = centroids.filter(function(d) {

      if (schema.name === 'states50') {
      	//dc id = 11
        if (showDC) {
        	return (dataById.has(schema.matchLogic(d.id)) && schema.test(d.id, d.id));
        } else {
        	return (dataById.has(schema.matchLogic(d.id)) && schema.test(d.id, d.id) && d.id != 11);
        }
       } else return (dataById.has(schema.matchLogic(d.id)) && schema.test(d.id, d.id));
      })
      .map((d) => {

        const shp = d.id;
        const shpData = dataById.get(schema.matchLogic(shp));
        const point = projection(d.geometry.coordinates);

        let fillVal;
        if (chartProps.chartSettings[shpData.index].scale.domain[0] ===
            chartProps.chartSettings[shpData.index].scale.domain[1]) {
          fillVal = colorScales(chartProps.scale[shpData.index].colorIndex)[1];
        }
        else fillVal = chartProps.scale[shpData.index].d3scale(shpData[valueColumn]);

        const cell = grid[shpData[keyColumn].replace(/\s/g, '')];

        let cell0 = 0;
        let cell1 = 0;

        if (cell) {
        	cell0 = 17 + (cell[0] * cellSize);
        	cell1 = cell[1] * cellSize - (cellSize / 2)
        }

      return {
        id: +d.id,
        x: point[0], y: point[1],
        x0: point[0], y0: point[1],
        xx: cell0,
        yy: cell1,
        r: radius(shpData[valueColumn]),
        r0: radius(shpData[valueColumn]),
        value: shpData[valueColumn],
        shp: shpData[keyColumn],
        color: fillVal
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
            metadata={metadata}
          />
    );
  }
};

MapRenderer.propTypes = {
  chartProps: React.PropTypes.object.isRequired
}

module.exports = MapRenderer;
