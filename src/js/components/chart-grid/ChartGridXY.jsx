/*
 * ### ChartGridXY
 * Render a grid of N columns by N rows of XY (line, column, dot) charts
*/
import React, {PropTypes} from 'react';
import update from 'react-addons-update';

import {bind, clone, filter, map, max, reduce} from 'lodash';

/* Helper functions */
const help = require("../../util/helper.js");

/* Renderer mixins */
const ChartRendererMixin = require("../mixins/ChartRendererMixin.js");

const HorizontalGridLines = require("../shared/HorizontalGridLines.jsx");
const HorizontalAxis      = require("../shared/HorizontalAxis.jsx");
const VerticalGridLines   = require("../shared/VerticalGridLines.jsx");
const BarGroup            = require("../series/BarGroup.jsx");
const SvgWrapper          = require("../svg/SvgWrapper.jsx");
const Chart               = require("../shared/Chart.jsx");
const VerticalAxis        = require("../shared/VerticalAxis.jsx");
const SeriesLabel         = require("../shared/SeriesLabel.jsx");
const scaleUtils          = require("../../util/scale-utils.js");
const seriesUtils         = require("../../util/series-utils.js");
const gridUtils           = require("../../util/grid-utils.js");

/**
 * ### Component that renders xy charts in a chart grid
 * @property {boolean} editable - Allow the rendered component to interacted with and edited
 * @property {object} styleConfig - Parsed global style config
 * @property {object} displayConfig - Parsed visual display configuration for chart grid
 * @property {object} chartProps - Properties used to draw this chart
 * @instance
 * @memberof ChartGridRenderer
 */
