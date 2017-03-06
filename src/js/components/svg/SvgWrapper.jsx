import React, {PropTypes} from 'react';
const BackgroundRect = require("./BackgroundRect.jsx");
const SvgText = require("./SvgText.jsx");
const ChartFooter = require("./ChartFooter.jsx");

class SvgWrapper extends React.Component {

	_createTitle (props) {
		return (
			<SvgText
				text={props.metadata.title}
				key="title"
				translate={[
					props.displayConfig.margin.left,
					props.displayConfig.margin.top
				]}
				align="top"
				className="svg-text-title"
			/>
		);
	}

	_createSubTitle (props) {
		const subtitleTrans = props.displayConfig.margin.subtitle || 0;
		return (
			<SvgText
				text={props.metadata.subtitle}
				key="subtitle"
				translate={[
					props.displayConfig.margin.left,
					subtitleTrans + props.displayConfig.margin.top
				]}
				align="top"
				className="svg-text-subtitle"
			/>
		);
	}

	_getYOffset (props, forSVG) {
		let afterTitle = 0;
		if (props.metadata.title.length > 0) {
			afterTitle = props.displayConfig.afterTitle + afterTitle;
			if (props.metadata.subtitle && props.isSmall && !forSVG) {
				afterTitle = afterTitle + props.displayConfig.margin.subtitle;
			}
		}
		if (!forSVG && props.isMap && props.metadata.subtitle) {
			afterTitle = afterTitle + props.displayConfig.margin.subtitle;
		}
		return afterTitle
	}

	render () {
		const props = this.props;
		const margin = props.displayConfig.margin;
		const yOffset = this._getYOffset(props);
		// Add to the chart margin if title is present

		const outerDimensions = {
			width: props.outerDimensions.width,
			height: props.outerDimensions.height + yOffset
		};

		const translate = {
			top: margin.top,
			right: outerDimensions.width - margin.right,
			bottom: outerDimensions.height - margin.bottom,
			left: margin.left
		};

		return (
			<svg
				className={["chartbuilder-svg", props.svgSizeClass].join(" ")}
				width={outerDimensions.width}
				height={outerDimensions.height}
			>
				<BackgroundRect dimensions={outerDimensions} />
				{this._createTitle(props)}
				{this._createSubTitle(props)}
				<g
					className="chart-margin"
					transform={"translate(" + [translate.left, translate.top + this._getYOffset(props, true)] + ")"} >
					{props.children}
				</g>
				<ChartFooter
					metadata={props.metadata}
					key="chartFooter"
					translate={translate}
					className="svg-credit-data"
				/>
			</svg>
		);
	}
};

SvgWrapper.propTypes = {
	outerDimensions: PropTypes.object,
	metadata: PropTypes.object,
	margin: PropTypes.object,
	displayConfig: PropTypes.object
};

module.exports = SvgWrapper;
