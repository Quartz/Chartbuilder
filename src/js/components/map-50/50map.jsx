import React from 'react';
import update from 'react-addons-update';
// Map

import d3 from 'd3';
const topojson = require('topojson');
import PolygonCollection from './Map50Renderer.jsx';

const projectionFunc = require('react-d3-map-core').projection;
const geoPath = require('react-d3-map-core').geoPath;

import ChartRendererMixin from "../mixins/MapRendererMixin.js";

const polygonClass = 'polygon-test';

const MapRenderer = React.createClass({

  propTypes: {
    chartProps: React.PropTypes.object.isRequired,
    stylings: React.PropTypes.object.isRequired
  },

  render: function() {
    const chartProps = this.props.chartProps;
    const stylings = this.props.stylings;

    const schema = chartProps.schema.schema;
    const featname = schema.feature;
    console.log(topojson,'topo')
    const data = topojson.feature(schema.topojson, 
                  schema.topojson.objects[featname]);

    const projObj = {
      projection: schema.proj,
      scale: schema.scale,
      translate: schema.translate,
      precision: schema.precision
    }

    const proj = projectionFunc(projObj);
    const geo = geoPath(proj);

    const projection = d3.geo[schema.proj]()
      .scale(proj.scale)
      .translate(proj.translate);

    return (
          <PolygonCollection
            chartProps= {chartProps}
            data= {data.features}
            geoPath= {geo}
            schema={schema}
            proj={proj}
            stylings={stylings}
            translate={this.props.translate}
            polygonClass={polygonClass}
          />
    );
  }
});

module.exports = MapRenderer;
