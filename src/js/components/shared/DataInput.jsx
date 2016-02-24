var React = require("react");
var PropTypes = React.PropTypes;
var update = require("react-addons-update");

// Flux actions
var ChartViewActions = require("../../actions/ChartViewActions");
var ChartServerActions = require("../../actions/ChartServerActions");

var errorNames = require("../../util/error-names");
var validateChartModel = require("../../util/validate-chart-model");

var chartbuilderUI = require("chartbuilder-ui");
var TextArea = chartbuilderUI.TextArea;
var Alert = chartbuilderUI.Alert;
var DataSeriesTypeSettings = require("../shared/DataSeriesTypeSettings.jsx");
var ErrorMessage = require("../shared/ErrorMessage.jsx");

/**
 * ### Text area component and error messaging for data input
 * @instance
 * @memberof editors
 */
var DataInput = React.createClass({

	propTypes: {
		errors: PropTypes.array.isRequired,
		chartProps: PropTypes.shape({
			chartSettings: PropTypes.array,
			data: PropTypes.array,
			scale: PropTypes.object,
			input: PropTypes.object
		}).isRequired,
		className: PropTypes.string
	},

	getInitialState: function() {
		return {
			alertType: "default",
			alertText: "Waiting for data...",
			boldText: "",
			dropping: false
		};
	},

	_handleReparseUpdate: function(k, v) {
		// reset the raw input value
		var input;
		if(k == "input") {
			input = update(this.props.chartProps.input, { $merge: { raw: v }});
			ChartViewActions.updateInput(k, input);
		}
		else if (k == "type") {
			input = update(this.props.chartProps.input, { $merge: { type: v.type }});
			ChartViewActions.updateAndReparse("input", input)
		}
		
	},

	componentDidMount: function() {
		this.setState(this.props.errors);
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState(this.props.errors);
	},

	_toggleDropState: function(e) {
		this.setState({ dropping: !this.state.dropping });
	},

	onFileUpload: function(e) {
		var reader = new FileReader();
		reader.onload = function() {
			parsedModel = validateChartModel(this.result);
			if (parsedModel) {
				// Update flux store with incoming model
				ChartServerActions.receiveModel(parsedModel);
			}
		};
		this._toggleDropState();
		reader.readAsText(e.target.files[0]);
	},

	// Render only the dropover area
	_renderDropArea: function() {
		return (
			<div
				className={this.props.className + " dropping"}
				onDragLeave={this._toggleDropState}
			>
				<div className="file-drop">
					<p>Drop configuration file here</p>
				</div>
				<input type="file" id="input" onChange={this.onFileUpload}/>
			</div>
		);
	},

	_renderErrors: function() {

		if (this.props.errors.length === 0) {
			return null;
		} else {

			var errors = this.props.errors.map(function(error, i) {
				return (
					<ErrorMessage
						key={i}
						type={error.type}
						text={error.text}
					/>
				);
			});

			return (
				<div className="error-display">
					{errors}
				</div>
			);
		}
	},

	// Render the data input text area and indicator
	_renderDataInput: function() {

		var errors = this._renderErrors();

		return (
			<div className={this.props.className}
				onDragOver={this._toggleDropState}
			>
				<label>if you have a json file to load, drop that here</label>
				<TextArea
					value={this.props.chartProps.input.raw}
					onChange={this._handleReparseUpdate.bind(null, "input")}
					className="data-input"
					defaultValue={this.props.chartProps.input.raw}
				/>
				{errors}
				<DataSeriesTypeSettings
					onUpdate={this._handleReparseUpdate.bind(null, "type")}
					chartProps={this.props.chartProps}
				/>
			</div>
		);
	},

	render: function() {
		if (this.state.dropping) {
			return this._renderDropArea();
		} else {
			return this._renderDataInput();
		}
	}

});

module.exports = DataInput;
