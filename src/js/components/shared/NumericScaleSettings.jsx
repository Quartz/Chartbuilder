var React = require("react");
var PropTypes = React.PropTypes;
var clone = require("lodash/clone");

var ScaleReset = require("./ScaleReset.jsx");

/* Chartbuilder UI components */
var chartbuilderUI = require("chartbuilder-ui");
var LabelledTangle = chartbuilderUI.LabelledTangle;
var TextInput = chartbuilderUI.TextInput;

/**
 * Y scale settings for XY charts. Used in both XY and chart grid, and most
 * likely for future charts as well
 * @instance
 * @memberof editors
 */
var NumericScaleSettings = React.createClass({

	propTypes: {
		id: PropTypes.string,
		className: PropTypes.string,
		name: PropTypes.string,
		onReset: PropTypes.func,
		onUpdate: PropTypes.func.isRequired,
		scale: PropTypes.object.isRequired,
		stepNumber: PropTypes.string,
		titleOverride: PropTypes.string
	},

	_handleScaleUpdate: function(k, v) {
		var scaleObj = clone(this.props.scale, true);
		if(k != "precision") {
			scaleObj[this.props.id].precision = 0;
		}

		scaleObj[this.props.id][k] = v;
		this.props.onUpdate(scaleObj);
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

	render: function() {
		var currScale = this.props.scale[this.props.id];

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

		var tickSetting = (
				<LabelledTangle
					label="Ticks"
					labelClass="editor-label"
					tangleClass="scale-option tangle-input"
					onChange={this._handleScaleUpdate.bind(null, "ticks")}
					onInput={this._handleScaleUpdate.bind(null, "ticks")}
					min={2}
					max={11}
					value={currScale.ticks}
				/>
			);

		var title_block = (
			<h2 className="scale-option-title">
				<span className="step-number">{this.props.stepNumber}</span>
				{this.props.titleOverride ? this.props.titleOverride : "Configure the " + this.props.name + " axis"}
			</h2>
		);

		if(this.props.stepNumber === "") {
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
			</div>
		);
	}
});

module.exports = NumericScaleSettings;
