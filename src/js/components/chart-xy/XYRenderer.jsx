// Render an XY chart (line, column, scatterplot). It allows mixed charts
// combining any of these types, as well as time series

// React
import React, {PropTypes} from 'react';
import ReactDom from 'react-dom';

import PureRenderMixin from 'react-addons-pure-render-mixin';
import update from 'react-addons-update';

// Node modules
import d3 from 'd3';
import {flatten, each, clone, map, reduce, some, assign, bind} from 'lodash';

// chart elements
const Chart               = require("../shared/Chart.jsx");
const HorizontalAxis      = require("../shared/HorizontalAxis.jsx");
const HorizontalGridLines = require("../shared/HorizontalGridLines.jsx");
const SvgWrapper          = require("../svg/SvgWrapper.jsx");
const VerticalAxis        = require("../shared/VerticalAxis.jsx");
const VerticalGridLines   = require("../shared/VerticalGridLines.jsx");

// Flux actions
const VisualViewActions = require("../../actions/VisualViewActions");

// Svg components
const SvgRectLabel        = require("../svg/SvgRectLabel.jsx");

// Utilities
const help                = require("../../util/helper.js");
const scaleUtils          = require("../../util/scale-utils.js");
const seriesUtils         = require("../../util/series-utils.js");
const xyDimensions        = require("../../charts/charts/cb-xy/xy-dimensions.js");

const scaleNames = ["primaryScale", "secondaryScale"];

/**
 * ### Component that renders XY (line, column, dot) charts
 * @property {boolean} editable - Allow the rendered component to interacted with and edited
 * @property {object} displayConfig - Parsed visual display configuration for chart grid
 * @property {object} chartProps - Properties used to draw this chart
 * @property {object} metadata - Title, data source, etc
 * @instance
 * @memberof renderers
 */
class XYRenderer extends React.Component {

	constructor(props) {
		super(props);
		this.state = { labelYMax : 0};
		this._updateLabelYMax = this._updateLabelYMax.bind(this);
	}
	// we need to know the largest y value for a label so that we can
	// compute where the chart should start
	_updateLabelYMax (labelYMax) {
		this.setState({ labelYMax: labelYMax });
	}
	// some styles are different if there is a column. check here
	_chartHasColumn (chartSettings) {
		return some(chartSettings, function(setting) {
			return setting.type === "column";
		});
	}
	// compute the max tick width for each scale
	_getTickWidths (scales, tickFont) {
		return reduce(scaleNames, function(prev, key, i) {
			prev[key] = scaleUtils.getTickWidths(scales[key], tickFont);
			return prev;
		}, {});
	}
	// get x-axis which can be one of many types
	_generateXAxis (scale, data, range) {
		if (scale.hasDate) {
			return scaleUtils.generateScale("time", scale.dateSettings, data, range)
		} else if (scale.isNumeric) {
			return scaleUtils.generateScale("linear", scale.numericSettings, null, range)
		} else {
			return scaleUtils.generateScale("ordinal", scale, data, range)
		}
	}

	// conditionally anchor x axis text based on type of axis
	// TODO: put outside XY renderer so that grid can use this
	_xAxisTextAnchor (chartProps, hasDate, hasCol) {
		if (hasDate && !hasCol) {
			return "start";
		} else {
			return "middle";
		}
	}
	// add specified column padding to x axis if chart contains column
	// TODO: put outside XY renderer so that grid can use this
	_getXOuterPadding (hasCol) {
		if (hasCol) {
			return this.props.displayConfig.columnOuterPadding;
		} else {
			return 0;
		}
	}
	// Add space between legend and chart unless all legend labels
	// dragged or if labels not displayed
	_needsLabelOffset (labels, data) {
		var hasUndraggedLabel = some(labels.values, function(value) {
			return !value.dragged;
		}, true);
		return (hasUndraggedLabel && data.length > 1);
	}

	// create flat array of series components based on data and scales
	_generateSeries (yAxes) {
		const props = this.props;
		const primaryScale = yAxes.primaryScale.scale;
		const secondaryScale = yAxes.secondaryScale.scale;
		const chartProps = props.chartProps;

		// should lines contain dots
		const lineMarkThreshold = props.displayConfig.lineMarkThreshold;
		const pointsPerSeries = chartProps.data[0].values.length;
		const renderLinePoints = (pointsPerSeries < lineMarkThreshold);

		// create hash of { type: [ components ] }
		// by passing type and props to seriesUtils.createSeries
		const series = reduce(chartProps.data, function(seriesByType, d, i) {
			const setting = chartProps.chartSettings[i];
			const type = setting.type;
			seriesByType[type] = seriesByType[type] || [];

			const seriesProps = {
				key: i,
				data: d.values,
				dotRadiusFactor: props.styleConfig.dotRadiusFactor,
				yScale: (setting.altAxis ? secondaryScale : primaryScale),
				colorIndex: setting.colorIndex
			}

			if (setting.type === "line" && renderLinePoints) {
				seriesByType[type].push(seriesUtils.createSeries("lineMark", seriesProps));
			} else if (setting.type === "column") {
				seriesByType[type].push(seriesProps);
			} else {
				seriesByType[type].push(seriesUtils.createSeries(type, seriesProps));
			}
			return seriesByType;
		}, {});

		// parse column separately because its data passed to a group
		let columnGroup = null;
		if (series.column) {
			columnGroup = seriesUtils.createSeries("column", {
				key: "bar", bars: series.column
			});
		}

		// return components by type with desired stacking order
		return flatten([
			columnGroup,
			series.line,
			series.scatterPlot
		]);
	}

