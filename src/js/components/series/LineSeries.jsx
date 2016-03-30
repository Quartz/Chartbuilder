// Svg text elements used to describe chart
var React = require("react");
var PropTypes = React.PropTypes;

var LineSeries = React.createClass({

	propTypes: {
		data: PropTypes.array,
		lineFunc: PropTypes.func,
	},

	render: function() {
		var props = this.props;
		return (
			<path
				className={"series-line-path color-index-" + props.colorIndex}
				d={props.lineFunc(props.data)}
			/>
		);
	}

});

module.exports = LineSeries;
