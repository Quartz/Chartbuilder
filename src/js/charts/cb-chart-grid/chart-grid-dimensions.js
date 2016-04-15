var chartSizes = require("../../config/chart-sizes");

/**
 * see [ChartConfig#calculateDimensions](#chartconfig/calculatedimensions)
 * @see ChartConfig#calculateDimensions
 * @instance
 * @memberof chart_grid_config
 */
function chartGridDimensions(width, opts) {
	var height;
	var metadata = opts.metadata;
	var grid = opts.grid;

	if (metadata.size == "auto" || opts.enableResponsive) {
		// use current width
	} else {
		width = chartSizes[metadata.size].width;
	}

	if (grid.type == "bar") {
		var numDataPoints = opts.data[0].values.length;
		height = calculate_bar_height(numDataPoints, grid, opts.displayConfig);
	} else {
		height = calculate_cartesian_height(width, grid, opts.displayConfig);
	}

	if (opts.metadata.title.length > 0 && opts.showMetadata) {
		height += opts.displayConfig.afterTitle;
	} else if (!opts.showMetadata) {
		height -= opts.displayConfig.padding.bottom;
	}

	return {
		width: width,
		height: height
	};
}

function calculate_bar_height(numDataPoints, grid, displayConfig) {
	var perChart = (displayConfig.afterLegend + displayConfig.padding.top + displayConfig.afterXYBottom);
	var perBar = (displayConfig.paddingPerBar + displayConfig.barHeight);
	var singleChart = (perChart + (perBar * numDataPoints));
	return singleChart * grid.rows;
}

function calculate_cartesian_height(width, grid, displayConfig, extraHeight) {
	var height =
		(grid.rows * (((width / grid.cols) * displayConfig.xy.aspectRatio.wide) + displayConfig.afterLegend)) +
		(grid.rows - 1) * displayConfig.afterXYBottom +
		extraHeight + displayConfig.xy.padding.bottom;

	return height;
}

module.exports = chartGridDimensions;
