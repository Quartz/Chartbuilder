// Export chart to PNG or SVG

import React, {PropTypes} from 'react';
import ReactDom from 'react-dom';
const cx = require("classnames");
const d3 = require("d3");

import {Button} from 'chartbuilder-ui';
const saveSvgAsPng = require("save-svg-as-png");

function outerHTML(el) {
	const outer = document.createElement("div");
	outer.appendChild(el);
	return outer.innerHTML;
}

/**
 * ### Buttons that allow the user to export a chart to an image or Svg.
 * @instance
 * @memberof editors
 */
class ChartExport extends React.Component {

	constructor(props) {
    super(props);

    this.state = {
			enableSvgExport: true,
		};
		this.downloadSVG = this.downloadSVG.bind(this);
		this.downloadPNG = this.downloadPNG.bind(this);
		this.downloadJSON = this.downloadJSON.bind(this);
  }

	componentDidMount () {
		let enableSvgExport;
		let chartNode = null;

		// SVG output won't work on most non-Chrome browsers, so we try it first. If
		// `createSVGFile()` doesnt work we will disable svg download but still allow png.
		// TODO: figure out what exactly is breaking FF
		const chart = document
			.getElementsByClassName(this.props.svgWrapperClassName)[0]
			.getElementsByClassName("chartbuilder-svg")[0];

		this.setState({
			chartNode: chart,
			enableSvgExport: true
		});
	}

	componentWillReceiveProps (nextProps) {
		const chart = document
			.getElementsByClassName(this.props.svgWrapperClassName)[0]
			.getElementsByClassName("chartbuilder-svg")[0];

		this.setState({ chartNode: chart });
	}

	_addIDsForIllustrator (node) {
		const chart = d3.select(node);
		let classAttr = "";

		chart
			.attr("id","chartbuilder-export")
			.selectAll("g")
			.attr("id",function(d,i){
				try {
					classAttr = this.getAttribute("class").split(" ");
					return classAttr.join("::") + (classAttr == "tick" ? "::" + this.textContent : "");
				}
				catch(e) {
					return null;
				}
			});

		return chart[0][0];
	}

	_makeFilename (extension) {
		const filename = this.props.data.reduce(function(a, b, i) {
			if (a.length === 0) {
				return b.name;
			} else {
				return [a, b.name].join("_");
			}
		}, this.props.metadata.title);
		return [
			(filename + "_chartbuilder").replace(/\s/g, "_"),
			extension
		].join(".");
	}

	downloadPNG () {
		const filename = this._makeFilename("png");
		saveSvgAsPng.saveSvgAsPng(this.state.chartNode, filename, { scale: 2.0 });
	}

	_autoClickDownload (filename, href) {
		const a = document.createElement('a');
		a.download = filename;
		a.href = href;
		document.body.appendChild(a);
		a.addEventListener("click", function(e) {
			a.parentNode.removeChild(a);
		});
		a.click();
	}

	downloadSVG () {
		const filename = this._makeFilename("svg");
		const chart = this._addIDsForIllustrator(this.state.chartNode);
		const autoClickDownload = this._autoClickDownload;
		saveSvgAsPng.svgAsDataUri(chart, {
			cleanFontDefs: true,
			fontFamilyRemap: {
				"Khula-Light": "Khula Light",
				"Khula-Regular": "Khula",
			}
		}, function(uri) {
			autoClickDownload(filename, uri);
		});
	}

	downloadJSON () {
		json_string = JSON.stringify({
			chartProps: this.props.model.chartProps,
			metadata: this.props.model.metadata
		}, null, "\t")

		const filename = this._makeFilename("json");
		const href = "data:text/json;charset=utf-8," + encodeURIComponent(json_string);
		this._autoClickDownload(filename, href);
	}

	setAdvancedOptionState () {
		this.setState({
			showAdvancedOptions: !this.state.showAdvancedOptions
		});
	}

	render () {
		const self = this;

		const chartExportButtons = [
			<Button
				key="png-export"
				className="export-button"
				onClick={this.downloadPNG}
				text="Image"
			/>
		];

		if (this.state.enableSvgExport) {
			chartExportButtons.push(
				<Button
					key="svg-export"
					className="export-button"
					onClick={this.downloadSVG}
					text="SVG"
				/>
			);
		}

		if (this.props.enableJSONExport) {
			chartExportButtons.push(
				<Button
					key="json-export"
					className="export-button"
					onClick={this.downloadJSON}
					text="JSON"
				/>
			);
		}

		return (
			<div className="editor-options">
				<h2><span className="step-number">{this.props.stepNumber}</span><span>Export your chart</span></h2>
					<div className="export-button-wrapper">
						{chartExportButtons}
					</div>
			</div>
		);
	}
}

ChartExport.propTypes = {
	stepNumber: PropTypes.string,
	svgWrapperClassName: PropTypes.string.isRequired,
	enableJSONExport: PropTypes.bool,
	sendBase64String: PropTypes.func
};

ChartExport.defaultProps = {
	enableJSONExport: false,
};

module.exports = ChartExport;