const ChartGridXY = React.createClass({

	propTypes: {
		editable: PropTypes.bool.isRequired,
		styleConfig: PropTypes.object.isRequired,
		displayConfig: PropTypes.shape({
			margin: PropTypes.obj,
			padding: PropTypes.obj
		}).isRequired,
		chartProps: PropTypes.shape({
			chartSettings: PropTypes.array.isRequired,
			data: PropTypes.array.isRequired,
			scale: PropTypes.object.isRequired,
			_grid: PropTypes.object.isRequired
		}).isRequired
	},

	//getInitialState: function() {
	//},

	shouldComponentUpdate: function(nextProps, nextState) {
		// Don't render if data is for some reason unavailable
		if (nextProps.chartProps.data) {
			return true;
		} else {
			return false;
		}
	},

	// get x-axis which can be one of many types
	_generateXAxis: function(scale, data, range) {
		if (scale.hasDate) {
			return scaleUtils.generateScale("time", scale.dateSettings, data, range)
		} else if (scale.isNumeric) {
			return scaleUtils.generateScale("linear", scale.numericSettings, null, range)
		} else {
			return scaleUtils.generateScale("ordinal", scale, data, range)
		}
	},

	// render a single chart in the grid. this gets passed to `gridUtils.makeMults` to
	// render one for each column of data
	// TODO: have in mind a maybe better way to do this
	_xyGridBlock: function(gridType, xAxis, yAxis, d, i) {
		const props = this.props;
		const isFirstBlock = Math.floor((i + 1) / props.chartProps._grid.cols) === 0;
		const x1 = (isFirstBlock) ? NaN : 0;
		const seriesSettings = props.chartProps.chartSettings[i];
		let elProps;

		if (gridType === "column") {
			elProps = {
				key: i,
				bars: [{
					data: d.values,
					colorIndex: seriesSettings.colorIndex
				}]
			};
		} else {
			elProps = {
				key: i,
				data: d.values,
				colorIndex: seriesSettings.colorIndex
			};
		}

		const el = seriesUtils.createSeries(gridType, elProps);

		return [
			<SeriesLabel
				key="label"
				x={0}
				text={seriesSettings.label}
				colorIndex={seriesSettings.colorIndex}
			/>,
			<VerticalGridLines
				tickValues={xAxis.tickValues}
				key="vert-grid"
				y2={yAxis.scale.range()[0] + props.styleConfig.overtick_bottom}
			/>,
			<HorizontalAxis
				tickFormat={xAxis.tickFormat}
				tickValues={xAxis.tickValues}
				key="x-axis"
			/>,
			<HorizontalGridLines
				x1={x1}
				key="horiz-grid"
			/>,
			el
		];
	},

	render: function() {
		const props = this.props;
		const displayConfig = props.displayConfig;
		const margin = displayConfig.margin;
		const styleConfig = props.styleConfig;
		const chartProps = props.chartProps;
		const dimensions = props.dimensions;
		const primaryScale = chartProps.scale.primaryScale;

		const tickFont = styleConfig.fontSizes.medium + "px " + styleConfig.fontFamilies.axes;
		const tickTextHeight = help.computeTextWidth("M", tickFont);
		const tickWidths = scaleUtils.getTickWidths(primaryScale, tickFont);

		// Dimensions of the chart area
		const chartAreaDimensions = {
			width: (
				dimensions.width - margin.left - margin.right -
				displayConfig.xy.padding.left - displayConfig.xy.padding.right -
				tickWidths.max
			),
			height: (
				dimensions.height + displayConfig.xy.padding.bottom
			)
		};

		const outerDimensions = {
			width: dimensions.width,
			height: dimensions.height + margin.top + margin.bottom +
				displayConfig.xy.padding.bottom
		}

		// range for all charts in grid (outer)
		const xRangeOuter = [props.styleConfig.xOverTick, chartAreaDimensions.width];
		const yRangeOuter = [chartAreaDimensions.height, 0];

		// place grid elements using gridScales generated by d3
		const gridScales = gridUtils.createGridScales(chartProps._grid, {
			x: xRangeOuter,
			y: yRangeOuter
		}, {
			xInnerPadding: props.displayConfig.gridPadding.xInnerPadding,
			xOuterPadding: props.displayConfig.gridPadding.xOuterPadding,
			yInnerPadding: props.displayConfig.gridPadding.yInnerPadding,
			yOuterPadding: props.displayConfig.gridPadding.yOuterPadding
		});

		const xRangeInner = [0, gridScales.cols.rangeBand()];
		const yRangeInner = [gridScales.rows.rangeBand() - displayConfig.xy.padding.bottom, displayConfig.afterLegend];
		const xAxis = this._generateXAxis(chartProps.scale, chartProps.data, xRangeInner);
		const yAxis = scaleUtils.generateScale("linear", primaryScale, chartProps.data, yRangeInner);

		// `Outer` is the common wrapper component that will be used for each chart
		// in the grid
		const Outer = React.createFactory(Chart);
		const outerProps = {
			chartType: "xy-grid",
			styleConfig: props.styleConfig,
			displayConfig: displayConfig,
			tickValues: primaryScale.tickValues,
			editable: props.editable,
			xScale: xAxis.scale,
			yScale: yAxis.scale,
			tickTextHeight: tickTextHeight,
			tickFont: tickFont
		};

		const renderGridFunc = this._xyGridBlock.bind(null, chartProps._grid.type, xAxis, yAxis);
		const grid = gridUtils.makeMults(Outer, outerProps, chartProps.data, gridScales, renderGridFunc);

		// create vertical axis and grid lines for each row.
		// this should possibly be part of the grid generation
		// and could be its own wrapper component
		const verticalAxes = map(gridScales.rows.domain(), function(row, i) {
			const yPos = gridScales.rows(i);
			return (
				<g
					className="axis grid-row-axis"
					key={"grid-row-" + i}
					transform={ "translate(" + [0, yPos] + ")" }
				>
					<HorizontalGridLines
						yScale={yAxis.scale}
						tickValues={primaryScale.tickValues}
						x1={0}
						x2={tickWidths.max + styleConfig.xOverTick}
					/>
					<VerticalAxis
						tickWidths={tickWidths}
						textAlign="inside"
						tickValues={primaryScale.tickValues}
						tickFormat={yAxis.tickFormat}
						prefix={primaryScale.prefix}
						suffix={primaryScale.suffix}
						dimensions={chartAreaDimensions}
						styleConfig={props.styleConfig}
						displayConfig={displayConfig}
						xScale={xAxis.scale}
						yScale={yAxis.scale}
						tickTextHeight={tickTextHeight}
						tickFont={tickFont}
					/>
				</g>
			)
		});

		return (
			<SvgWrapper
				outerDimensions={outerDimensions}
				metadata={props.metadata}
				displayConfig={displayConfig}
				styleConfig={props.styleConfig}
			>
			<g
				className="grid-wrapper"
				transform={ "translate(" + [0, displayConfig.padding.top] + ")" }
			>
				<g
					className="grid-charts"
					transform={ "translate(" + [tickWidths.max, 0] + ")" }
				>
					{grid}
				</g>
				{verticalAxes}
			</g>
			</SvgWrapper>
		);
	}
});

module.exports = ChartGridXY;
