import React, {PropTypes} from 'react';

class BackgroundRect extends React.Component{
	render () {
		const props = this.props;
		return (
			<g className="svg-background-wrap">
				<rect
					className="svg-background"
					width={props.dimensions.width}
					height={props.dimensions.height}
					x={props.x}
					y={props.y}
				/>
			</g>
		);
	}
};

BackgroundRect.propTypes = {
	dimensions: PropTypes.shape({
		width: PropTypes.number,
		height: PropTypes.number
	}),
	x: PropTypes.number,
	y: PropTypes.number
}
BackgroundRect.defaultProps = {
	x: 0,
	y: 0
}

module.exports = BackgroundRect;
