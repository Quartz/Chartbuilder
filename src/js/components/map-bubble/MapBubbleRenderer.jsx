import React from 'react';
const Polygon = require('react-d3-map-core').Polygon; // https://github.com/react-d3/react-d3-map-core/blob/master/src/polygon.jsx
const convertPostaltoFIPS = require('us-abbreviations')('postal','fips');
import {centroid} from 'turf';

import d3 from 'd3';
import {filter, toNumber, assign} from 'lodash';

// Flux actions
const MapViewActions = require("../../actions/ChartViewActions");

const PolygonCollection = React.createClass({

  propTypes: {
    geoPath: React.PropTypes.func,
    polygonClass: React.PropTypes.string,
    onClick: React.PropTypes.func,
    chartProps: React.PropTypes.object.isRequired
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
    console.log(columnNames, 'names');
    const keyColumn = columnNames[0];
    const valueColumn = columnNames.length === 2 ? columnNames[1] : columnNames[2];

    const circleReturn = [];

    const projection = this.props.proj;

    if (this.props.onClick) onClick = this.props.onClick;

    const polygonCollection = this.props.data.map((polygonData, i) => {

      let polygonType = (polygonData.type) ? polygonData.type+'_' : '';

      let thisvalue;

      alldata.forEach(function(d, j) {
        if (thisvalue === undefined || !thisvalue.length) {
          thisvalue = Object.assign(filter(d.values, function(o) { return mapSchema.test(o[keyColumn], polygonData.id); }), {index:d.index});
        }
      });

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

      console.log(thisvalue, 'this value');

      if (thisvalue.length) {
        styles2.stroke = currSettings[thisvalue.index].d3scale(thisvalue[0][valueColumn]);
        styles2.fill = currSettings[thisvalue.index].d3scale(thisvalue[0][valueColumn]);
      }
      else {
        styles2.stroke = '#999';
        styles2.fill = '#aaa'
      }

      assign(styles2, {fillOpacity:0.2},{strokeWidth: '1.25px'});

      if (!thisvalue.length) return (false);
      else {
        const dataMax = d3.max(this.props.chartProps.alldata, function(d){ return +d[valueColumn]; } );
        radius.domain([0, dataMax]);
        renderRadius = radius(thisvalue[0][valueColumn]);
      }

      circleReturn.push(
          <circle
            key= {`circle_with_${i}`}
            style={styles2}
            r={renderRadius}
            cx={attributes.x}
            cy={attributes.y}
            className={'state-labels-show'}
          >
          </circle>)

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
      <g transform={translation}>{polygonCollection}{circleReturn}</g>
    );
  }
});

module.exports = PolygonCollection
