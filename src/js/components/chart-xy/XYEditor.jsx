/*
 * ### Editor interface for XY chart type
 */

var React = require("react");
var PropTypes = React.PropTypes;
var PureRenderMixin = require("react-addons-pure-render-mixin");
var update = require("react-addons-update");
var cx = require("classnames");

var bind = require("lodash/bind");
var clone = require("lodash/clone");
var each = require("lodash/each");
var keys = require("lodash/keys");
var map = require("lodash/map");

var dateParsers = require("../../util/process-dates").dateParsers;

/* Shared Chartbuilder components */
var DataInput = require("../shared/DataInput.jsx");
var DateScaleSettings = require("../shared/DateScaleSettings.jsx");
var NumericScaleSettings = require("../shared/NumericScaleSettings.jsx");
var XY_yScaleSettings = require("../shared/XY_yScaleSettings.jsx");

/* Chartbuilder UI components */
var chartbuilderUI = require("chartbuilder-ui");
var Button = chartbuilderUI.Button;
var ButtonGroup = chartbuilderUI.ButtonGroup;
var ColorPicker = chartbuilderUI.ColorPicker;
var Dropdown = chartbuilderUI.Dropdown;
var LabelledTangle = chartbuilderUI.LabelledTangle;
var TextInput = chartbuilderUI.TextInput;
var Toggle = chartbuilderUI.Toggle;

var ChartEditorMixin = require("../mixins/ChartEditorMixin.js");

/* Available XY chart type options */
var typeOptions = [
	{ title: "Line", content: "Line", value: "line" },
	{ title: "Columns", content: "Columns", value: "column" },
	{ title: "Dots", content: "Dots", value: "scatterPlot" }
];

/* Available XY axis options */
var axisOptions = [
	{ title: "Left axis", content: "Left axis", value: "left" },
	{ title: "Right axis", content: "Right axis", value: "right" }
];

/**
 * ### Editor interface for a XY chart
 * @property {object} chartProps - Properties used to draw this chart
 * @property {number} numSteps - Allow the rendered component to interacted with and edited
 * @instance
 * @memberof editors
 */
var XYEditor = React.createClass({

	propTypes: {
		errors: PropTypes.object,
		chartProps: PropTypes.shape({
			input: PropTypes.object.isRequired,
			chartSettings: PropTypes.array,
			data: PropTypes.array,
			scale: PropTypes.object,
			_annotations: PropTypes.object
		}),
		numSteps: PropTypes.number
	},

	mixins: [ChartEditorMixin],

	getDefaultProps: function() {
		return {
			numSteps: 4
		};
	},

	render: function() {
		var chartProps = this.props.chartProps;
		var scaleSettings = [];

		/*
		 * If all but one series is set to secondary axis, don't allow secondary
		 * axis option
		*/
		var allowSecondaryAxis = (chartProps._numSecondaryAxis < (chartProps.data.length - 1));

		/* Create a settings component for each data series (column) */
		var chartSettings = map(chartProps.chartSettings, bind(function(chartSetting, i) {
			return (
				<XY_chartSettings
					chartSettings={chartProps.chartSettings}
					onUpdate={this._handlePropUpdate.bind(null, "chartSettings")}
					onUpdateReparse={this._handlePropAndReparse.bind(null, "chartSettings")}
					allowSecondaryAxis={allowSecondaryAxis}
					numColors={this.props.numColors}
					index={i}
					key={i}
				/>
			);
		}, this));

		var inputErrors = this.props.errors.messages.filter(function(e) {
			return e.location === "input";
		});

		var axisErrors = this.props.errors.messages.filter(function(e) {
			return e.location === "axis";
		});

		/* Y scale settings */
		scaleSettings.push(
			<XY_yScaleSettings
				scale={chartProps.scale}
				errors={axisErrors}
				className="scale-options"
				onUpdate={this._handlePropAndReparse.bind(null, "scale")}
				onReset={this._handlePropAndReparse.bind(null, "scale")}
				id="primaryScale"
				name="Primary"
				stepNumber="4"
				key="primaryScale"
			/>
		);

		/* render a second y scale component if altAxis is specified */
		if (chartProps._numSecondaryAxis > 0) {
			scaleSettings.push(
				<XY_yScaleSettings
					scale={chartProps.scale}
					onUpdate={this._handlePropAndReparse.bind(null, "scale")}
					errors={axisErrors}
					onReset={this._handlePropAndReparse.bind(null, "scale")}
					className="scale-options"
					id="secondaryScale"
					name="Secondary"
					stepNumber="4+"
					key="secondaryScale"
				/>
			);
		}

		/* Add date settings if we are parsing a date */
		if (chartProps.scale.hasDate) {
			scaleSettings.push(
				<DateScaleSettings
					key="xScale"
					nowOffset={this.props.session.nowOffset}
					now={this.props.session.now}
					scale={chartProps.scale}
					stepNumber="5"
					onUpdate={this._handlePropAndReparse.bind(null, "scale")}
				/>
			);
		} else if (chartProps.scale.isNumeric) {
			scaleSettings.push(
				<NumericScaleSettings
					scale={chartProps.scale}
					key="xScale"
					onUpdate={this._handlePropAndReparse.bind(null, "scale")}
					onReset={this._handlePropAndReparse.bind(null, "scale")}
					className="scale-options"
					id="numericSettings"
					name="Bottom"
					stepNumber="5"
				/>
			);
		}
		return (
			<div className="xy-editor">
				<div className="editor-options">
					<h2>
						<span className="step-number">2</span>
						<span>Input your data</span>
					</h2>
					<DataInput
						errors={inputErrors}
						chartProps={chartProps}
						className="data-input"
					/>
				</div>
				<div className="editor-options">
					<h2>
						<span className="step-number">3</span>
						<span>Set series options</span>
					</h2>
				<XY_resetLabels
					annotations={chartProps._annotations}
					onUpdate={this._handlePropUpdate.bind(null, "_annotations")}
				/>
					{chartSettings}
				</div>
				<div className="editor-options">
					{scaleSettings}
				</div>
			</div>
		);
	}

});

