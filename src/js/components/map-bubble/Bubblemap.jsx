import React from 'react';
import update from 'react-addons-update';
import d3 from 'd3';
// Map
const topojson = require('topojson');

const PolygonCollection = require('./MapBubbleRenderer.jsx');
const projectionFunc = require('react-d3-map-core').projection;
const geoPath = require('react-d3-map-core').geoPath;

const ChartRendererMixin = require("../mixins/MapRendererMixin.js");

const SvgWrapper = require("../svg/SvgWrapper.jsx");

const ClippingPath = require("../../components/shared/ClippingPath.jsx");
const LegendSpace = require("../../components/svg/MapLegendSpace.jsx");

const bubbleDimensions = require("../../charts/maps/mb-bubble/mb-bubble-dimensions.js");

const polygonClass = 'polygon-render';

let MapRenderer = React.createClass({

  propTypes: {
    chartProps: React.PropTypes.object.isRequired
  },

  render: function() {

  	const props = this.props;
    const chartProps = props.chartProps;
    const stylings = chartProps.stylings;
    const schema = chartProps.schema.schema;
    const featname = schema.feature;

		const displayConfig = props.displayConfig;
    const metadata = props.metadata;

    const data = topojson.feature(schema.topojson, schema.topojson.objects[featname]);

    // replace these hardcoded values with proper numbers from outerDimensions
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


		const styleConfig = props.styleConfig;
		const margin = displayConfig.margin;

    // set the dimensions of inner and outer. much of this will be unnecessary
		// if we draw stuff in HTML
		const base_dimensions = bubbleDimensions(props.width, {
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
});

module.exports = MapRenderer;
