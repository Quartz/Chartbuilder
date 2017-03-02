import React, {Component, PropTypes} from 'react';
import {flatten, each, clone, map} from 'lodash';

const centroid = require('turf-centroid');
const d3 = require('d3');
// Map
const topojson = require('topojson');
const projectionFunc = require('react-d3-map-core').projection;
const geoPath = require('react-d3-map-core').geoPath;

import update from 'react-addons-update';

const CartogramCollection = require('./MapCartogramRenderer.jsx');
const ChartRendererMixin = require("../mixins/MapRendererMixin");

const radius = d3.scale.sqrt();
const cartogramClass = 'cartogram-Polygons';
const colorScales = require('./../../util/colorscales').scalesMap;

const SvgWrapper = require("../svg/SvgWrapper.jsx");

const ClippingPath = require("../../components/shared/ClippingPath.jsx");
const LegendSpace = require("../../components/svg/MapLegendSpace.jsx");
const cartoDimensions = require("../../charts/maps/mb-cartogram/mb-cartogram-dimensions.js");
const RenderHelper = require("../../util/map-render-helpers");

class MapRenderer extends React.Component{

  constructCentroids (props, projection) {

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
 	constructGrid (cartogramType) {

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
  constructUnderlyingMap (schema, updatedTranslate, updatedScale, cartogramType) {

  	const polygonCollection = [];

  	const projObj = RenderHelper.get_projection(schema, updatedScale, updatedTranslate);
    const geo = geoPath(projectionFunc(projObj));

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
	  return polygonCollection;
  }
  render() {
  	//
  	const props = this.props;
    const chartProps = props.chartProps;
    const stylings = chartProps.stylings;

    const schema = chartProps.schema.schema;
    const schemaName = (schema.name === 'states50') ? 'type' : 'typeOther';
    const cartogramType = stylings[schemaName];
    const grid = this.constructGrid(schema.name);

    const metadata = props.metadata;
		const displayConfig = props.displayConfig;

		const styleConfig = props.styleConfig;
		const margin = displayConfig.margin;

    // set the dimensions of inner and outer. much of this will be unnecessary
		// if we draw stuff in HTML
		const base_dimensions = cartoDimensions(props.width, {
			displayConfig: displayConfig,
			enableResponsive: props.enableResponsive,
			metadata: props.metadata
		});

		// Dimensions of the chart area
		const chartAreaDimensions = {
			width: (
				base_dimensions.width - margin.left - margin.right -
				displayConfig.padding.left - displayConfig.padding.right
			),
			height: (
				base_dimensions.height - margin.top - margin.bottom -
				displayConfig.padding.top - displayConfig.padding.bottom
			)
		};
		// height needed to account for legends
		const extraHeight = 0; //(chartAreaDimensions.height * 1);

		// dimensions of entire canvas, base + label height
		const outerDimensions = {
			width: base_dimensions.width,
			height: base_dimensions.height + extraHeight
		};

		const translate = {
			top: margin.top,
			left: margin.left,
			right: margin.right,
			keyXOffset: margin.keyXOffset,
			legendleft:margin.legendleft,
			legendsOneRow: margin.legendsOneRow,
			legendsTwoRow: margin.legendsTwoRow
		};

		if (metadata.subtitle) {
			translate.legendsOneRow += margin.subtitle;
			translate.legendsTwoRow += margin.subtitle;
		}

    const legendsArray = Object.keys(chartProps.legend).map((k) => chartProps.legend[k]);

    const columnNames = chartProps.columns;
    const keyColumn = columnNames[0];
    const valueColumn = columnNames.length === 2 ? columnNames[1] : columnNames[2];

    const cellSize = (props.isSmall) ? stylings.gridcellSize / 1.75 : stylings.gridcellSize;
    const dataDomain = chartProps.scale.domain;
    const showDC = (!stylings.showDC) ? false : true;
    const cartoTranslate = (cartogramType === 'grid') ? schema.translate : schema.translateCartogram;

  	const updatedTranslate = [cartoTranslate[0] * (props.width / 640), cartoTranslate[1]  * (props.width / 640)];
    const updatedScale = schema.scale * (props.width / 700);

    let projection = d3.geo[schema.proj]()
      .translate(updatedTranslate)
      .scale(updatedScale);

    if (schema.parallels) projojection.parallels = schema.parallels;
    if (schema.rotate) projection.rotate = schema.rotate;

    const dataById = d3.map(chartProps.alldata, function(d) { return schema.matchLogic(d[keyColumn]); });

    let radiusVal = (cartogramType === 'dorling') ? +stylings.dorlingradiusVal : +stylings.demerssquareWidth;
    radiusVal = (props.isSmall) ? radiusVal / 2 : radiusVal;

    // for dorling and demers calculations
    radius
    	.range([0, radiusVal])
    	.domain(dataDomain);

    const polygonCollection = this.constructUnderlyingMap(schema, updatedTranslate, updatedScale, cartogramType);
    const centroids = this.constructCentroids(props, projection);

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
        	cell0 = margin.gridMarginLeft + (cell[0] * cellSize);
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
			<SvgWrapper
				outerDimensions={outerDimensions}
				metadata={props.metadata}
				displayConfig={displayConfig}
	      isSmall={props.isSmall}
				isMap={true}
	      chartProps= {chartProps}
			>
				<ClippingPath
					chartAreaDimensions={chartAreaDimensions}
					metadata={props.metadata}
					displayConfig={displayConfig}
				/>
        <CartogramCollection
          chartProps= {chartProps}
          stylings={stylings}
          displayConfig={displayConfig}
          polygonClass={cartogramClass}
          nodes={nodes}
        	isSmall={props.isSmall}
          schemaType={schema.name}
          schemaName={schemaName}
          radiusVal={radiusVal}
          metadata={metadata}
          cartogramType={cartogramType}
          polygonCollection={polygonCollection}
        />
	      <LegendSpace
					key="legend"
					translate={translate}
					className="svg-legend-space"
					chartProps={chartProps}
					stylings={stylings}
					isSmall={props.isSmall}
					metadata={props.metadata}
					legendsArray={legendsArray}
					dimensions={outerDimensions}
					displayConfig={displayConfig}
					chartWidth={outerDimensions.width - margin.left - margin.right}
				/>
	    </SvgWrapper>
    );
  }
};

MapRenderer.propTypes = {
  chartProps: React.PropTypes.object.isRequired
}

module.exports = MapRenderer;
