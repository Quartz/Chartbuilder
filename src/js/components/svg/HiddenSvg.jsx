import React, {PropTypes} from 'react';
import ReactDom from 'react-dom';
import {isEqual, reduce} from 'lodash';

const PureRenderMixin = require("react-addons-pure-render-mixin");

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
class HiddenSvgAxis extends React.Component {

	shouldComponentUpdate (nextProps, nextState) {
		const isTextNew = !isEqual(this.props.formattedText, nextProps.formattedText);
		if (isTextNew) {
			return true;
		}
		const isMaxNew = (this.props.maxTickWidth !== nextProps.maxTickWidth);
		if (isMaxNew) {
			return true;
		}
		const isWidthNew = (this.props.chartWidth !== nextProps.chartWidth);
		if (isWidthNew) {
			return true;
		}
		return false;
	}

	_getMaxTickWidth (el) {
		const text = el.getElementsByTagName("text");

		const newMaxTickWidth = reduce(text, function(prevWidth, currNode) {
			const currWidth = currNode.getComputedTextLength();
			return Math.max(prevWidth, currWidth);
		}, 0);

		// `newMaxTickWidth` accounts for size of the text, but we need to
		// add the size of the offset of the background blocker rect
		newMaxTickWidth = newMaxTickWidth + this.props.blockerRectOffset;
		return newMaxTickWidth;
	}

	componentDidMount (prevProps, prevState) {
		const newMaxTickWidth = this._getMaxTickWidth(ReactDOM.findDOMNode(this));
		this.props.onUpdate(newMaxTickWidth);
	}

	componentDidUpdate (prevProps, prevState) {
		const newMaxTickWidth = this._getMaxTickWidth(ReactDOM.findDOMNode(this));
		if (newMaxTickWidth !== this.props.maxTickWidth) {
			// update `maxTickWidth` object in parent component, as it gets passed to
			// `XYChart`, a sibling of this component.
			this.props.onUpdate(newMaxTickWidth);
		}
	}

	render () {
		const tickText = this.props.formattedText.map(function(tick, i) {
			// FYI: these classNames must match the classNames used to render your
			// actual ticks in order for this to work
			// TODO: pass className via prop
			return (
				<text className="tick" key={i} x="0" y="0" dy="0.32em">{tick}</text>
			);
		}, this);
		return (
			<g className="hidden-svg" transform={"translate(" + [0, 100] + ")"}>
				<g className="axis">
					{tickText}
				</g>
			</g>
		);
	}
};

HiddenSvgBarLabels.propTypes = propTypes: {
	className: PropTypes.string,
	onUpdate: PropTypes.func.isRequired,
	formattedText: PropTypes.array.isRequired,
	blockerRectOffset: PropTypes.number.isRequired,
	maxTickWidth: PropTypes.number
}

/**
 * Given a scale, render hidden bar grid labels to find which is furthest right.
 * This allows us to increase the padding of these charts to account for the
 * extra width
 * @instance
 * @memberof RendererWrapper
 */
class HiddenSvgBarLabels extends React.Component {

	constructor(props) {
    super(props);
    this.state = {
			effectiveWidth: 0, // width of the chart accounting for margin/padding
			parentSVG: null
		};
  }

	_getSVGParent (el) {
		// we need the parent SVG to compute mouse position
		if (el.parentNode.tagName == "svg") {
			return el.parentNode;
		} else {
			return this._getSVGParent(el.parentNode);
		}
	}

	shouldComponentUpdate (nextProps, nextState) {
		const prevScale = this.props.scale;
		const newScale = nextProps.scale;
		const newPrefix = (prevScale.prefix !== newScale.prefix);
		const newSuffix = (prevScale.suffix !== newScale.suffix);
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
	}

	_getLabelOverlap (chartWidth) {
		const el = ReactDOM.findDOMNode(this);
		const text = el.querySelectorAll("text");
		// Find the top bar grid label that is furthest to the right
		let furthestRight = reduce(text, function(prevRight, currNode, ix) {
			const currRight = currNode.getBoundingClientRect().right;
			return Math.max(prevRight, currRight);
		}, 0);

		// Find the label that is furthest to the right, accounting for the
		// block rect and margin
		const parentLeft = this.state.parentSVG.getBoundingClientRect().left;
		furthestRight += this.props.blockerRectOffset * 2 + this.props.margin.right;

		if (furthestRight > (chartWidth + parentLeft)) {
			return furthestRight - (chartWidth + parentLeft);
		} else {
			return 0;
		}
	}

	_createScale (props) {
		// Create a d3 scale based on our chart properties, so that we can "place"
		// the hidden label and see if it is too far to the right
		return d3.scale.linear()
			.range([props.offset.left, props.chartWidth - props.offset.right])
			.domain(props.scale.domain);
	}

	componentWillReceiveProps (nextProps) {
		// Find the effective width of the chart area and set this in current
		// component's state
		this.setState({
			effectiveWidth: nextProps.chartWidth - nextProps.margin.right - nextProps.margin.left
		});
	}

	componentDidMount (prevProps, prevState) {
		// Set the initial labelOverlap on mount
		this.setState({ parentSVG: this._getSVGParent(ReactDOM.findDOMNode(this))}, function() {
			const labelOverlap = this._getLabelOverlap(this.props.chartWidth);
			this.props.onUpdate(labelOverlap);
		})
	}

	componentDidUpdate (prevProps, prevState) {
		const labelOverlap = this._getLabelOverlap(this.props.chartWidth);
		if (labelOverlap !== this.props.labelOverlap) {
			// Update new `labelOverlap` if it has changed
			this.props.onUpdate(labelOverlap);
		}
	}

	render () {
		const props = this.props;
		const scale = props.scale;
		const d3scale = this._createScale(props);

		const labelText = props.formattedText.map(function(label, i) {
			const translateX = (label == "no data") ? d3scale(scale.domain[0]) : d3scale(label.value);
			const translate = [ translateX, -100 ];
			// ATTN: these classNames must match the classNames used to render your
			// actual ticks in order for this to work
			return (
				<g
					key={i}
					className={props.className}
					transform={"translate(" + translate + ")"}
				>
					<text>{label.formatted}</text>
				</g>
			);
		}, this);
		return (
			<g className="hidden-svg">
				<g className="axis">
					{labelText}
				</g>
			</g>
		);
	}
};

HiddenSvgBarLabels.propTypes = {
	onUpdate: PropTypes.func.isRequired,
	scale: PropTypes.object.isRequired,
	blockerRectOffset: PropTypes.number.isRequired,
	chartWidth: PropTypes.number.isRequired,
	labelOverlap: PropTypes.number.isRequired
}

module.exports = {
	HiddenSvgAxis: HiddenSvgAxis,
	HiddenSvgBarLabels: HiddenSvgBarLabels
};
