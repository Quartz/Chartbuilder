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
var filter              = require("lodash/filter");
var map                 = require("lodash/map");
var reduce              = require("lodash/reduce");
var some                = require("lodash/some");

var ChartRendererMixin  = require("../mixins/ChartRendererMixin.js");
var DateScaleMixin      = require("../mixins/DateScaleMixin.js");
var NumericScaleMixin   = require("../mixins/NumericScaleMixin.js");

// chart elements
// TODO: factor these into their own lib
var XYChart             = require("./XYChart.jsx");
var SvgWrapper          = require("../svg/SvgWrapper.jsx");
var LineSeries          = require("../series/LineSeries.jsx");
var LineMarkSeries      = require("../series/LineMarkSeries.jsx");
var BarSeries           = require("../series/BarSeries.jsx");
var MarkSeries          = require("../series/MarkSeries.jsx");
var VerticalAxis        = require("../shared/VerticalAxis.jsx");
var HorizontalAxis      = require("../shared/HorizontalAxis.jsx");
var VerticalGridLines   = require("../shared/VerticalGridLines.jsx");
var HorizontalGridLines = require("../shared/HorizontalGridLines.jsx");

// Flux actions
var ChartViewActions    = require("../../actions/ChartViewActions");

// Svg components
var SvgRectLabel        = require("../svg/SvgRectLabel.jsx");

