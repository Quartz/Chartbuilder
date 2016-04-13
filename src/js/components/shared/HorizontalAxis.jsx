// Svg text elements used to describe chart
var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");
var help = require("../../util/helper.js");

var DY = "0.32em"

var HorizontalAxis = React.createClass({

	propTypes: {
		orient: PropTypes.string,
		dimensions: PropTypes.object,
		xScale: PropTypes.func,
		tickValues: PropTypes.array,
		tickFormat: PropTypes.func,
		textAnchor: PropTypes.string
	},

	getInitialState: function() {
		return {
			lastTickWidth: 0
		}
	},

	componentDidMount: function() {
		this._setLastTickWidth(this.props);
	},

	componentWillReceiveProps: function(nextProps) {
		this._setLastTickWidth(nextProps);
	},

	getDefaultProps: function() {
		return {
			orient: "bottom",
			tickFormat: function(d) { return d; },
			textAnchor: "middle",
			fontFamily: "16px Khula-Light"
		}
	},

	_setLastTickWidth: function(props) {
		var tickValues = props.tickValues;
		var lastTick = props.tickFormat(tickValues[tickValues.length - 1]);
		var lastTickWidth;

		switch (props.textAnchor) {
			case 'middle':
				lastTickWidth = help.computeTextWidth(lastTick, props.fontFamily) / 2;
				break;
			case 'start':
				lastTickWidth = help.computeTextWidth(lastTick, props.fontFamily);
				break;
			case 'end':
				lastTickWidth = 0;
				break;
			default:
				lastTickWidth = 0;
				break;
		}

		if (lastTickWidth !== this.state.lastTickWidth) {
			this.setState({ lastTickWidth: lastTickWidth });
		};
	},

	_generateTicks: function(props) {
		var lastTickWidth = this.state.lastTickWidth;

		return map(props.tickValues, function(tickValue, i) {
			var xVal = props.xScale(tickValue);

			// offset a tick label that is over the edge
			if (xVal + lastTickWidth > props.dimensions.width) {
				xVal += (props.dimensions.width - (xVal + lastTickWidth));
			}

			return (
				<text key={i} textAnchor={props.textAnchor}
					className={"tick orient-" + props.orient}
					x={xVal} y={0} dy={DY}
				>
					{props.tickFormat(tickValue)}
				</text>
			)
		});
	},

	_getTransform: function(orient, height) {
		if (orient === "top") {
			return 0;
		} else if (orient === "bottom") {
			return height;
		}
	},

	render: function() {
		var props = this.props;
		var ticks = this._generateTicks(props);
		var transformY = this._getTransform(props.orient, props.dimensions.height);

		return (
			<g
				className="axis horizontal-axis"
				transform={"translate(" + [0, transformY + 20] + ")"}
			>
				{ticks}
			</g>
		);
	}

});

module.exports = HorizontalAxis;
