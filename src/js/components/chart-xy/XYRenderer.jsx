// Render an XY chart (line, column, scatterplot). It allows mixed charts
// combining any of these types, as well as time series

// React
var React = require("react");
var ReactDOM = require("react-dom");
var PureRenderMixin = require("react-addons-pure-render-mixin");
var PropTypes = React.PropTypes;
var update = require("react-addons-update");

// Node modules
var d3 = require("d3");
var d4 = require("d4");

var assign = require("lodash/assign");
var bind = require("lodash/bind");
var clone = require("lodash/clone");
var each = require("lodash/each");
var filter = require("lodash/filter");
var map = require("lodash/map");
var reduce = require("lodash/reduce");
var some = require("lodash/some");

var ChartRendererMixin = require("../mixins/ChartRendererMixin.js");
var DateScaleMixin = require("../mixins/DateScaleMixin.js");
var NumericScaleMixin = require("../mixins/NumericScaleMixin.js");


// Flux actions
var ChartViewActions = require("../../actions/ChartViewActions");

// Svg components
var SvgRectLabel = require("../svg/SvgRectLabel.jsx");
var HiddenSvg = require("../svg/HiddenSvg.jsx");

// Helpers
var cb_xy = require("../../charts/cb-charts").cb_xy;
var help = require("../../util/helper.js");

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
			maxTickWidth: {
				primaryScale: 0,
				secondaryScale: 0
			}
		};
	},

	mixins: [ChartRendererMixin],

	_handleMaxTickWidth: function(k, v) {
		var maxTickWidth = this.state.maxTickWidth;
		maxTickWidth[k] = v;
		this._handleStateUpdate("maxTickWidth", maxTickWidth);
	},

	_updateLabelYMax: function(labelYMax) {
		this.setState({ labelYMax: labelYMax });
	},

	// Determine how far down vertically the labels should be placed, depending
	// on presence (or not) of a title
	_getYOffset: function(props, hasTitle) {
		if (hasTitle) {
			return props.displayConfig.margin.top + props.displayConfig.afterTitle;
		} else {
			return props.displayConfig.margin.top;
		}
	},

	componentWillReceiveProps: function(nextProps) {
		if (nextProps.chartProps._numSecondaryAxis === 0) {
			var maxTickWidth = this.state.maxTickWidth;
			maxTickWidth.secondaryScale = 0;
			this.setState({ maxTickWidth: maxTickWidth });
		}
	},

	render: function() {
		var _chartProps = this.props.chartProps;
		var displayConfig = this.props.displayConfig;
		var axis = d3.svg.axis();
		var axisTicks = [];
		var labelComponents;
		var dimensions = this.props.dimensions;
		var hasTitle = (this.props.metadata.title.length > 0 && this.props.showMetadata);
		var yOffset = this._getYOffset(this.props, hasTitle);

		// Maintain space between legend and chart area unless all legend labels
		// have been dragged
		var allLabelsDragged = reduce(_chartProps._annotations.labels.values, function(prev, value) {
			return (prev === true && value.dragged === true);
		}, true);

		// Dimensions of the chart area
		var chartAreaDimensions = {
			width: (
				dimensions.width -
				displayConfig.margin.left - displayConfig.margin.right -
				displayConfig.padding.left - displayConfig.padding.right -
				this.state.maxTickWidth.primaryScale - this.state.maxTickWidth.secondaryScale
			),
			height: (
				dimensions.height -
				displayConfig.margin.top - displayConfig.margin.bottom -
				displayConfig.padding.top - displayConfig.padding.bottom
			)
		};

		if (this.props.enableResponsive && _chartProps.hasOwnProperty("mobile") && this.props.isSmall) {
			if (_chartProps.mobile.scale) {
				scale = assign({}, _chartProps.scale, _chartProps.mobile.scale);
			} else {
				scale = _chartProps.scale;
			}
		} else {
			scale = _chartProps.scale;
		}

		// apply `chartSettings` to data
		var dataWithSettings = this._applySettingsToData(_chartProps);
		// compute margin based on existence of labels and title, based on default
		// margin set in config
		var labels = _chartProps._annotations.labels;

		// compute the max tick width for each scale
		each(scaleNames, function(scaleKey) {
			var currScale = scale[scaleKey];

			if (currScale) {
				// get the tick values so that we can pass them both to the actual chart
				// renderer and to the component that will render hidden ticks
				var tickValues = currScale.tickValues;

				var skipFirstNode = filter(tickValues, function(d) {
					return (d !== currScale.domain[1]);
				});

				var formattedTicks = map(skipFirstNode, function(tick) {
					return help.roundToPrecision(tick, currScale.precision);
				});

				axisTicks.push({
					name: scaleKey,
					tickValues: tickValues,
					formattedTicks: formattedTicks,
					precision: currScale.precision,
					max: currScale.domain[1]
				});
			}
		}, this);

		// Render hidden y-axis ticks in order to compute the maxTickWidth
		// independent of rendering the chart itself, this is needed to set the
		// appropriate padding for the chart. We must do this for each y-axis.
		var HiddenAxes = map(axisTicks, bind(function(axis, i) {
			return (
				<HiddenSvg.HiddenSvgAxis
					className="tick"
					chartWidth={dimensions.width}
					maxTickWidth={this.state.maxTickWidth[axis.name]}
					formattedText={axis.formattedTicks}
					blockerRectOffset={this.props.displayConfig.blockerRectOffset}
					key={i}
					onUpdate={this._handleMaxTickWidth.bind(null, axis.name)}
				/>
			);
		}, this));

		if (this.state.maxTickWidth.primaryScale <= 0) {
			// We have not yet calculated maxTickWidth
			return (
				<g>{HiddenAxes}</g>
			);
		}

		// Create array of chart-specific components that will be passed to the Svg
		// chart template, which adds title/credit/source etc
		return (
			<g>
				<XYChart
					key="xy-chart"
					chartProps={_chartProps}
					allLabelsDragged={allLabelsDragged}
					hasTitle={hasTitle}
					yOffset={yOffset}
					displayConfig={this.props.displayConfig}
					styleConfig={this.props.styleConfig}
					data={dataWithSettings}
					dimensions={dimensions}
					scale={scale}
					chartAreaDimensions={chartAreaDimensions}
					metadata={this.props.metadata}
					labelYMax={this.state.labelYMax}
					maxTickWidth={this.state.maxTickWidth}
					axisTicks={axisTicks}
				/>
				<XYLabels
					key="xy-labels"
					chartProps={_chartProps}
					allLabelsDragged={allLabelsDragged}
					displayConfig={this.props.displayConfig}
					styleConfig={this.props.styleConfig}
					chartAreaDimensions={chartAreaDimensions}
					data={dataWithSettings}
					hasTitle={hasTitle}
					yOffset={yOffset}
					scale={scale}
					editable={this.props.editable}
					maxTickWidth={this.state.maxTickWidth}
					dimensions={dimensions}
					updateLabelYMax={this._updateLabelYMax}
					labelYMax={this.state.labelYMax}
				/>
				{HiddenAxes}
			</g>
		);
	}
});

