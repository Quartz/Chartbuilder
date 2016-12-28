import d3 from 'd3';

const colorScales = require('./../../../util/colorscales');

const padding = 5;

const _gravity = (k) => {
	return function(d) {
		d.x += (d.x0 - d.x) * k;
		d.y += (d.y0 - d.y) * k;
	};
}

const _collideDorling = (k, nodes) => {
	const q = d3.geom.quadtree(nodes);
	return function(node) {
		let nr = node.r + padding,
				nx1 = node.x - nr,
				nx2 = node.x + nr,
				ny1 = node.y - nr,
				ny2 = node.y + nr;
		q.visit(function(quad, x1, y1, x2, y2) {
			if (quad.point && (quad.point !== node)) {
				let x = node.x - quad.point.x,
						y = node.y - quad.point.y,
						l = x * x + y * y,
						r = nr + quad.point.r;
				if (l < r * r) {
					l = ((l = Math.sqrt(l)) - r) / l * k;
					node.x -= x *= l;
					node.y -= y *= l;
					quad.point.x += x;
					quad.point.y += y;
				}
			}
			return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
		});
	};
}
const _collideDemers = (k, nodes) => {
	const q = d3.geom.quadtree(nodes);
	return function(node) {
		let nr = node.r + padding,
				nx1 = node.x - nr,
				nx2 = node.x + nr,
				ny1 = node.y - nr,
				ny2 = node.y + nr;
		q.visit(function(quad, x1, y1, x2, y2) {
			if (quad.point && (quad.point !== node)) {
				let x = node.x - quad.point.x,
						y = node.y - quad.point.y,
						lx = Math.abs(x),
						ly = Math.abs(y),
						r = nr + quad.point.r;
				if (lx < r && ly < r) {
					if (lx > ly) {
						lx = (lx - r) * (x < 0 ? -k : k);
						node.x -= lx;
						quad.point.x += lx;
					} else {
						ly = (ly - r) * (y < 0 ? -k : k);
						node.y -= ly;
						quad.point.y += ly;
					}
				}
			}
			return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
		});
	};
}

const enter_demers = (selection, stylings, force, data) => {

	d3.selectAll('.carto-shapes').remove();

	selection
		.append('rect')
		.attr("height", function(d) { return +d.r * 2; })
		.attr("width", function(d) { return +d.r * 2; })
		.attr('rx',0)
		.attr('ry',0)
		.style('fill',function(d) { return d.color; })
		.style('stroke',stylings.stroke)
		.attr('class','carto-rects carto-shapes')
		.call(force.drag);

	selection.selectAll('.state-values').remove();

	selection.append('text')
		.attr("x", function(d) { return (+d.r); })
		.attr("y", function(d) { return (+d.r); })
		.attr('dy','0.3em')
		.attr('class','state-name carto-shapes')
		.style('font-size',function(d) {
			return ((+d.r - 2) < 10) ? 10 : (+d.r - 2);
		})
		.text(function(d) { return (d.r > 0) ?  d.shp : ''; });
}

const enter_grid = (selection, stylings, force, data) => {

 d3.selectAll('.carto-shapes').remove();

 selection.attr('transform',(d,i) => {
		return 'translate('+ d.xx + ',' + d.yy +')'
	});

	selection.append('rect')
		.attr("width", stylings.squareWidth)
		.attr("height", stylings.squareWidth)
		.attr('rx',stylings.corners)
		.attr('ry',stylings.corners)
		.style('fill',function(d) { return d.color; })
		.style('stroke',stylings.stroke)
		.attr('class','carto-rects carto-shapes');

	let adjustment = 0;

	if (stylings.showValuesLabels) {
			adjustment = -2;

		selection.append('text')
			.attr("x", (stylings.squareWidth / 2))
			.attr("y", 12 + (stylings.squareWidth / 2))
			.attr('dy','0.3em')
			.attr('class','state-values carto-shapes')
			.text((d) => d.value);
	}

	selection.append('text')
		.attr("x", (stylings.squareWidth / 2))
		.attr("y", adjustment + (stylings.squareWidth / 2))
		.attr('dy','0.3em')
		.attr('class','state-name carto-shapes')
		.text((d) => d.shp);
}

