/*
 * ### RendererWrapper.jsx
 * Wrapper element for Chartbuilder renderers. The main task of this component
 * is to identify the appropriate renderer and pass in the width of its
 * container.
*/

var React = require("react");
var ReactDOM = require("react-dom");
var PropTypes = React.PropTypes;

var assign = require("lodash/assign");
var clone = require("lodash/clone");
var isDate = require("lodash/isDate");
var isEqual = require("lodash/isEqual");
var throttle = require("lodash/throttle");
var reduce = require("lodash/reduce");
var keys = require("lodash/keys");
var update = require("react-addons-update");

var SvgText = require("./svg/SvgText.jsx");

var ChartViewActions = require("../actions/ChartViewActions");
var convertConfig = require("../util/parse-config-values");
var SessionStore = require("../stores/SessionStore");
var breakpoints = require("../config/chart-breakpoints");
var BackgroundRect = require("./svg/BackgroundRect.jsx");
var ChartFooter = require("./svg/ChartFooter.jsx");

/*
 * `chartConfig` is an object that sets default properties for chart types, and
 * also associates a given chart type with its Editor and Renderer components.
 * Used here to identify the Renderer.
*/
var chartConfigs = require("../charts/chart-type-configs");
var chartStyle = require("../config/chart-style");
var chartRenderers = require("../charts/renderers");

/**
 * ### RendererWrapper
 * Wrapper component that determines which type of chart to render, wrapping it
 * in Svg and telling it to draw.
*/
var RendererWrapper = React.createClass({

	propTypes: {
		model: PropTypes.shape({
			chartProps: PropTypes.object.isRequired,
			metadata: PropTypes.object.isRequired
		}),
		width: PropTypes.number,
		enableResponsive: PropTypes.bool,
		showMetadata: PropTypes.bool,
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

	// process the size-relative chart config of a chart type when type is changed
	componentWillReceiveProps: function(nextProps) {
		var newType = nextProps.model.metadata.chartType;
		var prevType = this.props.model.metadata.chartType;
		if (newType !== prevType) {
			var chartConfig = convertConfig(chartConfigs[newType], null, this.state.emSize, this.state.domNodeWidth);
			this.setState({ chartConfig: chartConfig });
		}
	},

	componentWillMount: function() {
		var chartType = this.props.model.metadata.chartType;
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
		var chartType = props.model.metadata.chartType;
		return {
			domNodeWidth: domNodeWidth,
			emSize: bp.em_size,
			svgSizeClass: bp.class_name,
			chartConfig: convertConfig(chartConfigs[chartType], null, bp.em_size, domNodeWidth),
			styleConfig: convertConfig(chartStyle, null, bp.em_size, domNodeWidth)
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

	//_handleSvgUpdate: function(k, v) {
		//var newSetting = {};
		//newSetting[k] = v;
		//this.setState(update(this.state, { $merge: newSetting }));
	//},

	render: function() {
		var chartType = this.props.model.metadata.chartType;
		var width = this.props.width || this.state.domNodeWidth;
		var displayConfig = this.state.chartConfig.display;
		var svgClassName = this.props.svgClassName || '';

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

		var Renderer = chartRenderers[chartType];
		var chartProps;
		var metadata;

		// If rendered chart is not editable and has a date, we presume data is
		// being passed in and we need to use the data with processed dates
		if (this.props.model.chartProps.scale.hasDate && !this.props.editable) {
			chartProps = this.state.chartProps;
		} else {
			chartProps = this.props.model.chartProps;
		}

		var isSmall = (this.state.svgSizeClass === "small");

		// override metadata with mobile-specific settings if defined
		// TODO: remove this feature? seems never used
		if (this.props.enableResponsive && this.props.model.chartProps.mobile && isSmall) {
			metadata = this._getMobileMetadata(this.props.model.metadata, this.props.model.chartProps.mobile);
		} else {
			metadata = this.props.model.metadata;
		}

		// pass these props to the selected Renderer
		return (
			<div className={["renderer-wrapper", this.props.className].join(" ")}>
				<Renderer
					svgSizeClass={this.state.svgSizeClass}
					width={width}
					extraHeight={this.state.extraHeight}
					chartProps={chartProps}
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
