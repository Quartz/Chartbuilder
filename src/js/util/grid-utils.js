var React = require("react");
var d3 = require("d3");
var map = require("lodash/map");
var assign = require("lodash/assign");

/**
 * make_mults
 *
 * @param components { array? of base components that data will be passed to }
 * @param data { data for each chart }
 * @param gridSettings {grid option }
 * @param howToRender { func that tells how to evaluate the components?? }
 * @returns {[chart components]}
 */
function make_mults(Outer, outerProps, data, gridScales, renderDataFunc) {
	var colDomain = gridScales.cols.domain();
	var numCols = colDomain[colDomain.length - 1] + 1;

	var grid_dimensions = {
		width: gridScales.cols.rangeBand(),
		height: gridScales.rows.rangeBand()
	};

	return map(data, function(d, i) {
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

function create_grid_scales(gridSettings, xRange, yRange, innerPadding, outerPadding) {
	var colDomain = d3.range(0, gridSettings.cols);
	var rowDomain = d3.range(0, gridSettings.rows);

	return {
		cols: d3.scale.ordinal().domain(colDomain).rangeBands(xRange, 0.1, 0),
		rows: d3.scale.ordinal().domain(rowDomain).rangeBands(yRange, 0.1, 0)
	}
}

module.exports = {
	makeMults: make_mults,
	createGridScales: create_grid_scales
};
