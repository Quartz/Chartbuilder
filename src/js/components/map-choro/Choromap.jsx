import React from 'react';
import update from 'react-addons-update';
import d3 from 'd3';
const topojson = require('topojson');

import PolygonCollection from './MapchoroRenderer.jsx';
import ChartRendererMixin from "./../mixins/MapRendererMixin.js";

const projectionFunc = require('react-d3-map-core').projection;
const geoPath = require('react-d3-map-core').geoPath;

const SvgWrapper = require("../svg/SvgWrapper.jsx");
const ClippingPath = require("../../components/shared/ClippingPath.jsx");
const LegendSpace = require("../../components/svg/MapLegendSpace.jsx");

const choroplethDimensions = require("../../charts/maps/mb-choro/mb-choro-dimensions.js");
const RenderHelper = require("../../util/map-render-helpers");

// move into config?
const polygonClass = 'polygon-render';

class MapRenderer extends React.Component {
  render () {
  	// save props
  	const props = this.props;
    const chartProps = props.chartProps;
    const stylings = chartProps.stylings;
    const schema = chartProps.schema.schema;
    const featname = schema.feature;

		const displayConfig = props.displayConfig;
    const metadata = props.metadata;

    const data = topojson.feature(schema.topojson, schema.topojson.objects[featname]);

    // replace these hardcoded values with proper numbers from outerDimensions
    const updatedTranslate = [schema.translate[0] * (props.width / 640), schema.translate[1]  * (props.width / 640)];
    const updatedScale = schema.scale * (props.width / 700);

    const projObj = RenderHelper.get_projection(schema, updatedScale, updatedTranslate);

    const proj = projectionFunc(projObj);
    const geo = geoPath(proj);

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
					isSmall={props.isSmall}
					dimensions={outerDimensions}
					displayConfig={displayConfig}
					chartWidth={outerDimensions.width - margin.left - margin.right}
				/>
	    </SvgWrapper>
    );
  }
};

MapRenderer.propTypes = {
	displayConfig: React.PropTypes.shape({
		margin: React.PropTypes.object.isRequired,
		padding: React.PropTypes.object.isRequired,
		labelRectSize: React.PropTypes.number.isRequired
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
}

module.exports = MapRenderer;