/**
 * ### Component that renders the XY chart area (not annotations)
 * See `React.PropTypes` declaration:
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
 *   maxTickWidth: PropTypes.object,
 *   axisTicks: PropTypes.array
 * },
 * @instance
 * @memberof XYRenderer
 */
var XYChart = React.createClass({

	propTypes: {
		chartProps: PropTypes.object.isRequired,
		hasTitle: PropTypes.bool.isRequired,
		yOffset: PropTypes.number.isRequired,
		displayConfig: PropTypes.object.isRequired,
		styleConfig: PropTypes.object.isRequired,
		data: PropTypes.arrayOf(PropTypes.object).isRequired,
		dimensions: PropTypes.shape({
			width: PropTypes.number,
			height: PropTypes.number
		}).isRequired,
		scale: PropTypes.object.isRequired,
		chartAreaDimensions: PropTypes.object,
		metadata: PropTypes.object,
		labelYMax: PropTypes.number,
		maxTickWidth: PropTypes.object,
		axisTicks: PropTypes.array
	},

	getInitialState: function() {
		return {
			paddingTop: 0,
			labelsDragged: false
		}
	},

	mixins: [ DateScaleMixin, NumericScaleMixin ],

	componentDidMount: function() {
		// Draw chart once mounted
		var el = ReactDOM.findDOMNode(this);

		if (this.props.chartProps.data.length === 0) {
			return;
		} else {
			// On component mount, delete any existing chart
			if (el.childNodes[0]) {
				el.removeChild(el.childNodes[0]);
			}
			drawXY(el, this._getChartState(this.props));
		}
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		// always update by redrawing the chart
		var el = ReactDOM.findDOMNode(this);
		drawXY(el, this._getChartState(nextProps));
		return false;
	},

	_getChartState: function(props) {
		// Generate and return the state needed to draw the chart. This is what will
		// passed to the d4/d3 draw function.
		var dateSettings;
		var numericSettings;
		if (props.chartProps.scale.hasDate) {
			dateSettings = this.generateDateScale(props);
		}
		else if (props.chartProps.scale.isNumeric) {
			numericSettings = this.generateNumericScale(props)
		}

		var computedPadding = computePadding(props);
		var hasColumn = some(props.chartProps.chartSettings, function(setting) {
			return setting.type == "column";
		});

		return {
			chartRenderer: cb_xy(),
			styleConfig: props.styleConfig,
			displayConfig: props.displayConfig,
			dateSettings: dateSettings,
			numericSettings: numericSettings,
			maxTickWidth: props.maxTickWidth,
			hasColumn: hasColumn,
			axisTicks: props.axisTicks,
			dimensions: props.dimensions,
			data: props.data,
			padding: computedPadding,
			chartProps: props.chartProps,
			scale: props.scale
		};
	},

	render: function() {
		// empty <svg:g> that will be drawn into using `ReactDOM.findDOMNode(this)`
		return (
			<g className="renderer-chart">
			</g>
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
 *   axisTicks: PropTypes.array
 * },
 * @instance
 * @memberof XYRenderer
 */
var XYLabels = React.createClass({

	propTypes: {
		chartProps: PropTypes.object.isRequired,
		editable: PropTypes.bool,
		hasTitle: PropTypes.bool.isRequired,
		displayConfig: PropTypes.object.isRequired,
		styleConfig: PropTypes.object.isRequired,
		data: PropTypes.arrayOf(PropTypes.object).isRequired,
		dimensions: PropTypes.shape({
			width: PropTypes.number,
			height: PropTypes.number
		}).isRequired,
		scale: PropTypes.object.isRequired,
		chartAreaDimensions: PropTypes.object,
		metadata: PropTypes.object,
		labelYMax: PropTypes.number,
		updateLabelYMax: PropTypes.func,
		maxTickWidth: PropTypes.object,
		axisTicks: PropTypes.array
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

	_computePadding: function(props) {
		return computePadding(props)
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
		var padding = computePadding(props);

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

				var scales = this.props.scale;
				yScale_info = !chartSetting.altAxis ? scales.primaryScale : scales.secondaryScale;
				xScale_info = xScaleInfo(this.props.dimensions.width,padding,styleConfig,displayConfig,{dateSettings: this.state.dateScaleInfo});

				var yRange = [
					this.props.dimensions.height - padding.bottom - displayConfig.margin.bottom,
					padding.top + displayConfig.margin.top
				];

				var xRange = props.chartProps.scale.hasDate ? [
					padding.left + displayConfig.margin.left + this.props.maxTickWidth.primaryScale,
					xScale_info.rangeR-padding.right-displayConfig.margin.right-this.props.maxTickWidth.secondaryScale - displayConfig.minPaddingOuter
				] : [];

				scale = {
					y: {
						domain: yScale_info.domain,
						range: yRange
					},
					x: {
						domain: xScale_info.domain ? xScale_info.domain : [],
						range: xRange
					}
				};

				labelComponents.push(
					<SvgRectLabel
						key={i}
						allLabelsDragged={this.props.allLabelsDragged}
						text={chartSetting.label}
						labelConfig={labelConfig}
						dimensions={this.props.chartAreaDimensions}
						index={i}
						enableDrag={this._enableDrag}
						onPositionUpdate={this._handleLabelPositionUpdate}
						editable={props.editable}
						offset={{ x: displayConfig.margin.left, y: this.props.yOffset}}
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
				transform={"translate(" + [displayConfig.margin.left, this.props.yOffset] + ")" }
			>
				{labelComponents}
			</g>
		);
	}

});

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

var xy_render_options = {
	axis : {
		afterRender: function(feature,data,chartArea,selection,isPrimary) {
			/* SO HERES THE DEAL
			// this is a lot of effort to customize axes
			// what we do at Quartz instead of this is build
			// our own d3 that draws axes exactly how we want them
			// If you're getting serious about customization,
			// I suggest you do the same.
			*/
			var chart = this;
			var ticks = selection.selectAll(".tick");
			var text = ticks.selectAll("text");
			var max = d3.max(this.y.domain());

			ticks.classed("zero", function(d) {
				return (d === 0);
			});

			if (isPrimary) {
				var maxTick = ticks.filter(function(d) {
					return (d === max);
				});
				var maxTickRect = maxTick.selectAll("rect").data([0]).enter().append("rect");
				var maxTickText = maxTick.select("text");
				var textNode = maxTickText.node();
				var bcr = textNode.getBoundingClientRect();
				var width = bcr.width;
				var x = parseFloat(textNode.getAttribute("x"));
				var newX = x;
				if (width + (-x) > chart.width - 12) {
					newX = width - chart.width + chart.margin.left + 12;
					maxTickText.attr("x", newX);
				}
				maxTick.select("rect").attr({
					x: newX - width,
					y: (-1 * bcr.height / 2),
					width: width + 6,
					height: bcr.height
				});
				maxTickText.moveToFront();
			}
		}
	}
}

function drawXY(el, state) {
	var chartProps = state.chartProps;
	var dateSettings = state.dateSettings;
	var numericSettings = state.numericSettings;
	var displayConfig = state.displayConfig;
	var styleConfig = state.styleConfig;
	var hasOtherAxis = chartProps._numSecondaryAxis > 0;
	var scale = state.scale;
	//var borderSpace = help.combineMarginPadding(chartProps.margin,chartProps.padding);

	// set the `extraPadding` based on pre-computed `maxTickWidth` values,
	// generated by the `HiddenAxes` component
	var extraPadding = {
		top: chartProps.extraPadding.top,
		right: Math.max(state.maxTickWidth.secondaryScale, displayConfig.minPaddingOuter),
		bottom: chartProps.extraPadding.bottom,
		left: state.maxTickWidth.primaryScale
	};

	var mixouts = chartProps._numSecondaryAxis ? [] : ["rightAxis"]

	var xyChart = state.chartRenderer
		.outerWidth(state.dimensions.width)
		.outerHeight(state.dimensions.height)
		.margin(displayConfig.margin)
		.padding(state.padding)
		.extraPadding(extraPadding)
		.mixout("series-label")
		.using("leftAxis", function(axis){
			yAxisUsing.call(this,"primary",axis,el,state)
		})
		.x(function(x) {
			x.key("entry");
			var o = xScaleInfo(this.width,this.padding,styleConfig,displayConfig,state);
			if (state.dateSettings) {
				x.scale("time");
				x.domain(o.domain);
				x.range([o.rangeL, o.rangeR]);
			}
			else if (state.numericSettings) {
				x.scale("linear");
				x.clamp(false)
				x.domain(o.domain);
				x.range([o.rangeL, o.rangeR]);
			}
		})
		.y(function(y) {
			y.key("value")
				.domain(scale.primaryScale.domain)
				.range([this.height - this.padding.bottom, state.padding.top])
		})
		.left(function(y) {
			y.key("value")
				.domain(scale.primaryScale.domain)
				.range([this.height - this.padding.bottom, state.padding.top])
		})
		.using("rightAxis", function(axis){
			yAxisUsing.call(this,"secondary",axis,el,state)
		})
		.chartAreaOnTop(false)
		.using("xAxis", function(axis) {

			axis.beforeRender(function(data) {
				// Center ticks if all data series are columns
				var numColumns = filter(data, function(d) {
					return d.type === "column";
				}).length;

				// Don't display the x axis grid tick if all series are columns
				if (numColumns === data.length) {
					axis.innerTickSize(styleConfig.overtick_bottom);
				} else {
					axis.innerTickSize(styleConfig.overtick_bottom);
					this.container.selectAll(".xAxis .tick").attr("data-anchor", "start");
				}
			});

			if (dateSettings) {
				var curOffset = Date.create().getTimezoneOffset()
				axis.tickValues(dateSettings.dateTicks);
				var displayTZ = state.chartProps.scale.dateSettings.displayTZ;
				var inputOffset = state.chartProps.scale.dateSettings.inputTZ ? -help.TZOffsetToMinutes(state.chartProps.scale.dateSettings.inputTZ) : curOffset;
				var timeOffset = 0;
				axis.tickFormat(function(d,i) {

					if(displayTZ === "as-entered") {
						timeOffset = curOffset - inputOffset;
					}

					return dateSettings.dateFormatter(d.clone(),i,timeOffset);
				});
			}

			if(numericSettings) {
				axis.tickValues(numericSettings.tickValues)
				axis.tickFormat(function(d,i) {
					return (i == 0 ? numericSettings.prefix : "") +  help.roundToPrecision(d, numericSettings.precision);
				})

			}

		})
		.using("x-axis-label", function(label) {
			label.beforeRender(function(data){
					return [{
						ypos: numericSettings ? state.dimensions.height - state.padding.bottom + state.styleConfig.overtick_bottom : 0,
						xval: numericSettings ? scale.numericSettings.domain[0] : 0,
						text: numericSettings ? numericSettings.suffix : "",
						dy: "1.6em"
					}]
				})

		});

		if (chartProps._numSecondaryAxis > 0) {
			xyChart.right(function(y) {
				y.key("value")
					.domain(scale.secondaryScale.domain)
					.range([this.height - this.padding.bottom, state.padding.top])
				}
			);
		}

	d3.select(el)
		.datum(state.data)
		.call(xyChart);
}

function xScaleInfo(width, padding, styleConfig, displayConfig, state) {
	var hasMultipleYAxes = false
	if(state.secondaryScale) {
		hasMultipleYAxes = true;
	}
	if (state.chartProps && state.chartProps._numSecondaryAxis) {
		hasMultipleYAxes = true;
	}

	var domain = null
	if(state.dateSettings) {
		domain = state.dateSettings.domain;
	}
	else if (state.numericSettings){
		domain = state.numericSettings.domain;
	}

	var o = {
		rangeL: padding.left + styleConfig.xOverTick,
		rangeR: width - padding.right - (hasMultipleYAxes ? styleConfig.xOverTick : 0),
		domain: domain
	}

	if (state.hasColumn) {
		var numData = state.chartProps.data[0].values.length;
		var widthPerColumn = width / numData;
		o.rangeL += (widthPerColumn * displayConfig.columnPaddingCoefficient);
		o.rangeR -= (widthPerColumn * displayConfig.columnPaddingCoefficient);
	}
	return o;
}

function yAxisUsing(location, axis, el, state) {
	var chartProps = state.chartProps;
	var isPrimary = location == "primary"
	var scale = isPrimary ? state.scale.primaryScale : state.scale.secondaryScale;
	var hasOtherAxis = chartProps._numSecondaryAxis > 0;
	var scaleId = isPrimary ? "left" : "right";

	if(!hasOtherAxis && !isPrimary) {
		axis.render = function() {
			this.container.selectAll(".right.axis").remove();
		}
		state.chartProps.extraPadding.right = 0;
		return null;
	}

	// axis tick values have been computed by parent compnent in order to draw
	// hidden axes, so we pass them in here
	var axisTicks = isPrimary ? state.axisTicks[0] : state.axisTicks[1];
	axis.tickValues(axisTicks.tickValues);

	// format using our precision and suffix/prefix
	axis.tickFormat(function(d) {
		if (d == axisTicks.max) {
			return [
				scale.prefix,
				help.roundToPrecision(d, scale.precision),
				scale.suffix
			].join("");
		} else {
			return help.roundToPrecision(d, scale.precision);
		}
	});

	axis.afterRender(function(feature,data,chartArea,selection) {
		this.container.select(".axis." + scaleId).selectAll(".tick text")
			.attr("data-color-index", scale.colorIndex);

		xy_render_options.axis.afterRender.call(this,feature,data,chartArea,selection,isPrimary);
	});

	var innerTickSize;
	if (isPrimary) {
		innerTickSize = this.width - this.padding.left - this.padding.right;
		if (hasOtherAxis) {
			innerTickSize -= state.displayConfig.blockerRectOffset;
		}
	} else {
		innerTickSize = 0;
	}

	axis.innerTickSize( innerTickSize );
	axis.scaleId(scaleId);
}

function computePadding(props) {
	var labels = props.chartProps._annotations.labels;
	var displayConfig = props.displayConfig;
	var _top = (props.labelYMax * props.chartAreaDimensions.height) + displayConfig.afterLegend;

	if (props.hasTitle) {
		_top += displayConfig.afterTitle;
	}

	// Reduce top padding if all labels or dragged or there is only one series,
	// meaning no label will be shown
	if (props.allLabelsDragged || props.chartProps.data.length === 1) {
		_top -= displayConfig.afterLegend;
	}

	return {
		top: _top,
		right: displayConfig.padding.right,
		bottom: displayConfig.padding.bottom,
		left: displayConfig.padding.left
	};
}

module.exports = XYRenderer;
