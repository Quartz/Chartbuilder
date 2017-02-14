import React from 'react';
import update from 'react-addons-update';
import d3 from 'd3';
// Map
const topojson = require('topojson');

const PolygonCollection = require('./MapBubbleRenderer.jsx');
const projectionFunc = require('react-d3-map-core').projection;
const geoPath = require('react-d3-map-core').geoPath;

const ChartRendererMixin = require("../mixins/MapRendererMixin.js");

const polygonClass = 'polygon-render';

let MapRenderer = React.createClass({

  propTypes: {
    chartProps: React.PropTypes.object.isRequired
  },

  render: function() {
    const chartProps = this.props.chartProps;
    const stylings = chartProps.stylings;
		const displayConfig = this.props.displayConfig;
		const metadata = this.props.metadata;

    const schema = chartProps.schema.schema;
    const data = topojson.feature(schema.topojson, schema.topojson.objects[schema.feature]);

    const projObj = {
      projection: schema.proj,
      scale: schema.scale,
      translate: schema.translate,
      precision: schema.precision
    }

    const proj = projectionFunc(projObj);
    const geo = geoPath(proj);

   /* const projection = d3.geo[schema.proj]()
      .scale(proj.scale)
      .translate(proj.translate);*/

    return (
          <PolygonCollection
            chartProps= {chartProps}
            data= {data.features}
            displayConfig={displayConfig}
            geoPath= {geo}
            proj={proj}
            metadata={metadata}
            schema={schema}
            stylings={stylings}
            translate={this.props.translate}
            polygonClass={polygonClass}
          />
    );
  }
});

module.exports = MapRenderer;
