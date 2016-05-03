// Label with the number for a bar.
// Currently only works for horiz bars
var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");

var BarLabels = React.createClass({

	propTypes: {
		text: PropTypes.string,
		translate: PropTypes.array,
		colorIndex: PropTypes.number,
		formatLabel: PropTypes.func
	},

	getDefaultProps: function() {
		return {
			translate: [0, 0],
			text: "BarLabels",
			colorIndex: 0,
			formatLabel: function(d) { return d; },
			dy: "0.35em"
		};
	},

	// TODO: make this generic (for axis as well)
	_addPrefSuf: function(formattedLabel, i, numTicks, prefix, suffix) {
		if (i === 0) {
			return [prefix, formattedLabel, suffix].join("");
		} else {
			return formattedLabel;
		}
	},

	render: function() {
		var props = this.props;
		var addPrefSuf = this._addPrefSuf;
		var numTicks = props.data.length;
		var labels = map(props.data, function(d, i) {
			var formatted = props.formatLabel(d.value)
			var text = addPrefSuf(formatted, i, numTicks, props.prefix, props.suffix)
			return (
				<text
					key={i}
					className="bar-label"
					transform={"translate(" + props.translate + ")"}
					x={props.displayConfig.blockerRectOffset + props.xScale(Math.max(0, d.value))}
					y={props.yScale(d.entry)}
					dy={props.dy}
				>
					{text}
				</text>
			);
		});

		return (
			<g
				className="bar-labels"
				style={{ font: props.tickFont }}
			>
				{labels}
			</g>
		);
	}

});

module.exports = BarLabels;
