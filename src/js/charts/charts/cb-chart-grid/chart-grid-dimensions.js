const chartSizes = require("../../../config/chartconfig/chart-sizes");

/**
 * see [ChartConfig#calculateDimensions](#chartconfig/calculatedimensions)
 * @see ChartConfig#calculateDimensions
 * @instance
 * @memberof chart_grid_config
 */
function chartGridDimensions(width, opts) {
	let height;
	const metadata = opts.metadata;
	const grid = opts.grid;

	if (metadata.size == "auto" || opts.enableResponsive) {
		// use current width
	} else {
		width = chartSizes[metadata.size].width;
	}

	if (grid.type == "bar") {
		const numDataPoints = opts.data[0].values.length;
		height = calculate_bar_height(numDataPoints, grid, opts.displayConfig);
	} else {
		height = calculate_cartesian_height(width, grid, opts.displayConfig);
	}

	if (!opts.showMetadata) {
		height -= opts.displayConfig.padding.bottom;
	}

	return {
		width: width,
		height: height
	};
}

function calculate_bar_height(numDataPoints, grid, displayConfig) {
	return displayConfig.barHeight * numDataPoints * grid.rows;
}

function calculate_cartesian_height(width, grid, displayConfig, extraHeight) {
	const height = (
		grid.rows *
		((width / grid.cols) *
		displayConfig.xy.aspectRatio.wide)
	);
	return height;
}

module.exports = chartGridDimensions;