	render () {
		// grab some props for convenience
		const props = this.props;
		const _chartProps = props.chartProps;
		const displayConfig = props.displayConfig;
		const styleConfig = props.styleConfig;
		const margin = displayConfig.margin;
		let scale = _chartProps.scale;

		// bools that affect how chart will render
		const hasColumn = this._chartHasColumn(_chartProps.chartSettings);
		const needsLabelOffset = this._needsLabelOffset(_chartProps._annotations.labels, _chartProps.data)

		// set the tick font and figure out how wide ticks will be before rendering
		const tickFont = styleConfig.fontSizes.medium + "px " + styleConfig.fontFamilies.axes;
		const tickWidths = this._getTickWidths(_chartProps.scale, tickFont);
		const tickTextHeight = help.computeTextWidth("M", tickFont);

		// set the dimensions of inner and outer. much of this will be unnecessary
		// if we draw stuff in HTML
		const base_dimensions = xyDimensions(props.width, {
			displayConfig: displayConfig,
			enableResponsive: props.enableResponsive,
			metadata: props.metadata
		});
		// Dimensions of the chart area
		const chartAreaDimensions = {
			width: (
				base_dimensions.width - margin.left - margin.right -
				displayConfig.padding.left - displayConfig.padding.right -
				tickWidths.primaryScale.max - tickWidths.secondaryScale.max
			),
			height: (
				base_dimensions.height - margin.top - margin.bottom -
				displayConfig.padding.top - displayConfig.padding.bottom
			)
		};

		// height needed to account for legend labels
		const extraHeight = (chartAreaDimensions.height * this.state.labelYMax)
		let chartAreaTranslateY = extraHeight;

		// dimensions of entire canvas, base + label height
		const outerDimensions = {
			width: base_dimensions.width,
			height: base_dimensions.height + extraHeight
		};

		// account for legend label offset
		if (needsLabelOffset && props.chartProps.data.length > 1) {
			chartAreaTranslateY += displayConfig.afterLegend;
			chartAreaDimensions.height -= displayConfig.afterLegend;
		}

		// y axis and scales
		const yRange = [chartAreaDimensions.height, props.styleConfig.overtick_top];
		const yAxes = {
			primaryScale: scaleUtils.generateScale("linear", scale.primaryScale, null, yRange),
			secondaryScale: scaleUtils.generateScale("linear", scale.secondaryScale, null, yRange)
		}

		// x axis and scales
		const xPadding = (
			chartAreaDimensions.width * this._getXOuterPadding(hasColumn) +
			props.styleConfig.xOverTick
		);
		const xRange = [xPadding, chartAreaDimensions.width - xPadding];
		const xAxis = this._generateXAxis(scale, _chartProps.data, xRange);

		// linear x axis used for placing annotations based on scale
		const xAxisLinear = scaleUtils.generateScale("linear",
			{ domain: xAxis.scale.domain() }, null, xRange);

		// create 1 or 2 vertical axes
		const verticalAxes = map(scaleNames, function(key, i) {
			if (!scale[key]) return null;

			const scaleOptions = scale[key];
			const axis = yAxes[key];
			const orient = displayConfig.yAxisOrient[key];
			const maxTickWidth = tickWidths[key].max;
			const offsetX = (orient === "left") ? maxTickWidth * -1 : maxTickWidth;
			return (
				<VerticalAxis
					key={i}
					prefix={scaleOptions.prefix}
					suffix={scaleOptions.suffix}
					tickFormat={axis.tickFormat}
					tickValues={axis.tickValues}
					tickWidths={tickWidths[key]}
					orient={orient}
					textAlign="outside"
					offset={{ x: offsetX, y: 0 }}
					width={chartAreaDimensions.width}
					yScale={axis.scale}
					colorIndex={scaleOptions.colorIndex}
				/>
			)
		});

		// mobile overrides TODO: do we actually need this?
		if (props.enableResponsive && _chartProps.hasOwnProperty("mobile") && this.props.isSmall) {
			if (_chartProps.mobile.scale) {
				scale = assign({}, _chartProps.scale, _chartProps.mobile.scale);
			} else {
				scale = _chartProps.scale;
			}
		} else {
			scale = _chartProps.scale;
		}

		// draw the chart
		return (
			<SvgWrapper
				outerDimensions={outerDimensions}
				metadata={props.metadata}
				displayConfig={displayConfig}
				styleConfig={props.styleConfig}
			>
				{/* main chart area */}
				<Chart
					chartType="xy"
					dimensions={chartAreaDimensions}
					styleConfig={props.styleConfig}
					displayConfig={displayConfig}
					editable={props.editable}
					xScale={xAxis.scale}
					yScale={yAxes.primaryScale.scale}
					translate={[tickWidths.primaryScale.max, chartAreaTranslateY]}
					tickTextHeight={tickTextHeight}
					tickFont={tickFont}
				>
					<VerticalGridLines
						tickValues={xAxis.tickValues}
						y1={chartAreaDimensions.height}
						y2={chartAreaDimensions.height + styleConfig.overtick_bottom}
					/>
					<HorizontalGridLines
						tickValues={scale.primaryScale.tickValues}
						x2={chartAreaDimensions.width + tickWidths.secondaryScale.max}
					/>
					{verticalAxes}
					{this._generateSeries(yAxes)}
					<HorizontalAxis
						prefix={(scale.numericSettings) ? scale.numericSettings.prefix : ""}
						suffix={(scale.numericSettings) ? scale.numericSettings.suffix : ""}
						tickFormat={xAxis.tickFormat}
						tickValues={xAxis.tickValues}
						textAnchor={this._xAxisTextAnchor(_chartProps, scale.hasDate, hasColumn)}
						orient="bottom"
					/>
				</Chart>
				{/* chart legend */}
				<XYLabels
					key="xy-labels"
					chartProps={_chartProps}
					font={tickFont}
					needsLabelOffset={needsLabelOffset}
					dimensions={chartAreaDimensions}
					editable={props.editable}
					displayConfig={displayConfig}
					styleConfig={props.styleConfig}
					tickWidths={tickWidths}
					xScale={xAxisLinear.scale}
					yScale={yAxes.primaryScale.scale}
					updateLabelYMax={this._updateLabelYMax}
					labelYMax={this.state.labelYMax}
				/>
			</SvgWrapper>
		);
	}
};

