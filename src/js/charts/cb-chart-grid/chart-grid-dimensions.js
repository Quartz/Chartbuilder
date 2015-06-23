var chartSizes = require("../../config/chart-sizes");

/**
 * see [ChartConfig#calculateDimensions](#chartconfig/calculatedimensions)
 * @see ChartConfig#calculateDimensions
 * @instance
 * @memberof chart_grid_config
 */
function chartGridDimensions(width, opts) {
	var height;
	var model = opts.model;
	var metadata = model.metadata;
	var grid = model.chartProps._grid;

	if (metadata.size == "auto" || opts.enableResponsive) {
		// use current width
	} else {
		width = chartSizes[metadata.size].width;
	}

	if (grid.type == "bar") {
		var numDataPoints = model.chartProps.data[0].values.length;
		height = calculate_bar_height(numDataPoints, grid, opts.displayConfig, opts.extraHeight);
	} else {
		height = calculate_cartesian_height(width, grid, opts.displayConfig, opts.extraHeight);
	}

	if (model.metadata.title.length > 0 && opts.showMetadata) {
		height += opts.displayConfig.afterTitle;
	} else if (!opts.showMetadata) {
		height -= opts.displayConfig.padding.bottom;
	}

	return {
		width: width,
		height: height
	};
}

function calculate_bar_height(numDataPoints, grid, displayConfig, extraHeight) {
	var perChart = (displayConfig.afterLegend + displayConfig.padding.top + displayConfig.afterXYBottom);
	var perBar = (displayConfig.paddingPerBar + displayConfig.barHeight);
	var singleChart = (perChart + (perBar * numDataPoints));
	var allBars = singleChart * grid.rows;
	return extraHeight + allBars;
}

function calculate_cartesian_height(width, grid, displayConfig, extraHeight) {
	var height =
		(grid.rows * (((width / grid.cols) * displayConfig.xy.aspectRatio.wide) + displayConfig.afterLegend)) +
		(grid.rows - 1) * displayConfig.afterXYBottom +
		extraHeight + displayConfig.xy.padding.bottom;

	return height;
}

module.exports = chartGridDimensions;
