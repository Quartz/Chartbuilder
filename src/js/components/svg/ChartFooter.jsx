// Footer of the chart, which contains the credit and source text.

var React = require("react");
var ReactDom = require("react-dom")
var PropTypes = React.PropTypes;
var SvgText = require("./SvgText.jsx");
var update = require("react-addons-update");

/**
 * Render a footer with the chart credit and source
 * @instance
 * @memberof RendererWrapper
 */
var ChartFooter = React.createClass({

	propTypes: {
		metadata: PropTypes.object,
		translate: PropTypes.object,
		chartWidth: PropTypes.number
	},

	_createSourceLine: function() {
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
	},

	render: function() {
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

});

module.exports = ChartFooter;
