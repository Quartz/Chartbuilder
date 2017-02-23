/*
 * ### RendererWrapper.jsx
 * Wrapper element for Chartbuilder renderers. The main task of this component
 * is to identify the appropriate renderer and pass in the width of its
 * container.
*/

const React = require("react");
const ReactDOM = require("react-dom");
const PropTypes = React.PropTypes;

var ChartViewActions = require("../actions/VisualViewActions");
var convertConfig = require("../util/parse-config-values");
var SessionStore = require("../stores/SessionStore");
var breakpoints = require("../config/chartconfig/chart-breakpoints");
var BackgroundRect = require("./svg/BackgroundRect.jsx");
var ChartFooter = require("./svg/ChartFooter.jsx");

import {assign, clone, isDate, isEqual, throttle, reduce, keys, update, filter, find} from 'lodash';

const SvgText = require("./svg/SvgText.jsx");

/*
 * `chartConfig` is an object that sets default properties for chart types, and
 * also associates a given chart type with its Editor and Renderer components.
 * Used here to identify the Renderer.
*/

const chartConfigs = require("../charts/charts/chart-config");
const chartStyle = require("../config/chartconfig/chart-style");
const chartRenderers = require("../charts/charts/renderers");

const mapConfigs = require("../charts/maps/map-config");
const mapStyle = require("../config/mapconfig/map-style");
const mapRenderers = require("../charts/maps/renderers");

