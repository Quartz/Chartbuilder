/*
 * ### ChartGrid Renderer
 * Render a grid of N columns by N rows of the same kind of chart
 * This is split up into two different sub-components, one for rendering a grid
 * of bar (row) charts, and another for a grid of XY (line, dot, column) charts
*/

import React, {PropTypes} from 'react';
import update from 'react-addons-update';

import {clone, assign, each} from 'lodash';
const chartSizes = require("../../config/chartconfig/chart-sizes");
const gridDimensions = require("../../charts/charts/cb-chart-grid/chart-grid-dimensions");

/* Chart grid types */
const ChartGridBars = require("./ChartGridBars.jsx");
const ChartGridXY = require("./ChartGridXY.jsx");

/**
 * ### Component that decides which grid (small multiples) type to render and
 * passes props to that renderer
 * @property {boolean} editable - Allow the rendered component to interacted with and edited
 * @property {object} displayConfig - Parsed visual display configuration for chart grid
 * @property {object} chartProps - Properties used to draw this chart
 * @instance
 * @memberof renderers
 */
class ChartGridRenderer extends React.Component {

	_createMobileScale (_chartProps) {
		const mobile = clone(_chartProps.mobile.scale, true);
		const scale = assign({}, _chartProps.scale, mobile);
		each(["prefix", "suffix"], function(text) {
			if (!mobile.primaryScale[text] || mobile.primaryScale[text] === "") {
				scale.primaryScale[text] = _chartProps.scale.primaryScale[text];
			}
		});
		return scale;
	}

	render () {
		const props = this.props;
		const _chartProps = this.props.chartProps;
		let gridTypeRenderer;
		const dimensions = gridDimensions(props.width, {
			metadata: props.metadata,
			grid: _chartProps._grid,
			data: _chartProps.data,
			displayConfig: props.displayConfig,
			showMetadata: props.showMetadata
		});

		let scale;
		if (this.props.enableResponsive && _chartProps.hasOwnProperty("mobile") && this.props.isSmall) {
			if (_chartProps.mobile.scale) {
				scale = this._createMobileScale(_chartProps);
			} else {
				scale = _chartProps.scale;
			}
		} else {
			scale = _chartProps.scale;
		}

		const chartProps = update(_chartProps, { $merge: { scale: scale }});

		/* Pass a boolean that detects whether there is a title */
		const hasTitle = (this.props.metadata.title.length > 0 && this.props.showMetadata);

		/* Choose between grid of bars and grid of XY, and transfer all props to
		 * relevant component
		*/
		if (this.props.chartProps._grid.type == "bar") {
			gridTypeRenderer = (
				<ChartGridBars
					{...this.props}
					dimensions={dimensions}
					scale={scale}
					hasTitle={hasTitle}
				/>
			);
		} else {
			gridTypeRenderer = (
				<ChartGridXY
					{...this.props}
					dimensions={dimensions}
					scale={scale}
					hasTitle={hasTitle}
				/>
			);
		}
		return gridTypeRenderer;
	}
};

ChartGridRenderer.propTypes = {
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
};

module.exports = ChartGridRenderer;
