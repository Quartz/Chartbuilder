
import React, {PropTypes} from 'react';
import update from 'react-addons-update';

import {TextArea, AlertGroup} from 'chartbuilder-ui';

// Flux actions
const ChartViewActions = require("../../actions/ChartViewActions");
const ChartServerActions = require("../../actions/ChartServerActions");
const validateChartModel = require("../../util/validate-chart-model");
const DataSeriesTypeSettings = require("../shared/DataSeriesTypeSettings.jsx");


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

		let input;

		if (k === "input") {
			input = update(this.props.chartProps.input, { $merge: {
				raw: v,
				type: undefined
			}});
			ChartViewActions.updateInput(k, input);
		}
		else if (k == "type") {
			input = update(this.props.chartProps.input, { $set: {
				raw: v.raw,
				type: v.type
			}});
			ChartViewActions.updateAndReparse("input", input);
		}
		else {
			return;
		}
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
		if (this.props.errors.length === 0) return null;

		return (
			<div className="error-display">
				<AlertGroup alerts={this.props.errors} />
			</div>
		);
	},

	// Render the data input text area and indicator
	_renderDataInput: function() {

		const errors = this._renderErrors();
		const isValid = this.props.errors.length === 0;

		return (
			<div className={this.props.className}
				onDragOver={this._toggleDropState}
			>
				<TextArea
					value={this.props.chartProps.input.raw}
					onChange={this._handleReparseUpdate.bind(null, "input")}
					className="data-input"
					defaultValue={this.props.chartProps.input.raw}
					placeholder="If you have a json file to load, drop that here"
					isRequired={true}
					isValid={isValid}
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
