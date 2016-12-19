// Svg text elements used to describe chart
var React = require("react");
var PropTypes = React.PropTypes;
var isNumber = require("lodash/isNumber");

var SeriesLabel = React.createClass({

	propTypes: {
		text: PropTypes.string,
		translate: PropTypes.array,
		colorIndex: PropTypes.number
	},

	getDefaultProps: function() {
		return {
			translate: [0, 0],
			text: "SeriesLabel",
			colorIndex: 0,
			xVal: 0
		};
	},

	render: function() {
		var props = this.props;
		var x;

		if (isNumber(props.x)) {
			x = props.x;
		} else {
			x = props.xScale(props.xVal);
		}

		return (
			<text
				className={"series-label color-index-" + props.colorIndex}
				transform={"translate(" + props.translate + ")"}
				x={x}
			>
				{props.text}
			</text>
		);
	}

});

module.exports = SeriesLabel;
