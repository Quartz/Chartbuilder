
import React, {PropTypes} from 'react';
import update from 'react-addons-update';

import {TextArea, AlertGroup} from 'chartbuilder-ui';

// Flux actions
const VisualViewActions = require("../../actions/VisualViewActions");
const VisualServerActions = require("../../actions/VisualServerActions");
const validateChartModel = require("../../util/validate-chart-model");
const DataSeriesTypeSettings = require("../shared/DataSeriesTypeSettings.jsx");


/**
 * ### Text area component and error messaging for data input
 * @instance
 * @memberof editors
 */
class DataInput extends React.Component {
	constructor(props) {
    super(props);
		this.state = {
			alertType: "default",
			alertText: "Waiting for data...",
			boldText: "",
			dropping: false
		};
		this._handleReparseUpdate = this._handleReparseUpdate.bind(this);
		this._toggleDropState = this._toggleDropState.bind(this);
		this.onFileUpload = this.onFileUpload.bind(this);
	}

	_handleReparseUpdate (k, v) {

		let input;

		if (k === "input") {
			input = update(this.props.chartProps.input, { $merge: {
				raw: v,
				type: undefined
			}});
			VisualViewActions.updateInput(k, input);
		} else if (k == "type") {
			input = update(this.props.chartProps.input, { $set: {
				raw: v.raw,
				type: v.type
			}});
			VisualViewActions.updateAndReparse("input", input);
		} else {
			return;
		}
	}

	_toggleDropState (e) {
		this.setState({ dropping: !this.state.dropping });
	}

	onFileUpload (e) {
		var reader = new FileReader();
		reader.onload = function() {
			parsedModel = validateChartModel(this.result);
			if (parsedModel) {
				// Update flux store with incoming model
				VisualServerActions.receiveModel(parsedModel);
			}
		};
		this._toggleDropState();
		reader.readAsText(e.target.files[0]);
	}

	// Render only the dropover area
	_renderDropArea () {
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
	}

	_renderErrors () {
		if (this.props.errors.length === 0) return null;

		return (
			<div className="error-display">
				<AlertGroup alerts={this.props.errors} />
			</div>
		);
	}

	// Render the data input text area and indicator
	_renderDataInput () {

		var errors = this._renderErrors();

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
				/>
				{errors}
				<DataSeriesTypeSettings
					onUpdate={this._handleReparseUpdate.bind(null, "type")}
					chartProps={this.props.chartProps}
				/>
			</div>
		);
	}
	render () {
		if (this.state.dropping) {
			return this._renderDropArea();
		} else {
			return this._renderDataInput();
		}
	}
};

DataInput.propTypes = {
	errors: PropTypes.array.isRequired,
	chartProps: PropTypes.shape({
		chartSettings: PropTypes.array,
		data: PropTypes.array,
		scale: PropTypes.object,
		input: PropTypes.object
	}).isRequired,
	className: PropTypes.string
};

module.exports = DataInput;
