var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");
var assign = require("lodash/assign");

var BackgroundRect = React.createClass({

	propTypes: {
		dimensions: PropTypes.object
	},

	getDefaultProps: function() {
		return {
			className: "svg-background",
			x: 0,
			y: 0
		}
	},

	render: function() {
		var props = this.props;
		return (
			<g className="svg-background-wrap">
				<rect
					className={props.className}
					width={props.dimensions.width}
					height={props.dimensions.height}
					x={props.x}
					y={props.y}
				/>
			</g>
		);
	}

});

module.exports = BackgroundRect;