XYRenderer.propTypes = {
	displayConfig: PropTypes.object.isRequired,
	styleConfig: PropTypes.object.isRequired,
	chartProps: PropTypes.shape({
		chartSettings: PropTypes.array.isRequired,
		data: PropTypes.array.isRequired,
		scale: PropTypes.object.isRequired,
		_annotations: PropTypes.object,
		date: PropTypes.object,
		mobile: PropTypes.object
	}).isRequired,
	metadata: PropTypes.object,
	showMetadata: PropTypes.bool,
	editable: PropTypes.bool,
	useMobileSettings: PropTypes.bool
};

/**
 * ### Component that renders the legend labels for an XY chart
 * See `React.PropTypes` declaration for properties:
 * @example
	propTypes: {
		chartProps: PropTypes.object.isRequired,
		editable: PropTypes.bool,
		displayConfig: PropTypes.object.isRequired,
		styleConfig: PropTypes.object.isRequired,
		xScale: PropTypes.func.isRequired,
		yScale: PropTypes.func.isRequired,
		dimensions: PropTypes.object,
		labelYMax: PropTypes.number,
		updateLabelYMax: PropTypes.func
	},
 * @instance
 * @memberof XYRenderer
 */
class XYLabels extends React.Component {

	constructor(props) {
		super(props);
		this.state = { undraggedLabels: {} };
		this._handleLabelPositionUpdate = this._handleLabelPositionUpdate.bind(this);
		this._enableDrag = this._enableDrag.bind(this);
	}

	componentWillReceiveProps (nextProps) {
		/*
		* We use this XYLabels component's state to save locations of undragged
		* labels. Dragged labels are saved to the parent store so that they can be
		* reloaded later.
		*/
		/* Make sure only undragged labels exist in XYLabels state, removing others */
		const updateUndragged = reduce(nextProps.chartProps._annotations.labels.values, bind(function(obj, v, i) {
			if (!v.dragged) {
				if (this.state.undraggedLabels[i]) {
					obj[i] = this.state.undraggedLabels[i];
					return obj;
				} else {
					return obj;
				}
			} else {
				return obj;
			}
		}, this), {});

		this.setState({
			undraggedLabels: updateUndragged
		});
	}

