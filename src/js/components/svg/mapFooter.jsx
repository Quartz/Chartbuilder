// Footer of the chart, which contains the credit and source text.
// This component is special because it must drop the source text to its own
// line when the text gets too long, and it must wrap the text when it then
// exceeds the width of the chart area.

import React, {PropTypes} from 'react';
import ReactDom from 'react-dom';
import update from 'react-addons-update';

import SvgText from "./SvgText.jsx";
import Logo from "./../shared/Logo.jsx";
/**
 * Render a footer with the chart credit and source
 * @instance
 * @memberof RendererWrapper
 */
class MapFooter extends React.Component {

	constructor(props) {
    super(props);

    this._config = {
			creditSourcePadding: 20,
			heightPerLine: 15,
			sampleString: "abcdefg hijkl mnop qrstu vwxyz 1234 56789"
		}

    this.state = {
			creditDimensions: {
				width: 0,
				height: 0
			},
			pixelsPerCharacter: 0
		};

		this._handleStateUpdate = this._handleStateUpdate.bind(this);
  }

	shouldComponentUpdate (nextProps, nextState) {
		return true;
	}

	_handleStateUpdate (k, v) {
		let newValue = {};
		newValue[k] = v;
		this.setState(update(this.state, { $merge: newValue }));
	}

	_createSourceLine () {
		let sourceText;
		let sourceLine;
		if (this.props.metadata.source && this.props.metadata.source !== "") {
			sourceText = this.props.metadata.source;
		} else {
			sourceText = "";
		}

		if (this.props.metadata.notes && this.props.metadata.notes !== "") {
			sourceLine = [sourceText, this.props.metadata.notes].join(" | ");
		} else {
			sourceLine = sourceText;
		}

		return sourceLine;
	}

	render () {
		let sourceLineText = this._createSourceLine();
		let chartSource = null;

		if (sourceLineText.length > 0) {
			chartSource = (
				<ChartSourceText
					text={sourceLineText}
					creditSourcePadding={this._config.creditSourcePadding}
					className="svg-text-source"
					translate={this.props.translate}
					heightPerLine={this._config.heightPerLine}
					extraHeight={this.props.extraHeight}
					creditMargin={this.props.creditMargin}
					creditDimensions={this.state.creditDimensions}
					pixelsPerCharacter={this.state.pixelsPerCharacter}
					chartWidth={this.props.chartWidth}
					updateState={this._handleStateUpdate}
					onUpdate={this.props.onUpdate}
				/>
			);
		}

		return (
			<g className={this.props.className}>
				<HiddenPixelMeasure
					sampleString={this._config.sampleString}
					pixelsPerCharacter={this.state.pixelsPerCharacter}
					onUpdate={this._handleStateUpdate.bind(this, "pixelsPerCharacter")}
				/>
				{chartSource}
				<Logo 
					transform={this.props.translate}
				/>
			</g>
		);
	}
};

MapFooter.propTypes = {
	metadata: PropTypes.object,
	extraHeight: PropTypes.number,
	translate: PropTypes.object,
	onUpdate: PropTypes.func,
	chartWidth: PropTypes.number
}

// Credit text
const ChartCreditText = React.createClass({

	componentDidMount: function() {
		let node = ReactDom.findDOMNode(this);
		let bbox = node.getBBox();
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
class ChartSourceText extends React.Component{

	constructor(props) {
    super(props);

		this.state = {
			ownLine: false
		};
		
		this._handleHeightUpdate = this._handleHeightUpdate.bind(this);
  }

	_handleHeightUpdate (height) {
		this.props.onUpdate(height);
	}

	render () {
		let _translate = this.props.translate;
		let translate;
		let classNameDirection;
		let maxWidth;

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
};

// Hidden element that renders the text of parent's `sampleString` and sets in
// parent state the sample string's width per character.
const HiddenPixelMeasure = React.createClass({

	componentDidMount: function() {
		let textLength = ReactDom.findDOMNode(this).getComputedTextLength();
		this.props.onUpdate(textLength / this.props.sampleString.length);
	},

	componentDidUpdate: function() {
		let textLength = ReactDom.findDOMNode(this).getComputedTextLength();
		let ppc = textLength / this.props.sampleString.length;
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
});

module.exports = MapFooter;
