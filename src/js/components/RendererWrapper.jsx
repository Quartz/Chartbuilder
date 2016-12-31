/*
 * ### RendererWrapper.jsx
 * Wrapper element for Chartbuilder renderers. The main task of this component
 * is to identify the appropriate renderer and pass in the width of its
 * container.
*/

const React = require("react");
const ReactDOM = require("react-dom");
const PropTypes = React.PropTypes;

const assign = require("lodash/assign");
const clone = require("lodash/clone");
const isDate = require("lodash/isDate");
const isEqual = require("lodash/isEqual");
const throttle = require("lodash/throttle");
const reduce = require("lodash/reduce");
const keys = require("lodash/keys");
const update = require("react-addons-update");

const SvgText = require("./svg/SvgText.jsx");

const ChartViewActions = require("../actions/ChartViewActions");
const convertConfig = require("../util/parse-config-values");
const SessionStore = require("../stores/SessionStore");
const breakpoints = require("../config/chartconfig/chart-breakpoints");
const ChartFooter = require("./svg/ChartFooter.jsx");
const LegendSpace = require("./svg/MapLegendSpace.jsx");
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
		var chartType = this.props.model.metadata.chartType;
		var size_calcs = {};
		if (this.props.width) {
			var bp = breakpoints.getBreakpointObj(this.props.enableResponsive, this.props.width);
			size_calcs = this._resizeUpdate(this.props, bp, this.props.width);
		}

		var chartProps = null;
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

	_resizeUpdate: function(props, bp, domNodeWidth) {
		var chartType = props.model.metadata.chartType;
		return {
			domNodeWidth: domNodeWidth,
			emSize: bp.em_size,
			svgSizeClass: bp.class_name,
			chartConfig: convertConfig(chartConfigs[chartType] || mapConfigs[newtype], null, bp.em_size, domNodeWidth),
			styleConfig: convertConfig(chartStyle, null, bp.em_size, domNodeWidth)
		};
	},

	componentVisibilityChanged: function() {
		this._updateWidth();
	},

	_updateWidth: function(force) {
		var domNodeWidth = ReactDOM.findDOMNode(this).offsetWidth;
		var bp = breakpoints.getBreakpointObj(this.props.enableResponsive, domNodeWidth);
		if (domNodeWidth !== this.state.domNodeWidth) {
			var resized = this._resizeUpdate(this.props, bp, domNodeWidth);
			if (resized) {
				this.setState(resized);
			}
		}
	},

	componentDidMount: function() {
		if (this.props.enableResponsive) {
			this._updateWidth(true);
			this._updateWidth = throttle(this._updateWidth, 50);
			window.addEventListener("resize", this._updateWidth);
		}
	},

	componentWillUnmount: function() {
		if (this.props.enableResponsive) {
			window.removeEventListener("resize", this._updateWidth);
		}
	},

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

	_handleSvgUpdate: function(k, v) {
		var newSetting = {};
		newSetting[k] = v;
		this.setState(update(this.state, { $merge: newSetting }));
	},

	_calculateDimensions: function(width, displayConfig, extraHeight) {
		var calculator = this.state.chartConfig.calculateDimensions;
		return calculator(width, {
			model: this.props.model,
			displayConfig: displayConfig,
			enableResponsive: this.props.enableResponsive,
			extraHeight: extraHeight,
			showMetadata: this.props.showMetadata
		});
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

		console.log(this.props.model.metadata.subtitle.length,'eh');

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

		// If rendered chart is not editable and has a date, we presume data is
		// being passed in and we need to use the data with processed dates
		if (this.props.model.chartProps.scale.hasDate && !this.props.editable) {
			chartProps = this.state.chartProps;
		} else {
			chartProps = this.props.model.chartProps;
		}

		const isSmall = (this.state.svgSizeClass === "small");

		// override metadats with mobile-specific settings if defined
		if (this.props.enableResponsive && this.props.model.chartProps.mobile && isSmall) {
			metadata = this._getMobileMetadata(this.props.model.metadata, this.props.model.chartProps.mobile);
		} else {
			metadata = this.props.model.metadata;
		}

		const margin = this.state.chartConfig.display.margin;
		const stylings = chartProps.stylings;
		const metadataSvg = [];
		const legends = [];

		const translate = {
			top: margin.top,
			right: dimensions.width - margin.right,
			bottom: dimensions.height - margin.bottom,
			left: margin.left
		};

		if (this.props.showLegenddata) {

			translate.legendleft = margin.legendleft;

			if (this.props.model.metadata.subtitle) {

				if (this.props.model.metadata.subtitle.length > 0) {

					translate.legendsOneRow = margin.legendsOneRow + 35;
					translate.legendsTwoRow = margin.legendsTwoRow + 35;
				}
			}
			else {
				translate.legendsOneRow = margin.legendsOneRow;
				translate.legendsTwoRow = margin.legendsTwoRow;
			}

			legends.push(
					<LegendSpace
						key="legend"
						translate={translate}
						className="svg-legend-space"
						chartProps={chartProps}
						stylings={stylings}
						metadata={metadata}
						dimensions={dimensions}
						displayConfig={displayConfig}
						chartWidth={dimensions.width - margin.left - margin.right}
					/>
				)
		}

		if (this.props.showMetadata) {
			if (metadata.title && metadata.title !== "") {
				const title = (
					<SvgText
						text={metadata.title}
						key="title"
						translate={[translate.left, translate.top]}
						align="top"
						className="svg-text-title"
					/>
				);
				metadataSvg.push(title);
			}

			if (chartProps.visualType === 'map') {

				translate.subtitle = margin.subtitle;

				const subtitle = (
					<SvgText
						text={metadata.subtitle}
						key="subtitle"
						translate={[translate.left, translate.top + translate.subtitle]}
						align="top"
						className="svg-text-subtitle"
					/>
				);
				metadataSvg.push(subtitle);
			}

			metadataSvg.push(
				<ChartFooter
					metadata={metadata}
					extraHeight={this.state.extraHeight}
					key="chartFooter"
					translate={translate}
					onUpdate={this._handleSvgUpdate.bind(null, "extraHeight")}
					chartWidth={dimensions.width - margin.left - margin.right}
					className="svg-credit-data"
				/>
			);
		}
		return (
			<div className={["renderer-wrapper", this.state.svgSizeClass, this.props.className].join(" ")}>
				<svg
					key={chartType}
					className={["renderer-svg", svgClassName].join(" ")}
					width={dimensions.width}
					height={dimensions.height}
				>
					<g className="svg-background-wrap">
						<rect
							className="svg-background"
							width={dimensions.width}
							height={dimensions.height}
							x={0}
							y={0}
						/>
					</g>
					<Renderer
						width={width}
						extraHeight={this.state.extraHeight}
						chartProps={chartProps}
						dimensions={dimensions}
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
				</svg>
			</div>
		);
	}

});

module.exports = RendererWrapper;
