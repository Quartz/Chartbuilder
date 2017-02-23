const chartSizes = require("../../../config/mapconfig/map-sizes");

// TODO: jsDocify this if it works

/**
 * see [ChartConfig#calculateDimensions](#chartconfig/calculatedimensions)
 * @see ChartConfig#calculateDimensions
 * @instance
 * @memberof xy_config
 */
function calculate_map_dimensions(width, opts) {
  let height;
  let aspectRatio = opts.displayConfig.aspectRatio;
  let metadata = opts.metadata;

  if (metadata.size == "auto" || opts.enableResponsive) {
    // use current width
  } else {
    width = chartSizes[metadata.size].width;
  }

  switch (metadata.size) {
    case "auto":
      height = width * aspectRatio.wide;
      break;

    default:
      height = width * aspectRatio.wide;
  }

  return {
    width: width,
    height: height
  };
}

module.exports = calculate_map_dimensions;
