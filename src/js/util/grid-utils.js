var React = require("react");
var d3 = require("d3");
var map = require("lodash/map");
var assign = require("lodash/assign");
var scaleUtils = require("./scale-utils");

/**
 * make_mults
 *
 * @param components { array? of base components that data will be passed to }
 * @param data { data for each chart }
 * @param gridSettings {grid option }
 * @param howToRender { func that tells how to evaluate the components?? }
 * @returns {[chart components]}
 */
function make_mults(outer, outerProps, grid, data, scales, renderData) {
	return map(data, function(d, i) {
		var pos = {
			col: i % grid.cols,
			row: (i === 0) ? 0 : Math.floor( i / grid.cols )
		};

		var gridProps = assign({}, outerProps, {
			key: i,
			translate: [ scales.cols(pos.col), scales.rows(pos.row) ]
		});

		return outer(gridProps, renderData(d, i));
	});
}

function create_grid_scales(gridSettings, xRange, yRange) {
	var colDomain = d3.range(0, gridSettings.cols);
	var rowDomain = d3.range(0, gridSettings.rows);

	return {
		cols: d3.scale.ordinal().domain(colDomain).rangeBands(xRange, 0.1, 0),
		rows: d3.scale.ordinal().domain(rowDomain).rangeBands(yRange, 0.1, 0)
	}
}

function GridWrapper(Outer, Data) {
	return React.createClass({
		render: function() {
			return (
				<Outer {...this.props}>
				</Outer>
			)
		}
	})
}

module.exports = {
	makeMults: make_mults,
	createGridScales: create_grid_scales
};
