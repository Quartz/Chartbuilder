var chartSizes = require("../../config/chart-sizes");

// TODO: jsDocify this if it works

/**
 * see [ChartConfig#calculateDimensions](#chartconfig/calculatedimensions)
 * @see ChartConfig#calculateDimensions
 * @instance
 * @memberof xy_config
 */
function calculate_xy_dimensions(width, opts) {
	var height;
	var aspectRatio = opts.displayConfig.aspectRatio;
	var metadata = opts.model.metadata;

	if (metadata.size == "auto" || opts.enableResponsive) {
		// use current width
	} else {
		width = chartSizes[metadata.size].width;
	}

	switch (metadata.size) {
		case "auto":
			height = width * aspectRatio.wide;
			break;

		case 'medium':
			height = width * aspectRatio.wide;
			break;

		case "spotLong":
			height = width * aspectRatio.longSpot;
			break;

		case "spotSmall":
			height = width * aspectRatio.smallSpot;
			break;

		default:
			height = width * aspectRatio.wide;
	}

	return {
		width: width,
		height: height + opts.extraHeight
	};
}

module.exports = calculate_xy_dimensions;
