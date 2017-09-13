// Footer of the chart, which contains the credit and source text.

import React, {PropTypes} from 'react';
import ReactDom from 'react-dom';
import update from 'react-addons-update';

const SvgText = require("./SvgText.jsx");

/**
 * Render a footer with the chart credit and source
 * @instance
 * @memberof RendererWrapper
 */

class ChartFooter extends React.Component {

	_createSourceLine () {
		var sourceLine;
		if (this.props.metadata.source && this.props.metadata.source !== "") {
			sourceLine = "Data: " + this.props.metadata.source;
		} else {
			sourceLine = "";
		}

		if (this.props.metadata.notes && this.props.metadata.notes !== "") {
			sourceLine = [sourceLine, this.props.metadata.notes].join(" | ");
		}

		return sourceLine;
	}

	render () {
		var sourceLineText = this._createSourceLine();
		return (
			<g className={this.props.className}>
				<SvgText
					text={this.props.metadata.credit}
					translate={[this.props.translate.left, this.props.translate.bottom]}
					className="svg-text-credit"
				/>
				<SvgText
					text={sourceLineText}
					translate={[this.props.translate.right, this.props.translate.bottom]}
					className={"svg-text-source right"}
				/>
			</g>
		);
	}
};

ChartFooter.propTypes = {
	metadata: PropTypes.object,
	translate: PropTypes.object,
	chartWidth: PropTypes.number
}
/*
// Credit text
var ChartCreditText = React.createClass({

	componentDidMount: function() {
		var node = ReactDom.findDOMNode(this);
		var bbox = node.getBBox();
		this.props.updateState(bbox.width);
	},

	render: function() {
		return (
			<SvgText
				text={this.props.text}
				translate={this.props.translate}
				className="svg-text-credit"
			/>
		);
	}
});

// Source text
var ChartSourceText = React.createClass({

	getInitialState: function() {
		return {
			ownLine: false // whether source will fall onto its own line
		}
	},

	_handleHeightUpdate: function(height) {
		this.props.onUpdate(height);
	},

	render: function() {
		var _translate = this.props.translate;
		var translate;
		var classNameDirection;
		var maxWidth;

		if (this.state.ownLine) {
			translate = [_translate.left, _translate.bottom - this.props.extraHeight + this.props.heightPerLine];
			classNameDirection = "left"
			maxWidth = this.props.chartWidth;
		} else {
			translate = [_translate.right, _translate.bottom];
			classNameDirection = "right"
			maxWidth = this.props.chartWidth - this.props.creditDimensions.width - this.props.creditSourcePadding;
		}

		return (
			<SvgText
				text={this.props.text}
				wrap={false}
				heightPerLine={this.props.heightPerLine}
				pixelsPerCharacter={this.props.pixelsPerCharacter}
				maxWidth={this.props.chartWidth}
				translate={translate}
				onUpdate={this._handleHeightUpdate}
				className={"svg-text-source " + classNameDirection}
			/>);
	}
});

// Hidden element that renders the text of parent's `sampleString` and sets in
// parent state the sample string's width per character.
var HiddenPixelMeasure = React.createClass({

	componentDidMount: function() {
		var textLength = ReactDom.findDOMNode(this).getComputedTextLength();
		this.props.onUpdate(textLength / this.props.sampleString.length);
	},
	shouldComponentUpdate: function(nextProps) {
		if (nextProps.sampleString !== this.props.sampleString) return true;
		return false;
	},
	componentDidUpdate: function() {
		var textLength = ReactDom.findDOMNode(this).getComputedTextLength();
		var ppc = textLength / this.props.sampleString.length;
		if (ppc !== this.props.pixelsPerCharacter) {
			this.props.onUpdate(ppc);
		}
	},

	render: function() {
		return (
			<text className="hidden-svg svg-text svg-text-source">
				{this.props.sampleString}
			</text>
		);
	}

});*/

module.exports = ChartFooter;
