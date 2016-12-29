import React from 'react';
import update from 'react-addons-update';
import d3 from 'd3';
const topojson = require('topojson');

import PolygonCollection from './Map50Renderer.jsx';
import ChartRendererMixin from "./../mixins/MapRendererMixin.js";

const projectionFunc = require('react-d3-map-core').projection;
const geoPath = require('react-d3-map-core').geoPath;

// move into config?
const polygonClass = 'polygon-test';

const MapRenderer = React.createClass({

  propTypes: {
		displayConfig: React.PropTypes.shape({
			margin: React.PropTypes.object.isRequired,
			padding: React.PropTypes.object.isRequired,
			labelRectSize: React.PropTypes.number.isRequired,
			afterLegend: React.PropTypes.number.isRequired
		}).isRequired,
		chartProps: React.PropTypes.shape({
			chartSettings: React.PropTypes.array.isRequired,
			data: React.PropTypes.array.isRequired,
			scale: React.PropTypes.object.isRequired,
			_annotations: React.PropTypes.object,
			date: React.PropTypes.object,
			mobile: React.PropTypes.object
		}).isRequired,
		metadata: React.PropTypes.object,
		showMetadata: React.PropTypes.bool,
		editable: React.PropTypes.bool,
		useMobileSettings: React.PropTypes.bool
	},

  render: function() {

    const chartProps = this.props.chartProps;
    const stylings = chartProps.stylings;
		const displayConfig = this.props.displayConfig;

    const schema = chartProps.schema.schema;
    const featname = schema.feature;

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
            displayConfig={displayConfig}
            polygonClass={polygonClass}
          />
    );
  }
});

module.exports = MapRenderer;
