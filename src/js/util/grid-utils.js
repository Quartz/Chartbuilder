var React = require("react");
var ordinal = require("d3").scale.ordinal;
var map = require("lodash/map");
var assign = require("lodash/assign");
var defaults = require("lodash/defaults");
var range = require("lodash/range");

var gridScaleDefaults = {
	xInnerPadding: 0.1,
	xOuterPadding: 0,
	yInnerPadding: 0.1,
	yOuterPadding: 0
};
/**
 * make_mults
 *
 * @param components { array? of base components that data will be passed to }
 * @param data { data for each chart }
 * @param gridOpts {grid option }
 * @param howToRender { func that tells how to evaluate the components?? }
 * @returns {[chart components]}
 */
function make_mults(Outer, outerProps, data, gridScales, renderDataFunc) {
	var colDomain = gridScales.cols.domain();
	var numCols = colDomain[colDomain.length - 1] + 1;
	// only render number of grid blocks that are selected
	var numCharts = gridScales.cols.domain().length * gridScales.rows.domain().length;

	var grid_dimensions = {
		width: gridScales.cols.rangeBand(),
		height: gridScales.rows.rangeBand()
	};

	return map(data.slice(0, numCharts), function(d, i) {
		var pos = {
			col: i % numCols,
			row: (i === 0) ? 0 : Math.floor( i / numCols )
		};

		var gridProps = assign({}, outerProps, {
			key: i,
			translate: [ gridScales.cols(pos.col), gridScales.rows(pos.row) ],
			dimensions: grid_dimensions
		});

		return Outer(gridProps, renderDataFunc(d, i));
	});
}

function create_grid_scales(gridOpts, outerRange, _opts) {
	var colDomain = range(gridOpts.cols);
	var rowDomain = range(gridOpts.rows);
	var opts = defaults(_opts, gridScaleDefaults);

	return {
		cols: ordinal().domain(colDomain)
					.rangeBands(outerRange.x, opts.xInnerPadding, opts.xOuterPadding),
		rows: ordinal().domain(rowDomain)
					.rangeBands(outerRange.y, opts.yInnerPadding, opts.yOuterPadding)
	}
}

module.exports = {
	makeMults: make_mults,
	createGridScales: create_grid_scales
};
