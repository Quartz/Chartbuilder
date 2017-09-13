import React, {PropTypes} from 'react';
import {map, assign} from 'lodash';
// Wrapper class for charts. Clone all children assigning them the properties of
// this component so that chart configuration is passed down
class Chart extends React.Component {
	render () {
		const props = this.props;
		const children = React.Children.toArray(props.children);
		const childrenWithProps = map(children, function(child) {
			const childProps = assign({}, props, child.props);
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
};

Chart.propTypes = {
	xScale: PropTypes.func,
	yScale: PropTypes.func,
	dimensions: PropTypes.object,
	chartType: PropTypes.string,
	metadata: PropTypes.object,
	translate: PropTypes.array
}

Chart.defaultProps = {
	translate: [0, 0],
	tickTextHeight: 0
}

module.exports = Chart;
