var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");
var assign = require("lodash/assign");

var XYChart = React.createClass({

	propTypes: {
		xScale: PropTypes.object,
		yScale: PropTypes.func,
		dimensions: PropTypes.object,
		chartType: PropTypes.string,
		metadata: PropTypes.object,
		translate: PropTypes.array
	},

	getDefaultProps: function() {
		return {
			translate: [0, 0]
		}
	},

	render: function() {
		var props = this.props;
		var children = React.Children.toArray(props.children);
		var childrenWithProps = map(children, function(child) {
			var childProps = assign({}, props, child.props);
			return React.cloneElement(child, childProps);
		});

		return (
			<g
				className={"chart chart-" + props.chartType}
				transform={"translate(" + props.translate + ")"}
			>
				{childrenWithProps}
			</g>
		);
	}

});

module.exports = XYChart;
