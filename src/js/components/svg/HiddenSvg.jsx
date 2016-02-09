var React = require("react");
var ReactDOM = require("react-dom")
var isEqual = require("lodash/isEqual");
var reduce = require("lodash/reduce");

var PureRenderMixin = require("react-addons-pure-render-mixin");
var PropTypes = React.PropTypes;

/*
 * Render hidden SVG elements that we will use to compute their properties
 * post-render, most importantly `getBBox()` or `getBoundingClientRect()`
 * We do this in React so that these values can be incorporated into the
 * React/Flux data flow.
 *
 * We are more aggressive with using `shouldComponentUpdate` in these components
 * because they have to talk to the actual DOM (not virtual DOM) and are
 * therefore expensive
*/

// TODO: We should make these more general components. Right now they are specific
// to axes/bar labels, but they could easily be in the form of `findWidestText`
// or `getFurthestRigth` or that kind of thing.

/**
 * Given a set of formatted text, render hidden axis ticks and find the largest
 * width among them, sending that number back to the parent
 * @instance
 * @memberof RendererWrapper
 */
var HiddenSvgAxis = React.createClass({

	propTypes: {
		className: PropTypes.string,
		onUpdate: PropTypes.func.isRequired,
		formattedText: PropTypes.array.isRequired,
		blockerRectOffset: PropTypes.number.isRequired,
		maxTickWidth: PropTypes.number
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		var isTextNew = !isEqual(this.props.formattedText, nextProps.formattedText);
		if (isTextNew) {
			return true;
		}
		var isMaxNew = (this.props.maxTickWidth !== nextProps.maxTickWidth);
		if (isMaxNew) {
			return true;
		}
		var isWidthNew = (this.props.chartWidth !== nextProps.chartWidth);
		if (isWidthNew) {
			return true;
		}
		return false;
	},

	_getMaxTickWidth: function(el) {
		var text = el.getElementsByTagName("text");

		var newMaxTickWidth = reduce(text, function(prevWidth, currNode) {
			var currWidth = currNode.getComputedTextLength();
			return Math.max(prevWidth, currWidth);
		}, 0);

		// `newMaxTickWidth` accounts for size of the text, but we need to
		// add the size of the offset of the background blocker rect
		newMaxTickWidth = newMaxTickWidth + this.props.blockerRectOffset;
		return newMaxTickWidth;
	},

	componentDidMount: function(prevProps, prevState) {
		var newMaxTickWidth = this._getMaxTickWidth(ReactDOM.findDOMNode(this));
		this.props.onUpdate(newMaxTickWidth);
	},

	componentDidUpdate: function(prevProps, prevState) {
		var newMaxTickWidth = this._getMaxTickWidth(ReactDOM.findDOMNode(this));
		if (newMaxTickWidth !== this.props.maxTickWidth) {
			// update `maxTickWidth` object in parent component, as it gets passed to
			// `XYChart`, a sibling of this component.
			this.props.onUpdate(newMaxTickWidth);
		}
	},

	render: function() {
		var tickText = this.props.formattedText.map(function(tick, i) {
			// FYI: these classNames must match the classNames used to render your
			// actual ticks in order for this to work
			// TODO: pass className via prop
			return (
				<g key={i} className={this.props.className}>
					<text style={{"textAnchor": "start"}} x="0" y="0" dy="0.32em">{tick}</text>
				</g>
			);
		}, this);
		return (
			<g className="d4 hidden-svg" transform={"translate(" + [0, -100] + ")"}>
				<g className="axis">
					{tickText}
				</g>
			</g>
		);
	}

});

/**
 * Given a scale, render hidden bar grid labels to find which is furthest right.
 * This allows us to increase the padding of these charts to account for the
 * extra width
 * @instance
 * @memberof RendererWrapper
 */
