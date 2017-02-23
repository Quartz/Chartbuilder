import React from 'react';
import update from 'react-addons-update';
import d3 from 'd3';
const topojson = require('topojson');

import PolygonCollection from './Map50Renderer.jsx';
import ChartRendererMixin from "./../mixins/MapRendererMixin.js";

const projectionFunc = require('react-d3-map-core').projection;
const geoPath = require('react-d3-map-core').geoPath;

const SvgWrapper = require("../svg/SvgWrapper.jsx");

const ClippingPath = require("../../components/shared/ClippingPath.jsx");
const LegendSpace = require("../../components/svg/MapLegendSpace.jsx");

const choroplethDimensions = require("../../charts/maps/mb-50/mb-50-dimensions.js");


// move into config?
const polygonClass = 'polygon-render';

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

  	const props = this.props;
    const chartProps = props.chartProps;
    const schema = chartProps.schema.schema;
    const featname = schema.feature;
    const shouldSearch = props.shouldSearch;

		const displayConfig = props.displayConfig;
    const metadata = props.metadata;

    const data = topojson.feature(schema.topojson, schema.topojson.objects[featname]);

    const updatedTranslate = [schema.translate[0] * (this.props.width / 640), schema.translate[1]  * (this.props.width / 640)];
    const updatedScale = schema.scale * (this.props.width / 700);

    let projObj = {
      projection: schema.proj,
      scale: updatedScale,
      translate: updatedTranslate,
      precision: schema.precision
    }

    if (schema.parallels) projObj.parallels = schema.parallels;
    if (schema.rotate) projObj.rotate = schema.rotate;

    const proj = projectionFunc(projObj);
    const geo = geoPath(proj);

    const stylings = chartProps.stylings;

		const styleConfig = props.styleConfig;
		const margin = displayConfig.margin;

    // set the dimensions of inner and outer. much of this will be unnecessary
		// if we draw stuff in HTML
		const base_dimensions = choroplethDimensions(props.width, {
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
			legendleft:margin.legendleft
		};

		if (metadata.subtitle) {
			if (metadata.subtitle.length > 0) {
				translate.legendsOneRow = margin.legendsOneRow + margin.subtitle;
				translate.legendsTwoRow = margin.legendsTwoRow + margin.subtitle;
			}
		} else {
			translate.legendsOneRow = margin.legendsOneRow;
			translate.legendsTwoRow = margin.legendsTwoRow;
		}

    const legendsArray = Object.keys(chartProps.legend).map((k) => chartProps.legend[k]);

    return (
			<SvgWrapper
				outerDimensions={outerDimensions}
				metadata={props.metadata}
				displayConfig={displayConfig}
				styleConfig={props.styleConfig}
			>
				<ClippingPath
					chartAreaDimensions={chartAreaDimensions}
					metadata={props.metadata}
					displayConfig={displayConfig}
				/>
				{/* main map area */}
	      <PolygonCollection
	        chartProps= {chartProps}
	        stylings = {chartProps.stylings}
	        data= {data.features}
	        geoPath= {geo}
	        metadata ={metadata}
	        schema={schema}
	        proj={proj}
	        isSmall={props.isSmall}
	        displayConfig={displayConfig}
	        polygonClass={polygonClass}
	      />
	      <LegendSpace
					key="legend"
					translate={translate}
					className="svg-legend-space"
					chartProps={chartProps}
					stylings={stylings}
					metadata={props.metadata}
					legendsArray={legendsArray}
					dimensions={outerDimensions}
					displayConfig={displayConfig}
					chartWidth={outerDimensions.width - margin.left - margin.right}
				/>
	    </SvgWrapper>
    );
  }
});

module.exports = MapRenderer;
