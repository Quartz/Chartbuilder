var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");
var assign = require("lodash/assign");
var BackgroundRect = require("./BackgroundRect.jsx");
var SvgText = require("./SvgText.jsx");

var Chart = React.createClass({

	propTypes: {
		xScale: PropTypes.func,
		yScale: PropTypes.func,
		outerDimensions: PropTypes.object,
		dimensions: PropTypes.object,
		chartType: PropTypes.string,
		metadata: PropTypes.object,
		margin: PropTypes.object,
		displayConfig: PropTypes.object
	},

	_createTitle: function() {
		return (
			<SvgText
				text={this.props.metadata.title}
				key="title"
				translate={[5, 10]}
				align="top"
				className="svg-text-title"
			/>
		);
	},

	_getYOffset: function(props) {
		if (props.metadata.title.length > 0) {
			return props.displayConfig.afterTitle;
		} else {
			return 0;
		}
	},


	render: function() {
		var props = this.props;
		var children = React.Children.toArray(props.children);
		var childrenWithProps = map(children, function(child) {
			var childProps = assign({}, props, child.props);
			return React.cloneElement(child, childProps);
		});

		var translate = [
			props.margin.left,
			props.margin.top + this._getYOffset(props)
		];

		return (
			<svg width={props.outerDimensions.width} height={props.outerDimensions.height}>
				<BackgroundRect dimensions={props.outerDimensions} />
				{this._createTitle()}
				<g
					className={"chart chart-" + props.chartType}
					transform={"translate(" + translate + ")"}
				>
					{childrenWithProps}
				</g>
			</svg>
		);
	}

});

module.exports = Chart;
