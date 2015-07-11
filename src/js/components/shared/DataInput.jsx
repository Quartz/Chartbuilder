var React = require("react");
var PropTypes = React.PropTypes;
var update = React.addons.update;

// Flux actions
var ChartViewActions = require("../../actions/ChartViewActions");

var chartbuilderUI = require("chartbuilder-ui");
var TextArea = chartbuilderUI.TextArea;
var Alert = chartbuilderUI.Alert;

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
		alertText: "At least one of your data points cannot be converted to a number",
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
			boldText: ""
		};
	},

	_handleReparseUpdate: function(k, v) {
		// reset the raw input value
		var input = update(this.props.chartProps.input, { $merge: { raw: v }});
		ChartViewActions.updateInput(k, input);
	},

	componentDidMount: function() {
		this.setState(inputAlerts[this.props.chartProps.input.status]);
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState(inputAlerts[nextProps.chartProps.input.status]);
	},

	onInputDragOver: function() {
		console.log("here!")
	},

	render: function() {
		var chartProps = this.props.chartProps;
		return (
			<div className={this.props.className}>
				<input type="file" id="input" onDragOver={this.onInputDragOver}/>
				<TextArea
					value={chartProps.input.raw}
					onChange={this._handleReparseUpdate.bind(null, "input")}
					className="data-input"
					defaultValue={chartProps.input.raw}
				/>
				<Alert
					alertType={this.state.alertType}
					alertText={this.state.alertText}
					boldText={this.state.boldText}
				/>
			</div>
		);
	}
});

module.exports = DataInput;
