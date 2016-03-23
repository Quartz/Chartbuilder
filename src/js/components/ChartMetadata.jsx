// Component that handles global metadata, ie data that is universal regardless
// of chart type. Eg title, source, credit, size.

var React = require("react");
var PropTypes = React.PropTypes;
var PureRenderMixin = require("react-addons-pure-render-mixin");
var clone = require("lodash/clone");

// Flux stores
var ChartMetadataStore = require("../stores/ChartMetadataStore");
var ChartViewActions = require("../actions/ChartViewActions");

// Chartbuilder UI components
var chartbuilderUI = require("chartbuilder-ui");
var ButtonGroup = chartbuilderUI.ButtonGroup;
var TextInput = chartbuilderUI.TextInput;

// Give chart sizes friendly names
var chart_sizes = [
	{
		title: "Auto",
		content: "Auto",
		value: "auto"
	},
	{
		title: "Medium",
		content: "Medium",
		value: "medium"
	},
	{
		title: "Long spot chart",
		content: "Long spot chart",
		value: "spotLong"
	},
	{
		title: "Small spot chart",
		content: "Small spot chart",
		value: "spotSmall"
	}
];

var text_input_values = [
	{ name: "title", content: "Title", isRequired: true },
	{ name: "credit", content: "Credit" },
	{ name: "source", content: "Source" }
];

/**
 * Edit a chart's metadata
 * @property {object} metadata - Current metadata
 * @property {string} stepNumber - Step in the editing process
 * @property {[components]} additionalComponents - Additional React components.
 * Anything passed here will be given a callback that updates the `metadata`
 * field. This is useful for adding custom input fields not provided.
 * @instance
 * @memberof editors
 */
var ChartMetadata = React.createClass({

	propTypes: {
		metadata: PropTypes.shape({
			chartType: PropTypes.string.isRequired,
			size: PropTypes.string.isRequired,
			source: PropTypes.string,
			credit: PropTypes.string,
			title: PropTypes.string
		}),
		stepNumber: PropTypes.string,
		additionalComponents: PropTypes.array
	},

	// Get text input types from state
	getInitialState: function() {
		return {
		};
	},

	// Update metadata store with new settings
	_handleMetadataUpdate: function(k, v) {
		ChartViewActions.updateMetadata(k, v);
	},

	render: function() {
		var metadata = this.props.metadata;

		if (this.props.additionalComponents.length > 0) {
			this.props.additionalComponents.forEach(function(c, i) {
				c.props.onUpdate = this._handleMetadataUpdate;
				c.props.value = metadata[c.key] || "";
			}, this);
		}
		// Create text input field for each metadata textInput
		var textInputs = text_input_values.map(function(textInput) {
			return <ChartMetadataText
				key={textInput.name}
				name={textInput.name}
				value={metadata[textInput.name]}
				placeholder={textInput.content}
				onChange={this._handleMetadataUpdate}
				isRequired={textInput.isRequired}
			/>
		}, this);

		return (
			<div className="editor-options">
				<h2>
					<span className="step-number">{this.props.stepNumber}</span>
					<span>Set title, source, credit and size</span>
				</h2>
				{textInputs}
				{this.props.additionalComponents}
				<ButtonGroup
					buttons={chart_sizes}
					onClick={this._handleMetadataUpdate.bind(null, "size")}
					value={metadata.size}
				/>
			</div>
		);
	}
});

// Small wrapper arount TextInput component specific to metadata
var ChartMetadataText = React.createClass({

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<div>
				<TextInput
					value={this.props.value}
					className="meta-option"
					onChange={this.props.onChange.bind(null, this.props.name)}
					placeholder={this.props.placeholder}
					isRequired={this.props.isRequired}
				/>
			</div>
		);
	}
});

module.exports = ChartMetadata;