	_getLabelYMax (labels, height) {
		let labelYMax = 0;

		// Find out how much vertical space the labels are taking up
		// by identifying the one with the largest `y` value
		// Only do this if the labels have not been dragged
		if (!labels.hasDragged) {
			each(this.props.chartProps.data, function(d, i) {
				var currLabel = labels[i];
				if (currLabel) {
					if (currLabel.y > labelYMax) {
						labelYMax = currLabel.y;
					}
				}
			}, this);
		}
		return labelYMax;
	}

	_enableDrag () {
		// tell the parent app that dragging has been enabled
		const annotations = this.props.chartProps._annotations;
		annotations.labels.hasDragged = true;
		VisualViewActions.updateChartProp("_annotations", annotations);
	}

	_handleLabelPositionUpdate (ix, pos) {
		// If a label is dragged, update its position in the parent app
		if (pos.dragged) {
			const values = clone(this.props.chartProps._annotations.labels.values);
			values[ix] = pos;
			const annotations = update(this.props.chartProps._annotations, { $merge: {
				labels: {
					values: values,
					hasDragged: this.props.chartProps._annotations.labels.hasDragged
				}
			}});
			VisualViewActions.updateChartProp("_annotations", annotations);
		/* Otherwise if undragged, update in XYLabls state */
		} else {
			const undragged = this.state.undraggedLabels;
			undragged[ix] = pos;
			this.setState(update(this.state, { $merge: {
				undraggedLabels: undragged
			}}));
			const labelYMax = this._getLabelYMax(undragged, this.props.dimensions.height);
			if (labelYMax !== this.props.labelYMax) {
				this.props.updateLabelYMax(labelYMax);
			}
		}
	}

	/**
	 * XYLabels#_getPrevUndraggedNode
	 * Recursively traverse through previous labels to find one that is undragged
	 * This is used to calculate the default placement of a label (ie to the
	 * right of the previous undragged node)
	 * @param {number} ix - The index of this undragged node in an array of undragged nodes
	 * @param {object[]} undraggedLabels - Position and size settings for all undraggedlabels
	 * @instance
	 * @memberof XYLabels
	 */
	_getPrevUndraggedNode (ix, undraggedLabels) {
		if (ix < 0) return null;

		if (undraggedLabels[ix]) {
			return undraggedLabels[ix];
		} else {
			return this._getPrevUndraggedNode(ix - 1, undraggedLabels);
		}
	}

	// create array of SvgRectLabel components
	render () {
		// get props for convenience
		const props = this.props;
		const labels = props.chartProps._annotations.labels;
		const styleConfig = props.styleConfig;
		const displayConfig = props.displayConfig;
		const dimensions = props.dimensions;
		let labelComponents = [];
		const labelFont = styleConfig.fontSizes.medium + "px " + styleConfig.fontFamilies.labels;

		const labelConfig = {
			xMargin: displayConfig.labelXMargin,
			textMargin: displayConfig.labelTextMargin,
			rowHeight: displayConfig.labelRowHeight,
			rectSize: displayConfig.labelRectSize
		};

		if (props.chartProps.data.length > 1) {
			labelComponents = map(props.chartProps.data, bind(function(d, i) {
				let prevNode = null;
				let labelSettings = {};
				const chartSetting = props.chartProps.chartSettings[i];
				const scale = { yScale: props.yScale, xScale: props.xScale, };

				// Use existing positions if possible
				if (labels.values[i].dragged) {
					labelSettings = labels.values[i];
				} else {
					labelSettings = this.state.undraggedLabels[i];
					prevNode = this._getPrevUndraggedNode(i - 1, this.state.undraggedLabels);
				}

				return (
					<SvgRectLabel
						key={i} index={i}
						text={chartSetting.label}
						labelConfig={labelConfig}
						dimensions={props.dimensions}
						enableDrag={this._enableDrag}
						editable={props.editable}
						onPositionUpdate={this._handleLabelPositionUpdate}
						offset={{ x: displayConfig.margin.left, y: 0}}
						colorIndex={chartSetting.colorIndex}
						settings={labelSettings}
						prevNode={prevNode}
						scale={scale}
					/>
				);
			}, this));
		}

		// account for chart being moved up on all labels dragged
		const translateY = (!props.needsLabelOffset) ? 0 - displayConfig.afterLegend : 0;

		return (
			<g
				transform={ "translate(" + [0, translateY] + ")" }
				className="renderer-annotations" style={{ font: labelFont }}>
				{labelComponents}
			</g>
		);
	}
};

XYRenderer.propTypes = {
	chartProps: PropTypes.object.isRequired,
	editable: PropTypes.bool,
	displayConfig: PropTypes.object.isRequired,
	styleConfig: PropTypes.object.isRequired,
	xScale: PropTypes.func,
	yScale: PropTypes.func,
	dimensions: PropTypes.object,
	labelYMax: PropTypes.number,
	updateLabelYMax: PropTypes.func
};

module.exports = XYRenderer;