const enter_dorling = (selection, stylings, force, data) => {

	d3.selectAll('.carto-shapes').remove();

	selection.append('rect')
		.attr("height", function(d) { return +d.r * 2; })
		.attr("width", function(d) { return +d.r * 2; })
		.attr('rx', function(d) { return +d.r; })
		.attr('ry', function(d) { return +d.r; })
		.style('fill',function(d) { return d.color; })
		.style('stroke',stylings.stroke)
		.attr('class','carto-rects carto-shapes')
		.call(force.drag);

	let adjustment = 0;

	selection.selectAll('.state-values').remove();

	selection.append('text')
		.attr("x", function(d) { return (+d.r); })
		.attr("y", function(d) { return (+d.r); })
		.attr('dy','0.3em')
		.attr('class','state-name carto-shapes')
		.style('font-size',function(d) {
			return ((+d.r - 2) < 10) ? 10 : (+d.r - 2);
		})
		.text(function(d) { return (d.r > 0) ?  d.shp : ''; });
}


const update_node = (selection) => {
	selection.attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");
};


const update_demers = (e, selection, nodes) => {

	selection.each(_gravity(e.alpha * .1))
			.each(_collideDemers(.05, nodes))
			.attr("transform", function(d) {
				return "translate(" + (d.x - d.r) + "," + (d.y - d.r) + ")";
			});
}

const update_dorling = (e, selection, nodes) => {

 selection.each(_gravity(e.alpha * .1))
				.each(_collideDorling(.05, nodes))
				.attr("transform", function(d) {
					return "translate(" + (d.x - d.r) + "," + (d.y - d.r) + ")";
				});
}

const switch_grid = (selection, stylings) => {

	selection.attr('transform',(d,i) => {
			return 'translate('+ d.xx + ',' + d.yy +')'
		});

	selection.selectAll('rect')
		.attr("width", stylings.squareWidth)
		.attr("height", stylings.squareWidth)
		.style('fill', function(d) { return d.color; })
		.style('stroke',stylings.stroke)
		.attr('rx',stylings.corners)
		.attr('ry',stylings.corners);

	let adjustment = 0;

	if (stylings.showValuesLabels) {
		adjustment = -2;
	}

	selection.selectAll('text.state-name')
		.style('font-size','1.2em')
		.attr("x", (stylings.squareWidth / 2))
		.attr("y", adjustment + (stylings.squareWidth / 2))
		.text((d) => d.shp);
}


const switch_dorling = (selection, stylings) => {

	selection.selectAll('rect')
		.style('stroke',stylings.stroke)
		.attr("height", function(d) { return +d.r * 2; })
		.attr("width", function(d) { return +d.r * 2; })
		.style('fill',function(d) { return d.color; })
		.attr('rx', function(d) { return +d.r; })
		.attr('ry', function(d) { return +d.r; })

	selection.selectAll('text.state-name')
		.attr("x", function(d) { return (+d.r); })
		.attr("y", function(d) { return (+d.r); })
		.attr('dy','0.3em')
		.style('font-size',function(d) {
			return ((+d.r - 2) < 10) ? 10 : (+d.r - 2);
		})
		.text(function(d) { return (d.r > 0) ?  d.shp : ''; });
}

const switch_demers = (selection, stylings) => {

	selection.selectAll('rect')
		.style('stroke',stylings.stroke)
		.attr("height", function(d) { return +d.r * 2; })
		.attr("width", function(d) { return +d.r * 2; })
		.style('fill', function(d) { return d.color; })
		.attr('rx',0)
		.attr('ry',0);

	selection.selectAll('text.state-name')
		.attr("x", function(d) { return (+d.r); })
		.attr("y", function(d) { return (+d.r); })
		.style('font-size',function(d) {
			return ((+d.r - 2) < 10) ? 10 : (+d.r - 2);
		})
		.text(function(d) { return (d.r > 0) ?  d.shp : ''; });
}


/**
 * Helper functions!
 * @name helper
 */
const cartogram_helpers = Object.freeze({
	enterDemers: enter_demers,
	enterDorling: enter_dorling,
	enterGrid: enter_grid,
	switchGrid: switch_grid,
	switchDemers: switch_demers,
	switchDorling: switch_dorling,
	updateDemers: update_demers,
	updateDorling: update_dorling,
	updateNode: update_node
});

module.exports = cartogram_helpers;
