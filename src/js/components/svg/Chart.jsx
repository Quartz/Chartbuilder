// Svg text elements used to describe chart
var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");
var assign = require("lodash/assign");
var BackgroundRect = require("./BackgroundRect.jsx");

var Chart = React.createClass({

	propTypes: {
		xScale: PropTypes.func,
		yScale: PropTypes.func,
		dimensions: PropTypes.object,
		chartType: PropTypes.string,
		metadata: PropTypes.object,
		margin: PropTypes.object
	},

	render: function() {
		var props = this.props;
		var children = React.Children.toArray(props.children);
		var childrenWithProps = map(children, function(child) {
			var childProps = assign({}, props, child.props);
			return React.cloneElement(child, childProps);
		});

		return (
			<svg width={dimensions.width} height={dimensions.height}>
				<h2>{metadata.title}</h2>
				<BackgroundRect dimensions={props.dimensions} />
				<g className={"chart chart-" + props.chartType}>
					{childrenWithProps}
				</g>
			</svg>
		);
	}

});

module.exports = Chart;
