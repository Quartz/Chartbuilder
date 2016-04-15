var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");
var keys = require("lodash/keys");
var reduce = require("lodash/reduce");
var isArray = require("lodash/isArray");
var ordinal = require("d3").scale.ordinal;
var rect = React.createFactory('rect');

var scale_map = {
	vertical: {
		"ordinalScale": "xScale",
		"ordinalVal": "x",
		"ordinalSize": "width",
		"linearScale": "yScale",
		"linearVal": "y",
		"linearSize": "height"
	},
	horizontal: {
		"ordinalScale": "yScale",
		"ordinalVal": "y",
		"ordinalSize": "height",
		"linearScale": "xScale",
		"linearVal": "x",
		"linearSize": "width"
	},
};
var map_keys = keys(scale_map.vertical);

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

	_makeBarProps: function(bar, i, mapping, linearScale, ordinalScale, size, offset) {
		var ps = this.props;
		var barProps = { key: i, colorIndex: bar.colorIndex };
		barProps[mapping.ordinalVal] = ordinalScale(bar.entry) + offset;
		barProps[mapping.ordinalSize] = size;
		barProps[mapping.linearVal] = 0;
		barProps[mapping.linearSize] = linearScale(bar.value);
		return barProps;
	},

	render: function() {
		var props = this.props;
		var mapping = scale_map[props.orientation];
		var numDataPoints = props.bars[0].data.length;
		var scales = scale_map[props.orientation];
		var makeBarProps = this._makeBarProps;

		var innerSize = props.dimensions[mapping.ordinalSize] / numDataPoints;
		var groupInnerPadding = Math.max(0.1, (props.displayConfig.columnInnerPadding / numDataPoints));

		var innerScale = ordinal().domain(Object.keys(props.bars))
			.rangeRoundBands([0, innerSize], 0, groupInnerPadding);

		var rectSize = innerScale.rangeBand();

		var groups = map(props.bars, function(bar, ix) {
			var rects = map(bar.data, function(d, i) {
				var ordinalScale = bar[mapping.ordinalScale] || props[mapping.ordinalScale];
				var linearScale = bar[mapping.linearScale] || props[mapping.linearScale];
				var ordinalOffset = innerScale(ix) - innerSize / 2;

				return (
					rect(makeBarProps(d, i, mapping, linearScale, ordinalScale, rectSize, ordinalOffset))
				);
			})
			return <g key={ix} className="bar-series">{rects}</g>;
		});

		return <g className="bar-series-group">{groups}</g>;
	}

});

module.exports = BarGroup;
