// Render an XY chart (line, column, scatterplot). It allows mixed charts
// combining any of these types, as well as time series

// React
var React               = require("react");
var ReactDOM            = require("react-dom");
var PureRenderMixin     = require("react-addons-pure-render-mixin");
var PropTypes           = React.PropTypes;
var update              = require("react-addons-update");

// Node modules
var d3                  = require("d3");
var assign              = require("lodash/assign");
var bind                = require("lodash/bind");
var clone               = require("lodash/clone");
var each                = require("lodash/each");
var flatten             = require("lodash/flatten");
var map                 = require("lodash/map");
var reduce              = require("lodash/reduce");
var some                = require("lodash/some");

var ChartRendererMixin  = require("../mixins/ChartRendererMixin.js");
var DateScaleMixin      = require("../mixins/DateScaleMixin.js");
var NumericScaleMixin   = require("../mixins/NumericScaleMixin.js");

// chart elements
// TODO: factor these into their own lib
var XYChart             = require("./XYChart.jsx");
var HorizontalAxis      = require("../shared/HorizontalAxis.jsx");
var HorizontalGridLines = require("../shared/HorizontalGridLines.jsx");
var SvgWrapper          = require("../svg/SvgWrapper.jsx");
var VerticalAxis        = require("../shared/VerticalAxis.jsx");
var VerticalGridLines   = require("../shared/VerticalGridLines.jsx");

// Flux actions
var ChartViewActions    = require("../../actions/ChartViewActions");

// Svg components
var SvgRectLabel        = require("../svg/SvgRectLabel.jsx");

// Helpers
var help                = require("../../util/helper.js");
var scaleUtils          = require("../../util/scale-utils.js");
var seriesUtils         = require("../../util/series-utils.js");
var xyDimensions        = require("../../charts/cb-xy/xy-dimensions.js");

var scaleNames = ["primaryScale", "secondaryScale"];

/**
 * ### Component that renders XY (line, column, dot) charts
 * @property {boolean} editable - Allow the rendered component to interacted with and edited
 * @property {object} displayConfig - Parsed visual display configuration for chart grid
 * @property {object} chartProps - Properties used to draw this chart
 * @property {object} metadata - Title, data source, etc
 * @instance
 * @memberof renderers
 */