// Helpers
var help                = require("../../util/helper.js");
var scaleUtils          = require("../../util/scale-utils.js");
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
		displayConfig: PropTypes.shape({
			margin: PropTypes.object.isRequired,
			padding: PropTypes.object.isRequired,
			labelRectSize: PropTypes.number.isRequired,
			afterLegend: PropTypes.number.isRequired
		}).isRequired,
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
		return {
			labelYMax: 0,
			tickWidths: this._getTickWidths(this.props.chartProps.scale)
		};
	},

	mixins: [ChartRendererMixin],

	_updateLabelYMax: function(labelYMax) {
		this.setState({ labelYMax: labelYMax });
	},

	// compute the max tick width for each scale
	_getTickWidths: function(scales) {
		return reduce(scaleNames, function(prev, key, i) {
			//TODO: fonts dynamically identified, or at least defined in config
			prev[key] = scaleUtils.getTickWidths(scales[key], "16px Khula-Light");
			return prev;
		}, {});
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({ tickWidths: this._getTickWidths(nextProps.chartProps.scale) });
	},

	_generateXAxis: function(scale, data, range) {
		if (scale.dateSettings) {
			return scaleUtils.generateScale("time", scale.dateSettings, data, range)
		} else if (scale.numericSettings) {
			return scaleUtils.generateScale("linear", scale.numericSettings, null, range)
		} else {
			return scaleUtils.generateScale("ordinal", null, data, range)
		}
	},

	_xAxisTextAnchor: function(chartProps) {
		var hasDate = (chartProps.scale.hasOwnProperty("dateSettings"));
		var hasNonCol = some(chartProps.chartSettings, function(setting) {
			return setting.type !== "column";
		});
		if (hasDate && hasNonCol) {
			return "start";
		} else {
			return "middle";
		}
	},

	_generateSeries: function(data, xScale, primaryScale, secondaryScale) {
		var pointsPerSeries = data[0].values.length;
		var colData = [];
		var colYScales = [];
		var colColors = [];
		var renderLinePoints = (pointsPerSeries < 10 && pointsPerSeries * data.length < 50);
		var series = map(data, function(d, i) {
			var yScale = (d.altAxis) ? secondaryScale : primaryScale;
			switch (d.type) {
				case 'line':
					if (renderLinePoints) {
						return (
							<LineMarkSeries key={i} yScale={yScale}
							data={d.values} colorIndex={d.colorIndex} />
						);
					} else {
						return (
							<LineSeries key={i} yScale={yScale}
							data={d.values} colorIndex={d.colorIndex} />
						);
					}
				case 'column':
					colData.push(d.values);
					colYScales.push(yScale);
					colColors.push(d.colorIndex);
					return null;
				case 'scatterPlot':
					return (
						<MarkSeries key={i} mark='circle' data={d.values}
							yScale={yScale} colorIndex={d.colorIndex} />
					);
				default:
					return null;
			}
		});
		if (colData.length > 0) {
			series.push(
				<BarSeries key="bar" data={colData}
					yScale={colYScales} colorIndex={colColors} />
			);
		}
		return series;
	},

	render: function() {
		var props = this.props;
		var _chartProps = this.props.chartProps;
		var displayConfig = this.props.displayConfig;
		var tickWidths = this.state.tickWidths;
		var scale = _chartProps.scale;
		var labelComponents;
		var hasTitle = (this.props.metadata.title.length > 0 && this.props.showMetadata);
		var tickTextHeight = help.computeTextWidth("M", "16px Khula-Light");

		// Maintain space between legend and chart area unless all legend labels
		// have been dragged
		var allLabelsDragged = reduce(_chartProps._annotations.labels.values, function(prev, value) {
			return (prev === true && value.dragged === true);
		}, true);

		var base_dimensions = xyDimensions(props.width, {
			displayConfig: displayConfig,
			enableResponsive: props.enableResponsive,
			metadata: props.metadata,
			allLabelsDragged: allLabelsDragged
		});

		var extraHeight = (base_dimensions.height * this.state.labelYMax)
		var chartAreaTranslateY = extraHeight;

		var outerDimensions = {
			width: base_dimensions.width,
			height: base_dimensions.height + extraHeight
		};

		// TODO: way of doing this cleaner?
		if (!allLabelsDragged) {
			chartAreaTranslateY += displayConfig.afterLegend;
		} else {
			outerDimensions.height -= displayConfig.afterLegend;
		}

		// apply `chartSettings` to data
		// TODO: possibly not necessary wo d4
		var dataWithSettings = this._applySettingsToData(_chartProps);

		// Dimensions of the chart area
		var chartAreaDimensions = {
			width: (
				base_dimensions.width -
				displayConfig.margin.left - displayConfig.margin.right -
				displayConfig.padding.left - displayConfig.padding.right -
				tickWidths.primaryScale.max - tickWidths.secondaryScale.max
			),
			height: (
				base_dimensions.height -
				displayConfig.margin.top - displayConfig.margin.bottom -
				displayConfig.padding.top - displayConfig.padding.bottom
			)
		};

		var yRange = [chartAreaDimensions.height, 0];
		var xRange = [0, chartAreaDimensions.width];
		var xAxis = this._generateXAxis(scale, _chartProps.data, xRange);
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

		var series = this._generateSeries(dataWithSettings, xAxis.scale, yAxisPrimary.scale, yAxisSecondary.scale);

		if (this.props.enableResponsive && _chartProps.hasOwnProperty("mobile") && this.props.isSmall) {
			if (_chartProps.mobile.scale) {
				scale = assign({}, _chartProps.scale, _chartProps.mobile.scale);
			} else {
				scale = _chartProps.scale;
			}
		} else {
			scale = _chartProps.scale;
		}
		// compute margin based on existence of labels and title, based on default
		// margin set in config
		var labels = _chartProps._annotations.labels;

		// Create array of chart-specific components that will be passed to the Svg
		// chart template, which adds title/credit/source etc
		return (
			<SvgWrapper
				outerDimensions={outerDimensions}
				metadata={this.props.metadata}
				displayConfig={displayConfig}
			>
				<XYChart
					chartType="xy"
					dimensions={chartAreaDimensions}
					editable={this.props.editable}
					xScale={xAxis.scale}
					yScale={yAxisPrimary.scale}
					translate={[tickWidths.primaryScale.max, chartAreaTranslateY]}
				>
					<VerticalGridLines tickValues={xAxis.tickValues} />
					<HorizontalGridLines tickValues={scale.primaryScale.tickValues} />
					{series}
					<HorizontalAxis
						tickFormat={xAxis.tickFormat}
						tickValues={xAxis.tickValues}
						textAnchor={this._xAxisTextAnchor(_chartProps)}
						orient="bottom"
						scale={xAxis.scale}
					/>
					{verticalAxes}
				</XYChart>
				<XYLabels
					key="xy-labels"
					chartProps={_chartProps}
					allLabelsDragged={allLabelsDragged}
					dimensions={chartAreaDimensions}
					editable={this.props.editable}
					displayConfig={displayConfig}
					styleConfig={this.props.styleConfig}
					tickWidths={tickWidths}
					xScale={xAxisLinear.scale}
					yScale={yAxisPrimary.scale}
					data={dataWithSettings}
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
		data: PropTypes.arrayOf(PropTypes.object).isRequired,
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
						allLabelsDragged={this.props.allLabelsDragged}
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