/**
 * When labels are dragged, this component appears and allows you to reset them
 * @property {object} annotations - Current `chartProps._annotations`
 * @property {function} onUpdate - Callback that passes a reset version of
 * `chartProps._annotation`
 * @instance
 * @memberof XYEditor
 */
var XY_resetLabels = React.createClass({

	_handleLabelReset: function() {
		/*
		 * To reset labels, delete all `pos.x` and `pos.y` from the label object.
		 * We will keep the width cached as it is used to calculate distance from a
		 * previous label
		*/
		var labels = clone(this.props.annotations.labels, true);
		each(keys(labels.values), function(labelKey, i) {
			if (labelKey !== "hasDragged") {
				var currLabel = labels.values[i];
				if (currLabel.dragged == true) {
					labels.values[i] = {
						dragged: false,
						name: currLabel.name,
						width: currLabel.width
					};
				}
			}
		});
		/* Tell the app that the labels are no longer dragged */
		labels.hasDragged = false;
		var annotations = update(this.props.annotations, { $merge: {
			labels: labels
		}});
		this.props.onUpdate(annotations);
	},

	render: function() {
		var className = cx({
			"label-reset": true,
			"active": this.props.annotations.labels.hasDragged // only show if we've dragged
		});

		return (
			<Button
				onClick={this._handleLabelReset}
				className={className}
				text={"Reset labels"}
			/>
		);
	}

});

/**
 * Series-specific settings for each column in data
 * @property {boolean} allowSecondaryAxis - Should a secondary axis be allowed
 * @property {object[]} chartSettings - Current settings for data series
 * @property {function} onUpdate - Callback that handles new series settings
 * @property {function} onUpdateReparse - Callback that handles new series settings,
 * but which need to be sent back to `parse-xy`
 * @property {number} numColors - Total number of possible colors
 * @instance
 * @memberof XYEditor
 */
var XY_chartSettings = React.createClass({

	propTypes: {
		chartSettings: PropTypes.arrayOf(PropTypes.object),
		allowSecondaryAxis: PropTypes.bool,
		numColors: PropTypes.number,
		onUpdate: PropTypes.func,
		onUpdateReparse: PropTypes.func,
	},

	_handleSettingsUpdate: function(ix, k, v) {
		/* Clone the array of objects so that we dont mutate existing state */
		var chartSettings = map(this.props.chartSettings, clone);
		/* We need the index (ix) of the settings object to know which to update */
		chartSettings[ix][k] = v;
		/* `axis` and `colorIndex` require reparsing the input and splitting it up */
		this.props.onUpdateReparse(chartSettings);
	},

	render: function() {
		var chartSetting = this.props.chartSettings[this.props.index];

		return (
			<div className="series-control">
				<TextInput
					type="text"
					value={chartSetting.label}
					onChange={this._handleSettingsUpdate.bind(null, this.props.index, "label")}
					className={"series-label-input series-label-input-" + chartSetting.colorIndex}
				/>
				<h3 className={"series-label series-label-" + chartSetting.colorIndex}>
				</h3>

				<div className="section axis-color">
					<div className="section colorsection">
						<ColorPicker
							onChange={this._handleSettingsUpdate.bind(null, this.props.index, "colorIndex")}
							numColors={this.props.numColors}
							index={this.props.index}
							colorIndex={chartSetting.colorIndex}
							labelText="Color"
						/>
					</div>
					<div className="section axissection">
						<Toggle
							className={"toggle-" + chartSetting.colorIndex}
							onToggle={this._handleSettingsUpdate.bind(null, this.props.index, "altAxis")}
							label="Right axis"
							toggled={chartSetting.altAxis}
						/>
					</div>
				</div>

				<div className="section typesection">
					<ButtonGroup
						className="button-group-wrapper"
						onClick={this._handleSettingsUpdate.bind(null, this.props.index, "type")}
						buttons={typeOptions}
						value={chartSetting.type}
					/>
				</div>

				<div className="clearfix"></div>
			</div>
		);
	}
});

module.exports = XYEditor;