var XYRenderer = React.createClass({

	propTypes: {
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
	},

	getInitialState: function() {
		return { labelYMax: 0 };
	},

	mixins: [ChartRendererMixin],

	_updateLabelYMax: function(labelYMax) {
		this.setState({ labelYMax: labelYMax });
	},

	// some styles are different if there is a column. check here
	_chartHasColumn: function(chartSettings) {
		return some(chartSettings, function(setting) {
			return setting.type === "column";
		});
	},

	// compute the max tick width for each scale
	_getTickWidths: function(scales, tickFont) {
		return reduce(scaleNames, function(prev, key, i) {
			prev[key] = scaleUtils.getTickWidths(scales[key], tickFont);
			return prev;
		}, {});
	},

	// get x-axis which can be one of many types
	_generateXAxis: function(scale, data, range) {
		if (scale.dateSettings) {
			return scaleUtils.generateScale("time", scale.dateSettings, data, range)
		} else if (scale.numericSettings) {
			return scaleUtils.generateScale("linear", scale.numericSettings, null, range)
		} else {
			return scaleUtils.generateScale("ordinal", null, data, range)
		}
	},

	// conditionally anchor x axis text based on type of axis
	_xAxisTextAnchor: function(chartProps, hasCol) {
		var hasDate = (chartProps.scale.hasOwnProperty("dateSettings"));
		if (hasDate && !hasCol) {
			return "start";
		} else {
			return "middle";
		}
	},

	// add specified column padding to x axis if chart contains column
	_getXOuterPadding: function(hasCol) {
		if (hasCol) {
			return this.props.displayConfig.columnOuterPadding;
		} else {
			return 0;
		}
	},

	// Maintain space between legend and chart unless all legend labels
	// have been dragged or if labels not displayed
	_applyLabelOffset: function(labels, data) {
		var hasUndraggedLabel = some(labels.values, function(value) {
			return !value.dragged;
		}, true);
		return (hasUndraggedLabel && data.length > 1);
	},

	// create flat array of series components based on data and scales
	_generateSeries: function(xScale, primaryScale, secondaryScale) {
		var chartProps = this.props.chartProps;

		// should lines contain dots
		var lineMarkThreshold = this.props.displayConfig.lineMarkThreshold;
		var pointsPerSeries = chartProps.data[0].values.length;
		var renderLinePoints = (pointsPerSeries < lineMarkThreshold);

		// create hash of { type: [ components ] }
		// by passing type and props to seriesUtils.createSeries
		var series = reduce(chartProps.data, function(prev, d, i) {
			var setting = chartProps.chartSettings[i];
			var type = setting.type;
			prev[type] = prev[type] || [];

			var seriesProps = {
				key: i,
				data: d.values,
				yScale: ((setting.altAxis) ? secondaryScale : primaryScale),
				colorIndex: setting.colorIndex
			}

			if (setting.type === "line" && renderLinePoints) {
				prev[type].push(seriesUtils.createSeries("lineMark", seriesProps));
			} else if (setting.type === "column") {
				prev[type].push(seriesProps);
			} else {
				prev[type].push(seriesUtils.createSeries(type, seriesProps));
			}
			return prev;

		}, {});

		// parse column separately because its data passed to a group
		var columnGroup = null;
		if (series.column) {
			columnGroup = seriesUtils.createSeries("column", {
				key: "bar", bars: series.column
			});
		}

		// return with desired stacking order
		return flatten([ columnGroup, series.line, series.scatterPlot ]);
	},

	render: function() {
		var props = this.props;
		var _chartProps = this.props.chartProps;
		var displayConfig = this.props.displayConfig;
		var scale = _chartProps.scale;
		var labelComponents;
		var hasTitle = (props.metadata.title.length > 0 && props.showMetadata);
		var hasColumn = this._chartHasColumn(_chartProps.chartSettings);
		var applyLabelOffset = this._applyLabelOffset(_chartProps._annotations.labels, _chartProps.data)

		var tickFont = [
			props.styleConfig.fontSizes.medium,
			"px ",
			props.styleConfig.fontFamily
		].join("");

		var tickWidths = this._getTickWidths(_chartProps.scale, tickFont);
		var tickTextHeight = help.computeTextWidth("M", tickFont);

		var base_dimensions = xyDimensions(props.width, {
			displayConfig: displayConfig,
			enableResponsive: props.enableResponsive,
			metadata: props.metadata
		});

		// Dimensions of the chart area
		var chartAreaDimensions = {
			width: (
				base_dimensions.width -
				displayConfig.margin.left - displayConfig.margin.right -
				displayConfig.padding.left - displayConfig.padding.right -
				tickWidths.primaryScale.max - tickWidths.secondaryScale.max -
				props.styleConfig.xOverTick
			),
			height: (
				base_dimensions.height -
				displayConfig.margin.top - displayConfig.margin.bottom -
				displayConfig.padding.top - displayConfig.padding.bottom
			)
		};

		var extraHeight = (chartAreaDimensions.height * this.state.labelYMax)
		var chartAreaTranslateY = extraHeight;

		var outerDimensions = {
			width: base_dimensions.width,
			height: base_dimensions.height + extraHeight
		};

		// TODO: way of doing this cleaner?
		if (applyLabelOffset) {
			chartAreaTranslateY += displayConfig.afterLegend;
		} else {
			outerDimensions.height -= displayConfig.afterLegend;
		}

		var yRange = [chartAreaDimensions.height, 0];
		var xPadding = chartAreaDimensions.width * this._getXOuterPadding(hasColumn)
		var xRange = [xPadding, chartAreaDimensions.width - xPadding];
		var xAxis = this._generateXAxis(scale, _chartProps.data, xRange)

		// linear x axis used for placing annotations based on scale
		var xAxisLinear = scaleUtils.generateScale("linear", {domain: xRange}, null, xRange);
		var yAxisPrimary = scaleUtils.generateScale("linear", scale.primaryScale, null, yRange);
		var yAxisSecondary = { scale: null };

		var verticalAxes = [
			<VerticalAxis
				prefix={scale.primaryScale.prefix}
				suffix={scale.primaryScale.suffix}
				tickFormat={yAxisPrimary.tickFormat}
				tickValues={yAxisPrimary.tickValues}
				tickWidths={tickWidths.primaryScale.widths}
				tickTextHeight={tickTextHeight}
				orient="left"
				offset={tickWidths.primaryScale.max * -1}
				scale={yAxisPrimary.scale}
				key={0}
			/>
		];

		if (props.chartProps._numSecondaryAxis > 0) {
			yAxisSecondary = scaleUtils.generateScale("linear", _chartProps.scale.secondaryScale, null, yRange);

			verticalAxes.push(
				<VerticalAxis
					prefix={scale.secondaryScale.prefix}
					suffix={scale.secondaryScale.suffix}
					tickFormat={yAxisSecondary.tickFormat}
					tickValues={yAxisSecondary.tickValues}
					tickTextHeight={tickTextHeight}
					tickWidths={tickWidths.secondaryScale.widths}
					orient="right"
					width={chartAreaDimensions.width}
					offset={tickWidths.secondaryScale.max}
					scale={yAxisSecondary.scale}
					key={1}
				/>
			);
		}

		if (this.props.enableResponsive && _chartProps.hasOwnProperty("mobile") && this.props.isSmall) {
			if (_chartProps.mobile.scale) {
				scale = assign({}, _chartProps.scale, _chartProps.mobile.scale);
			} else {
				scale = _chartProps.scale;
			}
		} else {
			scale = _chartProps.scale;
		}

		return (
		<SvgWrapper
			outerDimensions={outerDimensions}
			metadata={this.props.metadata}
			displayConfig={displayConfig}
			styleConfig={this.props.styleConfig}
		>
			<XYChart
				dimensions={chartAreaDimensions}
				styleConfig={this.props.styleConfig}
				displayConfig={displayConfig}
				editable={this.props.editable}
				xScale={xAxis.scale}
				yScale={yAxisPrimary.scale}
				translate={[tickWidths.primaryScale.max, chartAreaTranslateY]}
				tickFont={tickFont}
			>
				<VerticalGridLines tickValues={xAxis.tickValues} />
				<HorizontalGridLines tickValues={scale.primaryScale.tickValues} />
				{this._generateSeries(xAxis.scale, yAxisPrimary.scale, yAxisSecondary.scale)}
				<HorizontalAxis
					prefix={(scale.numericSettings) ? scale.numericSettings.prefix : ""}
					suffix={(scale.numericSettings) ? scale.numericSettings.suffix : ""}
					tickTextHeight={tickTextHeight}
					tickFormat={xAxis.tickFormat}
					tickValues={xAxis.tickValues}
					textAnchor={this._xAxisTextAnchor(_chartProps, hasColumn)}
					orient="bottom"
				/>
				{verticalAxes}
			</XYChart>
			<XYLabels
				key="xy-labels"
				chartProps={_chartProps}
				font={tickFont}
				applyLabelOffset={applyLabelOffset}
				dimensions={chartAreaDimensions}
				editable={this.props.editable}
				displayConfig={displayConfig}
				styleConfig={this.props.styleConfig}
				tickWidths={tickWidths}
				xScale={xAxisLinear.scale}
				yScale={yAxisPrimary.scale}
				updateLabelYMax={this._updateLabelYMax}
				labelYMax={this.state.labelYMax}
			/>
		</SvgWrapper>
		);
	}
});

