var React = require("react");
var PropTypes = React.PropTypes;
var update = require("react-addons-update");

// Flux actions
var ChartViewActions = require("../../actions/ChartViewActions");
var ChartServerActions = require("../../actions/ChartServerActions");

var validateChartModel = require("../../util/validate-chart-model");

var chartbuilderUI = require("chartbuilder-ui");
var TextArea = chartbuilderUI.TextArea;
var Alert = chartbuilderUI.Alert;
var DataSeriesTypeSettings = require("../shared/DataSeriesTypeSettings.jsx");

var inputAlerts = {
	"EMPTY": {
		alertText: "Enter some data above.",
		boldText: "Hello!",
		alertType: "default"
	},
	"UNEVEN_SERIES": {
		alertText: "At least one of your rows does not have the same number of columns as the rest.",
		boldText: "Error:",
		alertType: "error"
	},
	"column_zero": {
		alertText: "You have a column chart that doesn't have a zero axis. Double check that this is ok.",
		boldText: "Warning:",
		alertType: "warning"
	},
	"TOO_MANY_SERIES": {
		alertText: "You have more than 12 columns, which is more than Chartbuilder supports.",
		boldText: "Error:",
		alertType: "error"
	},
	"TOO_FEW_SERIES": {
		alertText: "You have fewer than 2 rows, which is fewer than Chartbuilder supports.",
		boldText: "Error:",
		alertType: "error"
	},
	"NAN_VALUES": {
		alertText: "At least one of your data points cannot be converted into a number",
		boldText: "Error:",
		alertType: "error"
	},
	"NOT_DATES": {
		alertText: "A least one of your dates cannot be understood by Chartbuilder",
		boldText: "Error:",
		alertType: "error"
	},
	"VALID": {
		alertText: "Your data are looking healthy",
		boldText: "",
		alertType: "success"
	}
};

/**
 * ### Text area component and error messaging for data input
 * @instance
 * @memberof editors
 */
var DataInput = React.createClass({

	propTypes: {
		chartProps: PropTypes.shape({
			input: PropTypes.shape({
				raw: PropTypes.string,
				status: PropTypes.string,
				valid: PropTypes.bool
			}).isRequired,
			chartSettings: PropTypes.array,
			data: PropTypes.array,
			scale: PropTypes.object
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
		console.log("here",k)
		if(k == "input") {
			var input = update(this.props.chartProps.input, { $merge: { raw: v }});
			ChartViewActions.updateInput(k, input);
		}
		else if (k == "type") {
			var input = update(this.props.chartProps.input, { $merge: { type: v.type }});
			ChartViewActions.updateAndReparse(k, input)
		}
		
	},

	componentDidMount: function() {
		this.setState(inputAlerts[this.props.chartProps.input.status]);
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState(inputAlerts[nextProps.chartProps.input.status]);
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

	// Render the data input text area and indicator
	_renderDataInput: function() {
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
				<Alert
					alertType={this.state.alertType}
					alertText={this.state.alertText}
					boldText={this.state.boldText}
				/>
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