var HiddenSvgBarLabels = React.createClass({

	propTypes: {
		onUpdate: PropTypes.func.isRequired,
		scale: PropTypes.object.isRequired,
		blockerRectOffset: PropTypes.number.isRequired,
		chartWidth: PropTypes.number.isRequired,
		labelOverlap: PropTypes.number.isRequired
	},

	getInitialState: function() {
		return {
			effectiveWidth: 0, // width of the chart accounting for margin/padding
			parentSVG: null
		}
	},

	_getSVGParent: function(el) {
		// we need the parent SVG to compute mouse position
		if (el.parentNode.tagName == "svg") {
			return el.parentNode;
		} else {
			return this._getSVGParent(el.parentNode);
		}
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		var prevScale = this.props.scale;
		var newScale = nextProps.scale;
		var newPrefix = (prevScale.prefix !== newScale.prefix);
		var newSuffix = (prevScale.suffix !== newScale.suffix);
		if (newPrefix || newSuffix) {
			return true;
		}
		if (!isEqual(prevScale.domain, newScale.domain)) {
			return true;
		}
		if (this.state.effectiveWidth !== nextState.effectiveWidth) {
			return true;
		}
		return false;
	},

	_getLabelOverlap: function(chartWidth) {
		var el = ReactDOM.findDOMNode(this);
		var text = el.querySelectorAll("text");
		// Find the top bar grid label that is furthest to the right
		var furthestRight = reduce(text, function(prevRight, currNode, ix) {
			var currRight = currNode.getBoundingClientRect().right;
			return Math.max(prevRight, currRight);
		}, 0);

		// Find the label that is furthest to the right, accounting for the
		// block rect and margin
		var parentLeft = this.state.parentSVG.getBoundingClientRect().left;
		furthestRight += this.props.blockerRectOffset * 2 + this.props.margin.right;

		if (furthestRight > (chartWidth + parentLeft)) {
			return furthestRight - (chartWidth + parentLeft);
		} else {
			return 0;
		}
	},

	_createScale: function(props) {
		// Create a d3 scale based on our chart properties, so that we can "place"
		// the hidden label and see if it is too far to the right
		return d3.scale.linear()
			.range([props.offset.left, props.chartWidth - props.offset.right])
			.domain(props.scale.domain);
	},

	componentWillReceiveProps: function(nextProps) {
		// Find the effective width of the chart area and set this in current
		// component's state
		this.setState({
			effectiveWidth: nextProps.chartWidth - nextProps.margin.right - nextProps.margin.left
		});
	},

	componentDidMount: function(prevProps, prevState) {
		// Set the initial labelOverlap on mount
		this.setState({ parentSVG: this._getSVGParent(ReactDOM.findDOMNode(this))}, function() {
			var labelOverlap = this._getLabelOverlap(this.props.chartWidth);
			this.props.onUpdate(labelOverlap);
		})
	},

	componentDidUpdate: function(prevProps, prevState) {
		var labelOverlap = this._getLabelOverlap(this.props.chartWidth);
		if (labelOverlap !== this.props.labelOverlap) {
			// Update new `labelOverlap` if it has changed
			this.props.onUpdate(labelOverlap);
		}
	},

	render: function() {
		var scale = this.props.scale;
		var d3scale = this._createScale(this.props);

		var labelText = this.props.formattedText.map(function(label, i) {
			var translateX;
			if (label == "no data") {
				translateX = d3scale(scale.domain[0]);
			} else {
				translateX = d3scale(label.value);
			}
			var translate = [ translateX, -100 ];
			// ATTN: these classNames must match the classNames used to render your
			// actual ticks in order for this to work
			return (
				<g
					key={i}
					className={this.props.className}
					transform={"translate(" + translate + ")"}
				>
					<text>{label.formatted}</text>
				</g>
			);
		}, this);
		return (
			<g className="d4 hidden-svg">
				<g className="axis">
					{labelText}
				</g>
			</g>
		);
	}

});

module.exports = {
	HiddenSvgAxis: HiddenSvgAxis,
	HiddenSvgBarLabels: HiddenSvgBarLabels
};
