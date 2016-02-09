/*
 * ### ChartGrid Renderer
 * Render a grid of N columns by N rows of the same kind of chart
 * This is split up into two different sub-components, one for rendering a grid
 * of bar (row) charts, and another for a grid of XY (line, dot, column) charts
*/

var React = require("react");
var PropTypes = React.PropTypes;
var update = require("react-addons-update");
var chartSizes = require("../../config/chart-sizes");
var clone = require("lodash/clone");
var assign = require("lodash/assign");
var each = require("lodash/each");

/* Chart grid types */
var ChartGridBars = require("./ChartGridBars.jsx");
var ChartGridXY = require("./ChartGridXY.jsx");

/**
 * ### Component that renders bar (row) charts in a chart grid
 * @property {boolean} editable - Allow the rendered component to interacted with and edited
 * @property {object} displayConfig - Parsed visual display configuration for chart grid
 * @property {object} chartProps - Properties used to draw this chart
 * @instance
 * @memberof renderers
 */
var ChartGridRenderer = React.createClass({

	propTypes: {
		editable: PropTypes.bool.isRequired,
		displayConfig: PropTypes.shape({
			margin: PropTypes.obj,
			padding: PropTypes.obj
		}).isRequired,
		chartProps: PropTypes.shape({
			chartSettings: PropTypes.array.isRequired,
			data: PropTypes.array.isRequired,
			scale: PropTypes.object.isRequired,
			_grid: PropTypes.object.isRequired
		}).isRequired,
		showMetadata: PropTypes.bool,
		metadata: PropTypes.object
	},

	_createMobileScale: function(_chartProps) {
		var mobile = clone(_chartProps.mobile.scale, true);
		var scale = assign({}, _chartProps.scale, mobile);
		each(["prefix", "suffix"], function(text) {
			if (!mobile.primaryScale[text] || mobile.primaryScale[text] === "") {
				scale.primaryScale[text] = _chartProps.scale.primaryScale[text];
			}
		});
		return scale;
	},

	render: function() {
		var _chartProps = this.props.chartProps;
		var gridTypeRenderer;
		var dimensions;
		var scale;
		if (this.props.enableResponsive && _chartProps.hasOwnProperty("mobile") && this.props.isSmall) {
			if (_chartProps.mobile.scale) {
				scale = this._createMobileScale(_chartProps);
			} else {
				scale = _chartProps.scale;
			}
		} else {
			scale = _chartProps.scale;
		}

		var chartProps = update(_chartProps, { $merge: { scale: scale }});

		/* Pass a boolean that detects whether there is a title */
		var hasTitle = (this.props.metadata.title.length > 0 && this.props.showMetadata);

		/* Choose between grid of bars and grid of XY, and transfer all props to
		 * relevant component
		*/
		if (this.props.chartProps._grid.type == "bar") {
			gridTypeRenderer = (
				<ChartGridBars
					{...this.props}
					scale={scale}
					hasTitle={hasTitle}
				/>
			);
		} else {
			gridTypeRenderer = (
				<ChartGridXY
					{...this.props}
					scale={scale}
					hasTitle={hasTitle}
				/>
			);
		}
		return gridTypeRenderer;
	}
});


module.exports = ChartGridRenderer;
