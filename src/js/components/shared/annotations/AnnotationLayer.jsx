var React = require('react');

var ChartViewActions = require("../../../actions/ChartViewActions");
var AnnotationBlurb = require("./AnnotationBlurb.jsx");
var AnnotationMarker = require("./AnnotationMarker.jsx")
var annotation_config = require("./annotation-config.js");


var clone = require("lodash/clone");

var d3 = require("d3")

var AnnotationLayer = React.createClass({

	propTypes: {
		blurbs: React.PropTypes.array,
		chartProps: React.PropTypes.object,
		dimensions: React.PropTypes.object,
		isSmall: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			blurbs: [],
			defaultBlurb: annotation_config.defaultBlurb
		};
	},

	_updateAnnotations: function(newAnnotations) {
		ChartViewActions.updateChartProp("_annotations", newAnnotations);
	},


	_handleBlurbUpdate: function(index_or_array,prop,key) {
		var _annotations = this.props.chartProps._annotations

		if(index_or_array.length !== undefined) {
			var update_list = index_or_array;		
		}
		else {
			var update_list = [{i: index_or_array, prop: prop, key: key}];
		}
		
		update_list.forEach(function(d){
			_annotations.blurbs.values[d.i][d.key] = d.prop;
		});

		this._updateAnnotations(_annotations);
	},

	_handleMarkerUpdate: function(index_or_array, prop, key) {
		this._handleBlurbUpdate(index_or_array, prop, key);
	},

	_addBlurb: function() {
		var blurb = clone(this.props.defaultBlurb);
		
		blurb.index = this.props.blurbs.length

		this.props.blurbs.push(blurb)	
	},

	componentWillMount: function() {
		this._addBlurb()
	},

	_createScales: function() {

		var styleConfig = this.props.styleConfig;
		var displayConfig = this.props.displayConfig;
		var props = this.props;
		var dimensions = props.dimensions;

		// props.chartAreaDimensions = {
		// 	width: (
		// 		dimensions.width -
		// 		displayConfig.margin.left - displayConfig.margin.right -
		// 		displayConfig.padding.left - displayConfig.padding.right -
		// 		this.state.maxTickWidth.primaryScale - this.state.maxTickWidth.secondaryScale
		// 	),
		// 	height: (
		// 		dimensions.height -
		// 		displayConfig.margin.top - displayConfig.margin.bottom -
		// 		displayConfig.padding.top - displayConfig.padding.bottom
		// 	)
		// };

		// var padding = computePadding(props);

		// var scales = this.props.chartProps.scale;
		// yScale_info = scales.primaryScale
		// xScale_info = xScaleInfo(
		// 		this.props.dimensions.width,
		// 		padding,styleConfig,
		// 		displayConfig,
		// 		{
		// 			dateSettings: this.state.dateScaleInfo
		// 		}
		// 	);

		// var yRange = [
		// 	this.props.dimensions.height - padding.bottom - displayConfig.margin.bottom,
		// 	padding.top + displayConfig.margin.top
		// ];

		// var xRange = props.chartProps.scale.hasDate ? [
		// 	padding.left + displayConfig.margin.left + this.props.maxTickWidth.primaryScale,
		// 	xScale_info.rangeR-padding.right-displayConfig.margin.right-this.props.maxTickWidth.secondaryScale - displayConfig.minPaddingOuter
		// ] : [];

		// scale = {
		// 	y: {
		// 		domain: yScale_info.domain,
		// 		range: yRange
		// 	},
		// 	x: {
		// 		domain: xScale_info.domain ? xScale_info.domain : [],
		// 		range: xRange
		// 	}
		// };

		var yScale = d3.scale.linear()
			// .domain(props.scale.y.domain)
			// .range(props.scale.y.range);

		var xScale = d3.scale.linear()
			// .domain(props.scale.x.domain)
			// .range(props.scale.x.range);


		return {x: xScale, y: yScale}
	},

	render: function() {
		//CHANGE
		var scales = this._createScales();
		var that = this;
		var blurbs = this.props.chartProps._annotations.blurbs.values.map(function(d,i) {

			return (<AnnotationBlurb 
					key={"blurb" + i}
					index={i}
					tout={d.tout}
					copy={d.copy}
					pos={d.pos}
					onBlurbUpdate={that._handleBlurbUpdate}
					x={scales.x}
					y={scales.y}
					dimensions={that.props.dimensions}
					margin={{x: 0, y: 0}}
					offset={{x: 0, y: 0}}
					hasArrow={d.hasArrow}
					arrow={{
						start: {pct: d.arrowStart},
						end: {pct: d.arrowEnd},
						snapTo: null,
						clockwise: d.arrowClockwise
					}}
					direct={that.props.isSmall}
				/>)
		})

		var annotation_markers = this.props.chartProps._annotations.blurbs.values.map(function(d,i) {

			return (<AnnotationMarker 
					key={"marker" + i}
					index={i}
					pos={d.pos}
					onMarkerUpdate={that._handleMarkerUpdate}
					x={scales.x}
					y={scales.y}
					dimensions={that.props.dimensions}
					margin={{x: 0, y: 0}}
					offset={{x: 0, y: 0}}
					arrow={{
						start: {pct: d.arrowStart},
						end: {pct: d.arrowEnd},
						snapTo: null,
						clockwise: d.arrowClockwise
					}}
				/>)
		});


		return (
			<div className="annotation-layer-wrap">
				<div className="annotation-layer">
					{blurbs}
					<svg className="arrowhead-wrap">
						<defs>
							<marker
								id="arrowhead"
								viewBox="0 0 5.108 8.18"
								markerHeight="8.18"
								markerWidth="5.108"
								refY="4.09"
								refX="5"
								orient="auto"
							>
								<polygon
									points="0.745,8.05 0.07,7.312 3.71,3.986 0.127,0.599 0.815,-0.129 5.179,3.999" 
									fill="#4C4C4C"
								/>
							</marker>
						</defs>
					</svg>
				</div>
				<div className="annotation-layer-mobile">
					{annotation_markers}
				</div>
			</div>
		);
	}

});

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

module.exports = AnnotationLayer;