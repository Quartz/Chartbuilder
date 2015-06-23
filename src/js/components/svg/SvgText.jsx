// Svg text elements used to describe chart
var React = require("react");
var PropTypes = React.PropTypes;
var shallowEqual = require("react/lib/shallowEqual");
var ChartViewActions = require("../../actions/ChartViewActions");

var config = {
	textDy: 0.7,
	textLineHeight: 1.2
};

/**
 * An Svg <text> element with experimental text wrapping support
 * @instance
 * @memberof RendererWrapper
 */
var SvgText = React.createClass({

	propTypes: {
		className: PropTypes.string,
		heightPerLine: PropTypes.number,
		onUpdate: PropTypes.func,
		translate: PropTypes.array.isRequired,
		text: PropTypes.string.isRequired,
		wrap: PropTypes.bool,
		maxCharacters: PropTypes.number
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		if ((nextState.lines.length !== this.state.lines.length) && nextProps.onUpdate && nextProps.wrap) {
			if (nextState.lines.length === 1) {
				this.props.onUpdate(0);
			} else {
				this.props.onUpdate((nextState.lines.length) * this.props.heightPerLine);
			}
			return false;
		}
		if (nextProps.text !== this.props.text) {
			return true;
		}
		var t1 = this.props.translate;
		var t2 = nextProps.translate;
		var newTrans = ( (t1[0] !== t2[0]) || (t1[1] !== t2[1]) );
		if (newTrans) {
			return true;
		}
		if (this.props.maxWidth !== nextProps.maxWidth) {
			return true;
		}

		return true;
	},

	getDefaultProps: function() {
		return {
			wrap: false,
			maxCharacters: 100
		};
	},

	getInitialState: function() {
		return {
			lines: [ this.props.text ]
		};
	},

	_wrapLines: function(props) {
		var lines = [];

		if (props.wrap) {
			maxCharacters = props.maxCharacters;
			var newWords = props.text.split(" ");
			var words = [];
			var spanLength = 0;

			newWords.forEach(function(word) {
				if (spanLength + word.length > maxCharacters) {
					lines.push(words.join(" "));
					words.length = 0;
					spanLength = 0;
				}
				spanLength += word.length;
				words.push(word);
			});

			if (words.length) {
				lines.push(words.join(" "));
			}
		} else {
			lines = [props.text];
		}

		return {
			lines: lines
		};
	},

	componentWillMount: function() {
		if (this.props.text && this.props.wrap) {
			var lineSettings = this._wrapLines(this.props, this.state);
			this.setState(lineSettings);
		}
	},

	componentDidMount: function() {
		if (this.props.onUpdate && this.props.wrap) {
			if (this.state.lines.length === 1) {
				this.props.onUpdate(0);
			} else {
				this.props.onUpdate((this.state.lines.length) * this.props.heightPerLine);
			}
		}
	},

	componentWillReceiveProps: function(nextProps) {
		if (this.props.wrap) {
			var lineSettings = this._wrapLines(nextProps);
			this.setState(lineSettings);
		}
	},

	render: function() {
		var textNodes;
		if (this.props.wrap) {
			textNodes = this.state.lines.map(function(text, i) {
				return (
					<text
						dy={(i * config.textLineHeight).toString() + "em"}
						y="0"
						x="0"
						key={i}
					>
						{text}
					</text>
				);
			});
		} else {
			var dy;
			if (this.props.align === "bottom") {
				dy = "-0.35em";
			} else if (this.props.align === "top"){
				dy = "0.35em";
			} else {
				dy = "0em";
			}

			textNodes = (
				<text
					y="0"
					x="0"
					dy={dy}
				>
					{this.props.text}
				</text>
			)
		}
		return (
			<g
				className={["svg-text", this.props.className].join(" ")}
				transform={"translate(" + this.props.translate + ")"}
			>
				{textNodes}
			</g>
		);
	}

});

module.exports = SvgText;
