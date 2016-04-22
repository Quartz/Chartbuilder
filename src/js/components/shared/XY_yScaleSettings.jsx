var React = require("react");
var PropTypes = React.PropTypes;
var clone = require("lodash/clone");

var ScaleReset = require("./ScaleReset.jsx");

/* Chartbuilder UI components */
var chartbuilderUI = require("chartbuilder-ui");
var AlertGroup = chartbuilderUI.AlertGroup;
var LabelledTangle = chartbuilderUI.LabelledTangle;
var TextInput = chartbuilderUI.TextInput;

/**
 * Y scale settings for XY charts. Used in both XY and chart grid, and most
 * likely for future charts as well
 * @instance
 * @memberof editors
 */
var XY_yScaleSettings = React.createClass({

	propTypes: {
		className: PropTypes.string,
		id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
		name: PropTypes.string,
		onReset: PropTypes.func,
		onUpdate: PropTypes.func.isRequired,
		scale: PropTypes.object.isRequired,
		stepNumber: PropTypes.string,
		titleOverride: PropTypes.string,
		errors: PropTypes.array
	},

	_handleScaleUpdate: function(k, v) {
		var scale = clone(this.props.scale, true);

		if(k != "precision") {
			scale[this.props.id].precision = 0;
		}

		scale[this.props.id][k] = v;
		this.props.onUpdate(scale);
	},

	_handleDomainUpdate: function(k, v) {
		var scale = clone(this.props.scale, true);
		scale[this.props.id].custom = true;
		if (k == "min") {
			scale[this.props.id].domain[0] = v;
		} else if (k == "max") {
			scale[this.props.id].domain[1] = v;
		}
		this.props.onUpdate(scale);
	},

	_renderErrors: function() {

		if (!this.props.errors) {
			return null;
		} else if (this.props.errors.length === 0) {
			return null;
		} else {
			return (
				<div className="error-display">
					<AlertGroup alerts={this.props.errors} />
				</div>
			);
		}
	},

	render: function() {
		var currScale = this.props.scale[this.props.id];
		var errors = this._renderErrors();

		/*
		 * Figure out the amount by which to increment the tangle (drag) values: Eg
		 * <= 10 = 0.5
		 * < 100 = 1
		 * < 1000 = 10
		 * < 10000 = 100
		 * And so on
	  */
		var tangleStep;
		var range = Math.abs(currScale.domain[1] - currScale.domain[0]);
		if (range <= 10) {
			tangleStep = 0.5;
		} else {
			var numDigits = range.toString().length;
			tangleStep = Math.pow(10, (numDigits - 2));
		}

		var tickSetting;
		if (this.props.id === "primaryScale") {
			tickSetting = (
				<LabelledTangle
					label="Ticks"
					labelClass="editor-label"
					tangleClass="scale-option tangle-input"
					onChange={this._handleScaleUpdate.bind(null, "ticks")}
					onInput={this._handleScaleUpdate.bind(null, "ticks")}
					min={2}
					max={8}
					value={currScale.ticks}
				/>
			);
		}

		var title_block = (
			<h2 className="scale-option-title">
				<span className="step-number">{this.props.stepNumber}</span>
				{this.props.titleOverride ? this.props.titleOverride : "Configure the " + this.props.name + " axis"}
			</h2>
			);

		if (this.props.stepNumber === "") {
			title_block = (
				<h2 className="scale-option-title">
					{this.props.titleOverride ? this.props.titleOverride : "Configure the " + this.props.name + " axis"}
				</h2>
				);
		}

		return (
			<div className={this.props.className}>
				{title_block}
				<TextInput
					className="scale-option"
					onChange={this._handleScaleUpdate.bind(null, "prefix")}
					value={currScale.prefix}
					placeholder="Prefix"
				/>
				<TextInput
					id="suffix"
					className="scale-option"
					onChange={this._handleScaleUpdate.bind(null, "suffix")}
					value={currScale.suffix}
					placeholder="Suffix"
				/>
				<div className="scale-tangle-inputs">
					<LabelledTangle
						label="Minimum"
						labelClass="editor-label"
						tangleClass="scale-option tangle-input"
						onChange={this._handleDomainUpdate.bind(null, "min")}
						step={tangleStep}
						onInput={this._handleDomainUpdate.bind(null, "min")}
						value={currScale.domain[0]}
					/>
					<LabelledTangle
						label="Maximum"
						step={tangleStep}
						labelClass="editor-label"
						tangleClass="scale-option tangle-input"
						onChange={this._handleDomainUpdate.bind(null, "max")}
						onInput={this._handleDomainUpdate.bind(null, "max")}
						value={currScale.domain[1]}
					/>
					{tickSetting}
					<LabelledTangle
						label="Precision"
						labelClass="editor-label"
						tangleClass="scale-option tangle-input"
						onChange={this._handleScaleUpdate.bind(null, "precision")}
						onInput={this._handleScaleUpdate.bind(null, "precision")}
						min={0}
						max={5}
						value={currScale.precision}
					/>
					<ScaleReset
						scale={this.props.scale}
						scaleId={this.props.id}
						onUpdate={this.props.onReset}
						className="scale-reset"
					/>
				</div>
				{errors}
			</div>
		);
	}
});

module.exports = XY_yScaleSettings;
