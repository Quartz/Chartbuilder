/*
 * ### RendererWrapper.jsx
 * Wrapper element for Chartbuilder renderers. The main task of this component
 * is to identify the appropriate renderer and pass in the width of its
 * container.
*/

const React = require("react");
const ReactDOM = require("react-dom");
const PropTypes = React.PropTypes;

const ChartViewActions = require("../actions/VisualViewActions");
const convertConfig = require("../util/parse-config-values");
const SessionStore = require("../stores/SessionStore");
const breakpoints = require("../config/chartconfig/chart-breakpoints");
const BackgroundRect = require("./svg/BackgroundRect.jsx");
const ChartFooter = require("./svg/ChartFooter.jsx");

import {assign, clone, isDate, isEqual, throttle, reduce, keys, update, filter, find} from 'lodash';

//const SvgText = require("./svg/SvgText.jsx");

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
		let size_calcs = {};
		// set chart breakpoints
		if (this.props.width) {
			const bp = breakpoints.getBreakpointObj(this.props.enableResponsive, this.props.width);
			size_calcs = this._resizeUpdate(this.props, bp, this.props.width);
		}

		let chartProps = null;
		// process date strings as dates
		// TODO: why do we need this again?
		if (this.props.model.chartProps.scale.hasDate && !this.props.editable) {
			const _chartProps = clone(this.props.model.chartProps, true);
			const newData = _chartProps.data.map(function(d) {
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
		const state = assign({}, { chartProps: chartProps }, size_calcs);
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
		const domNodeWidth = ReactDOM.findDOMNode(this).offsetWidth;
		const bp = breakpoints.getBreakpointObj(this.props.enableResponsive, domNodeWidth);
		if (domNodeWidth !== this.state.domNodeWidth) {
			const resized = this._resizeUpdate(this.props, bp, domNodeWidth);
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
		const setMobile = reduce(keys(metadata), function(obj, key) {
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
			const _padding = {
				top: displayConfig.padding.top,
				right: displayConfig.padding.right,
				bottom: displayConfig.bottomPaddingWithoutFooter,
				left: displayConfig.padding.left,
			};
			const _margin = {
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

		const Renderer = chartRenderers[chartType] || mapRenderers[chartType];
		let chartProps;
		let metadata;

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
		/*if (this.props.enableResponsive && this.props.model.chartProps.mobile && isSmall) {
			metadata = this._getMobileMetadata(this.props.model.metadata, this.props.model.chartProps.mobile);
		} else {
			metadata = this.props.model.metadata;
		}*/

		metadata = this.props.model.metadata;

		return (
			<div className={["renderer-wrapper", this.state.svgSizeClass, this.props.className].join(" ")}>
					<Renderer
						width={width}
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
			</div>
		);
	}

});

module.exports = RendererWrapper;