/**
 * ### Component that renders the legend labels for an XY chart
 * See `React.PropTypes` declaration for properties:
 * @example
 * propTypes: {
 *   chartProps: PropTypes.object.isRequired,
 *   hasTitle: PropTypes.bool.isRequired,
 *   displayConfig: PropTypes.object.isRequired,
 *   styleConfig: PropTypes.object.isRequired,
 *   data: PropTypes.arrayOf(PropTypes.object).isRequired,
 *   dimensions: PropTypes.shape({
 *     width: PropTypes.number,
 *     height: PropTypes.number
 *   }).isRequired,
 *   scale: PropTypes.object.isRequired,
 *   chartAreaDimensions: PropTypes.object,
 *   metadata: PropTypes.object,
 *   labelYMax: PropTypes.number,
 *   updateLabelYMax: PropTypes.func,
 *   maxTickWidth: PropTypes.object,
 * },
 * @instance
 * @memberof XYRenderer
 */
var XYLabels = React.createClass({

	propTypes: {
		chartProps: PropTypes.object.isRequired,
		editable: PropTypes.bool,
		//hasTitle: PropTypes.bool.isRequired,
		//displayConfig: PropTypes.object.isRequired,
		styleConfig: PropTypes.object.isRequired,
		//dimensions: PropTypes.shape({
			//width: PropTypes.number,
			//height: PropTypes.number
		//}).isRequired,
		//scale: PropTypes.object.isRequired,
		//chartAreaDimensions: PropTypes.object,
		//metadata: PropTypes.object,
		labelYMax: PropTypes.number,
		updateLabelYMax: PropTypes.func,
		maxTickWidth: PropTypes.object
	},

	getInitialState: function() {
		return {
			undraggedLabels: {},
			dateScaleInfo: null
		};
	},

	mixins: [ DateScaleMixin, NumericScaleMixin ],

	componentWillReceiveProps: function(nextProps) {
		/*
		* We use this XYLabels component's state to save locations of undragged
		* labels. Dragged labels are saved to the parent store so that they can be
		* reloaded later.
		*/
		/* Make sure only undragged labels exist in XYLabels state, removing others */
		var updateUndragged = reduce(nextProps.chartProps._annotations.labels.values, bind(function(obj, v, i) {
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
			undraggedLabels: updateUndragged,
			dateScaleInfo: nextProps.chartProps.scale.hasDate ? this.generateDateScale(nextProps) : null
		});
	},

	_getLabelYMax: function(labels, height) {
		var labelYMax = 0;

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
	},

	_enableDrag: function() {
		// tell the parent app that dragging has been enabled
		var annotations = this.props.chartProps._annotations;
		annotations.labels.hasDragged = true;
		ChartViewActions.updateChartProp("_annotations", annotations);
	},

	_handleLabelPositionUpdate: function(ix, pos) {
		/* If a label is dragged, update its position in the parent app */
		if (pos.dragged) {
			var values = clone(this.props.chartProps._annotations.labels.values);
			values[ix] = pos;
			var annotations = update(this.props.chartProps._annotations, { $merge: {
				labels: {
					values: values,
					hasDragged: this.props.chartProps._annotations.labels.hasDragged
				}
			}});
			ChartViewActions.updateChartProp("_annotations", annotations);
		/* Otherwise if undragged, update in XYLabls state */
		} else {
			var undragged = this.state.undraggedLabels;
			undragged[ix] = pos;
			this.setState(update(this.state, { $merge: {
				undraggedLabels: undragged
			}}));
			var labelYMax = this._getLabelYMax(undragged, this.props.dimensions.height);
			if (labelYMax !== this.props.labelYMax) {
				this.props.updateLabelYMax(labelYMax);
			}
		}
	},

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
	_getPrevUndraggedNode: function(ix, undraggedLabels) {
		if (ix < 0) {
			return null;
		}

		if (undraggedLabels[ix]) {
			return undraggedLabels[ix];
		} else {
			return this._getPrevUndraggedNode(ix - 1, undraggedLabels);
		}
	},

	render: function() {
		// create array of SvgRectLabel components
		var labels = this.props.chartProps._annotations.labels;
		var styleConfig = this.props.styleConfig;
		var displayConfig = this.props.displayConfig;
		var props = this.props;
		var dimensions = props.dimensions;

		var labelConfig = {
			xMargin: displayConfig.labelXMargin,
			textMargin: displayConfig.labelTextMargin,
			rowHeight: displayConfig.labelRowHeight,
			rectSize: displayConfig.labelRectSize
		};

		var labelComponents = [];
		if (this.props.chartProps.data.length > 1) {
			each(this.props.chartProps.data, bind(function(d, i) {
				var labelSettings = {};
				var prevNode = null;
				var chartSetting = this.props.chartProps.chartSettings[i];

				// Use existing positions if possible
				if (labels.values[i].dragged) {
					labelSettings = labels.values[i];
				} else {
					labelSettings = this.state.undraggedLabels[i];
					prevNode = this._getPrevUndraggedNode(i - 1, this.state.undraggedLabels);
				}

				scale = {
					yScale: props.yScale,
					xScale: props.xScale,
				};

				labelComponents.push(
					<SvgRectLabel
						key={i}
						text={chartSetting.label}
						labelConfig={labelConfig}
						dimensions={this.props.dimensions}
						index={i}
						enableDrag={this._enableDrag}
						onPositionUpdate={this._handleLabelPositionUpdate}
						editable={props.editable}
						offset={{ x: displayConfig.margin.left, y: 0}}
						colorIndex={chartSetting.colorIndex}
						settings={labelSettings}
						prevNode={prevNode}
						scale={scale}
					/>
				);
			}, this));
		}

		return (
			<g
				style={{ font: props.font }}
				ref="chartAnnotations"
				className="renderer-annotations"
				transform={"translate(" + [0, 0] + ")" }
			>
				{labelComponents}
			</g>
		);
	}

});

module.exports = XYRenderer;
