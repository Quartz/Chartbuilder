var React = require("react");
var PropTypes = React.PropTypes;
var d3scale = require("d3-scale");
var assign = require("lodash/assign");
var map = require("lodash/map");
var keys = require("lodash/keys");
var reduce = require("lodash/reduce");
var range = require("lodash/range");
var isArray = require("lodash/isArray");
var Rect = React.createFactory('rect');
var G = React.createFactory('g');

// parse props differently if bar is horizontal/vertical
var orientation_map = {
	vertical: {
		"ordinalScale": "xScale",
		"ordinalVal": "x",
		"ordinalSize": "width",
		"linearScale": "yScale",
		"linearVal": "y",
		"linearSize": "height",
		"linearCalculation": Math.max.bind(null, 0),
		"groupTransform": function(x) { return "translate(" + x + ",0)"; }
	},
	horizontal: {
		"ordinalScale": "yScale",
		"ordinalVal": "y",
		"ordinalSize": "height",
		"linearScale": "xScale",
		"linearVal": "x",
		"linearSize": "width",
		"linearCalculation": Math.min.bind(null, 0),
		"groupTransform": function(y) { return "translate(0," + y + ")"; }
	},
};

var BarGroup = React.createClass({

	propTypes: {
		dimensions: PropTypes.object,
		xScale: PropTypes.func,
		bars: PropTypes.array,
		orientation: PropTypes.oneOf(["vertical", "horizontal"])
	},

	getDefaultProps: function() {
		return {
			groupPadding: 0.2,
			orientation: "vertical"
		}
	},

	_makeBarProps: function(bar, i, mapping, linearScale, ordinalScale, size) {
		var props = this.props;
		var barProps = { key: i, colorIndex: bar.colorIndex };
		barProps[mapping.ordinalVal] = ordinalScale(bar.entry);
		barProps[mapping.ordinalSize] = size;

		// linearVal needs to be negative if number is neg else 0
		// see https://bl.ocks.org/mbostock/2368837
		barProps[mapping.linearVal] = linearScale(mapping.linearCalculation(bar.value));
		barProps[mapping.linearSize] = Math.abs(linearScale(bar.value) - linearScale(0));
		return barProps;
	},

	render: function() {
		var props = this.props;
		var mapping = orientation_map[props.orientation];
		var numDataPoints = props.bars[0].data.length;
		var makeBarProps = this._makeBarProps;
		var groupInnerPadding = Math.max(0.1, (props.displayConfig.columnInnerPadding / numDataPoints));

		var outerScale = props[mapping.ordinalScale];
		var innerSize = outerScale.bandwidth();

		var innerScale = d3scale.scaleBand().domain(range(props.bars.length))
			.rangeRound([0, innerSize], 0.1, groupInnerPadding);

		var rectSize = innerScale.bandwidth();

		var groups = map(props.bars, function(bar, ix) {
			var groupProps = { "key": ix, className: "bar-series" };
			groupProps["transform"] = mapping.groupTransform(innerScale(ix));

			var rects = map(bar.data, function(d, i) {
				var linearScale = bar[mapping.linearScale] || props[mapping.linearScale];
				var ordinalOffset = innerScale(ix);
				var barProps = makeBarProps(d, i, mapping, linearScale, outerScale, rectSize);
				barProps.className = "color-index-" + bar.colorIndex;

				return Rect(barProps);
			});

			return G(groupProps, rects);
		});

		return <g className="bar-series-group">{groups}</g>;
	}

});

module.exports = BarGroup;