/**
 * ### RendererWrapper
 * Wrapper component that determines which type of chart to render, wrapping it
 * in Svg and telling it to draw.
*/
const RendererWrapper = React.createClass({

	propTypes: {
		model: PropTypes.shape({
			chartProps: PropTypes.object.isRequired,
			metadata: PropTypes.object.isRequired
		}),
		width: PropTypes.number,
		enableResponsive: PropTypes.bool,
		showMetadata: PropTypes.bool,
		showLegenddata: PropTypes.bool,
		className: PropTypes.string,
		svgClassName: PropTypes.string
	},

	// don't render incoming chart if there are errors in parsing
	shouldComponentUpdate: function(nextProps, nextState) {
		if (!nextProps.model.errors) {
			return true;
		} else if (!nextProps.model.errors.valid) {
			return false;
		}
		return true;
	},

	getInitialState: function() {
		return {
			domNodeWidth: null,
			extraHeight: 0,
			emSize: null,
			svgSizeClass: null,
			chartConfig: {},
			styleConfig: {}
		};
	},
	componentWillReceiveProps: function(nextProps) {
		const newType = nextProps.model.metadata.chartType;
		const prevType = this.props.model.metadata.chartType;
		if (newType !== prevType) {
			const chartConfig = convertConfig(chartConfigs[newType] || mapConfigs[newType], null, this.state.emSize, this.state.domNodeWidth);
			this.setState({ chartConfig: chartConfig });
		}
	},

	componentWillMount: function() {
		//var chartType = this.props.model.metadata.chartType;
		var size_calcs = {};
		// set chart breakpoints
		if (this.props.width) {
			var bp = breakpoints.getBreakpointObj(this.props.enableResponsive, this.props.width);
			size_calcs = this._resizeUpdate(this.props, bp, this.props.width);
		}

		var chartProps = null;
		// process date strings as dates
		// TODO: why do we need this again?
		if (this.props.model.chartProps.scale.hasDate && !this.props.editable) {
			var _chartProps = clone(this.props.model.chartProps, true);
			var newData = _chartProps.data.map(function(d) {
				d.values = d.values.map(function(val) {
					if (!isDate(val.entry)) {
						val.entry = new Date(val.entry);
					}
					return val;
				});
				return d;
			});
			_chartProps.data = newData;
			chartProps = _chartProps;
		}
		var state = assign({}, { chartProps: chartProps }, size_calcs);
		this.setState(state);
	},

	// method for updating configs and breakpoints when width changes
	_resizeUpdate: function(props, bp, domNodeWidth) {
		const chartType = props.model.metadata.chartType;
		const visualType = this.props.model.chartType;
		const visualConfig = chartConfigs[chartType] || mapConfigs[chartType];
		const visualStyle = (visualType === 'map') ? mapStyle : chartStyle;

		return {
			domNodeWidth: domNodeWidth,
			emSize: bp.em_size,
			svgSizeClass: bp.class_name,
			chartConfig: convertConfig(visualConfig, null, bp.em_size, domNodeWidth),
			styleConfig: convertConfig(visualStyle, null, bp.em_size, domNodeWidth)
		};
	},

	// check for a new width and update everything if it has changed
	_updateWidth: function() {
		var domNodeWidth = ReactDOM.findDOMNode(this).offsetWidth;
		var bp = breakpoints.getBreakpointObj(this.props.enableResponsive, domNodeWidth);
		if (domNodeWidth !== this.state.domNodeWidth) {
			var resized = this._resizeUpdate(this.props, bp, domNodeWidth);
			if (resized) {
				this.setState(resized);
			}
		}
	},

	// add resize listener if chart is responsive
	componentDidMount: function() {
		if (this.props.enableResponsive) {
			this._updateWidth(true);
			this._updateWidth = throttle(this._updateWidth, 50);
			window.addEventListener("resize", this._updateWidth);
		}
	},

	// remove resize listener on unmount
	componentWillUnmount: function() {
		if (this.props.enableResponsive) {
			window.removeEventListener("resize", this._updateWidth);
		}
	},

	// TODO: remove this feature? seems never used
	_getMobileMetadata: function(metadata, mobileSettings) {
		var setMobile = reduce(keys(metadata), function(obj, key) {
			if (mobileSettings[key] && mobileSettings[key] !== "") {
				obj[key] = mobileSettings[key];
				return obj;
			} else {
				obj[key] = metadata[key];
				return obj;
			}
		}, {});
		return setMobile;
	},

	render: function() {

		const chartType = this.props.model.metadata.chartType;
		const width = this.props.width || this.state.domNodeWidth;

		let displayConfig = this.state.chartConfig.display;
		const svgClassName = this.props.svgClassName || '';

		if (!width) {
			return <div style={{ width: "100%" }}></div>;
		}

		// Reduce padding and margin if metadata is not shown
		// this is used for the embed. should be removable if/once we render
		// metadata with HTML
		if (this.props.showMetadata === false) {
			var _padding = {
				top: displayConfig.padding.top,
				right: displayConfig.padding.right,
				bottom: displayConfig.bottomPaddingWithoutFooter,
				left: displayConfig.padding.left,
			};
			var _margin = {
				top: displayConfig.margin.top,
				right: 3,
				bottom: 3,
				left: 3
			};
			displayConfig = update(displayConfig, { $merge: {
				padding: _padding,
				margin: _margin
			}});
		}

/*
<<<<<<< HEAD
		let extraHeight = this.state.extraHeight;
		// reduce margin if only one legend
		if (this.props.model.chartProps.legend || this.props.model.metadata.subtitle) {
			if (Object.keys(this.props.model.chartProps.legend).length === 1) {

				if (this.props.model.metadata.subtitle.length > 0) {
					extraHeight = -5;
				}
				else {
					extraHeight = -20;
				}
				const _padding = {
					top: displayConfig.padding.top,
					right: displayConfig.padding.right,
					bottom: displayConfig.bottomPaddingWithoutFooter,
					left: displayConfig.padding.left,
					maptop: displayConfig.margin.maptop
				};
				const _margin = {
					top: displayConfig.margin.top,
					right: 3,
					bottom: 0,
					left: displayConfig.margin.left,
					maptop: displayConfig.margin.maptop
				};
				displayConfig = update(displayConfig, { $merge: {
					padding: _padding,
					margin: _margin
				}});
			}
			else if (this.props.model.metadata.subtitle.length > 0) {
				extraHeight = 15;
				const _padding = {
					top: displayConfig.padding.top,
					right: displayConfig.padding.right,
					bottom: displayConfig.bottomPaddingWithoutFooter,
					left: displayConfig.padding.left,
					maptop: displayConfig.margin.maptop
				};
				const _margin = {
					top: displayConfig.margin.top,
					right: 3,
					bottom: 0,
					left: displayConfig.margin.left,
					maptop: displayConfig.margin.maptop
				};
				displayConfig = update(displayConfig, { $merge: {
					padding: _padding,
					margin: _margin
				}});
			}
		}

		const dimensions = this._calculateDimensions(width, displayConfig, extraHeight);

		try {
			if (isNaN(dimensions.width)) {
				throw new TypeError("In RendererWrapper, `dimensions.height` must be a number");
			}
			if (isNaN(dimensions.height)) {
				throw new TypeError("In RendererWrapper, `dimensions.width` must be a number");
			}
		} catch (e) {
			console.error(e.name, e.message);
		}

		const Renderer = chartRenderers[chartType] || mapRenderers[chartType];
		//const Config = chartConfigs[chartType] || mapConfigs[chartType];

		let chartProps;
		let metadata;
=======*/

		const Renderer = chartRenderers[chartType] || mapRenderers[chartType];
		var chartProps;
		var metadata;
//>>>>>>> 310aa57e0c9c3c3ece031f916b1b97cc724f4d03

		// If rendered chart is not editable and has a date, we presume data is
		// being passed in and we need to use the data with processed dates
		if (this.props.model.chartProps.scale.hasDate && !this.props.editable) {
			chartProps = this.state.chartProps;
		} else {
			chartProps = this.props.model.chartProps;
		}

		const isSmall = (this.state.svgSizeClass === "small");

		// override metadata with mobile-specific settings if defined
		// TODO: remove this feature? seems never used
		if (this.props.enableResponsive && this.props.model.chartProps.mobile && isSmall) {
			metadata = this._getMobileMetadata(this.props.model.metadata, this.props.model.chartProps.mobile);
		} else {
			metadata = this.props.model.metadata;
		}

		const metadataSvg = [];
		const legends = [];

		/*const margin = this.state.chartConfig.display.margin;
		const stylings = chartProps.stylings;


		const translate = {
			top: margin.top,
			//right: dimensions.width - margin.right,
			//bottom: dimensions.height - margin.bottom,
			left: margin.left
		};

		if (this.props.showLegenddata) {
			translate.legendleft = margin.legendleft;

			if (this.props.model.metadata.subtitle) {
				if (this.props.model.metadata.subtitle.length > 0) {
					translate.legendsOneRow = margin.legendsOneRow + 35;
					translate.legendsTwoRow = margin.legendsTwoRow + 35;
				}
			} else {
				translate.legendsOneRow = margin.legendsOneRow;
				translate.legendsTwoRow = margin.legendsTwoRow;
			}

			const legendsArray = Object.keys(chartProps.legend).map((k) => chartProps.legend[k]);

			legends.push(
					<LegendSpace
						key="legend"
						translate={translate}
						className="svg-legend-space"
						chartProps={chartProps}
						stylings={stylings}
						metadata={metadata}
						legendsArray={legendsArray}
						dimensions={dimensions}
						displayConfig={displayConfig}
						chartWidth={dimensions.width - margin.left - margin.right}
					/>
				)
		}



			if (chartProps.visualType === 'map') {

			}

		const clippingPath = (
			<clipPath id="ellipse-clip">
				<rect
					x='0.8em'
					y='0.6em'
					width={620}
					height={360}
				/>
			</clipPath>)*/
		return (
			<div className={["renderer-wrapper", this.state.svgSizeClass, this.props.className].join(" ")}>

					<Renderer
						width={width}
						//clippingPath={clippingPath}
						extraHeight={this.state.extraHeight}
						chartProps={chartProps}
						isSmall={isSmall}
						displayConfig={displayConfig}
						styleConfig={this.state.styleConfig}
						showMetadata={this.props.showMetadata}
						metadata={metadata}
						editable={this.props.editable}
						enableResponsive={this.props.enableResponsive}
					/>
					{legends}
					{metadataSvg}
			</div>
		);
	}

});

module.exports = RendererWrapper;
