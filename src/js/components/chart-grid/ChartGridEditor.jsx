/*
 * Editor interface for ChartGrid chart type
 */

var React = require("react");
var PropTypes = React.PropTypes;
var update = require("react-addons-update");
var cx = require("classnames");

var bind = require("lodash/bind");
var clone = require("lodash/clone");
var each = require("lodash/each");
var map = require("lodash/map");
var range = require("lodash/range");

/* Shared Chartbuilder components */
var DataInput = require("../shared/DataInput.jsx");
var DateScaleSettings = require("../shared/DateScaleSettings.jsx");
var NumericScaleSettings = require("../shared/NumericScaleSettings.jsx");
var XY_yScaleSettings = require("../shared/XY_yScaleSettings.jsx");
var ChartGrid_xScaleSettings = require("./ChartGrid_xScaleSettings.jsx");

/* Chartbuilder UI components */
var chartbuilderUI = require("chartbuilder-ui");
var Button = chartbuilderUI.Button;
var ButtonGroup = chartbuilderUI.ButtonGroup;
var ColorPicker = chartbuilderUI.ColorPicker;
var TextInput = chartbuilderUI.TextInput;
var help = require("../../util/helper.js");

var ChartEditorMixin = require("../mixins/ChartEditorMixin.js");

/**
 * ### Editor interface for a Chart grid
 * @property {object} chartProps - Properties used to draw this chart
 * @property {number} numSteps - Allow the rendered component to interacted with and edited
 * @instance
 * @memberof editors
 */
var ChartGridEditor = React.createClass({

	propTypes: {
		chartProps: PropTypes.shape({
			input: PropTypes.object.isRequired,
			chartSettings: PropTypes.array,
			data: PropTypes.array,
			scale: PropTypes.shape({
				primaryScale: PropTypes.object.isRequired
			}).isRequired,
			_grid: PropTypes.object.isRequired
		}),
		numSteps: PropTypes.number
	},

	mixins: [ ChartEditorMixin ],

	getDefaultProps: function() {
		return {
			numSteps: 3
		};
	},

	getInitialState: function() {
		return {
			/* Toggle whether chart settings should apply to all data series */
			universalSettings: false
		};
	},

	render: function() {
		var chartProps = this.props.chartProps;
		var chartSettings;

		/* Create a settings component for each data series (column) */
		chartSettings = map(chartProps.chartSettings, bind(function(seriesSetting, i) {
			return (
				<ChartGrid_chartSettings
					chartSettings={chartProps.chartSettings}
					universalSettings={this.state.universalSettings}
					onUpdate={this._handlePropUpdate.bind(null, "chartSettings")}
					onUpdateReparse={this._handlePropAndReparse.bind(null, "chartSettings")}
					numColors={this.props.numColors}
					index={i}
					name={chartProps.data[i].name}
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

		/*
		 * Settings to control the numerical scale. It will be different for bar
		 * than for XY
		* */
		var scaleSettings = [];
		if (chartProps._grid.type == "bar") {
			scaleSettings.push(
				<ChartGrid_xScaleSettings
					scale={chartProps.scale}
					errors={axisErrors}
					onUpdate={this._handlePropAndReparse.bind(null, "scale")}
					className="scale-options"
					key="xScale"
					stepNumber="4"
				/>
			);
		} else {
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
			)
		} else if (chartProps.scale.isNumeric) {
			scaleSettings.push(
				<NumericScaleSettings
					scale={chartProps.scale}
					key="numericSettings"
					onUpdate={this._handlePropAndReparse.bind(null, "scale")}
					onReset={this._handlePropAndReparse.bind(null, "scale")}
					className="scale-options"
					id="numericSettings"
					name="Bottom"
					stepNumber="5"
				/>
			)
		}

		return (
			<div className="chartgrid-editor">
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
					<ChartGrid_universalToggle
						text="Single color"
						chartSettings={chartProps.chartSettings}
						universalSettings={this.state.universalSettings}
						onUpdate={this._handlePropUpdate.bind(null, "chartSettings")}
						onClick={this._handleStateUpdate}
					/>
					{chartSettings}
					<ChartGrid_gridSettings
						grid={chartProps._grid}
						onUpdate={this._handlePropAndReparse.bind(null, "_grid")}
						numSeries={chartProps.data.length}
					/>
				</div>
				<div className="editor-options">
					{scaleSettings}
				</div>
			</div>
		);
	}
});

/**
 * Button to toggle universal setting that applies series settings to all series
 * @property {string} text - Text of universal toggle button
 * @property {object[]} chartSettings - Current settings for data series
 * @property {boolean} universalSettings - Whether `universalSettings` is currently enabled
 * @property {function} onClick - Callback on toggle button click
 * @instance
 * @memberof ChartGridEditor
 */
var ChartGrid_universalToggle = React.createClass({

	propTypes: {
		text: PropTypes.string,
		chartSettings: PropTypes.array.isRequired,
		universalSettings: PropTypes.bool.isRequired,
		onClick: PropTypes.func.isRequired
	},

	_handleUniversal: function(k, v) {
		var chartSettings = map(this.props.chartSettings, clone);
		if (v === true) {
			each(chartSettings, function(setting, i) {
				setting.colorIndex = chartSettings[0].colorIndex;
			})
		} else {
			// TODO: set settings back to distinct defaults when toggling back
		}
		this.props.onClick(k, v);
		this.props.onUpdate(chartSettings);
	},

	render: function() {
		return (
			<Button
				text={this.props.text}
				className={this.props.universalSettings ? 'universal-toggle' : 'universal-toggle disabled'}
				active={this.props.universalSettings}
				onClick={this._handleUniversal.bind(null, "universalSettings", !this.props.universalSettings)}
			/>
		);
	}
});

/**
 * Series-specific settings drawn for each column in data
 * @property {string} name - Series (column) name
 * @property {object[]} chartSettings - Current settings for data series
 * @property {boolean} universalSettings - Whether `universalSettings` is currently enabled
 * @property {number} numColors - Total number of possible colors
 * @instance
 * @memberof ChartGridEditor
 */
var ChartGrid_chartSettings = React.createClass({

	propTypes: {
		name: PropTypes.string.isRequired,
		chartSettings: PropTypes.array.isRequired,
		universalSettings: PropTypes.bool.isRequired,
		numColors: PropTypes.number.isRequired
	},

	_getNewSettings: function(ix, k, v) {
		/* Clone the array of objects so that we dont mutate existing state */
		var chartSettings = map(this.props.chartSettings, clone);
		/* Apply a setting to every series if universal is checked */
		if (this.props.universalSettings) {
			each(chartSettings, function(setting, i) {
				chartSettings[i][k] = v;
			})
		} else {
			/* Otherwise we need the index (ix) of the settings object
			* to know which to update */
			chartSettings[ix][k] = v;
		}
		return chartSettings;
	},

	_handleColorUpdate: function(ix, k, v) {
		this.props.onUpdate(this._getNewSettings(ix, k, v));
	},

	_handleSettingsReparse: function(ix, k, v) {
		this.props.onUpdateReparse(this._getNewSettings(ix, k, v));
	},

	render: function() {
		var seriesSetting = this.props.chartSettings[this.props.index];
		return (
			<div className="series-control">
				<div className="section colorsection">
					<ColorPicker
						onChange={this._handleColorUpdate.bind(null, this.props.index, "colorIndex")}
						numColors={this.props.numColors}
						colorIndex={seriesSetting.colorIndex}
						labelText="Color"
					/>
				</div>
				<TextInput
					type="text"
					value={seriesSetting.label}
					onChange={this._handleSettingsReparse.bind(null, this.props.index, "label")}
					className={"series-label-input series-label-input-" + seriesSetting.colorIndex}
				/>
				<div className="clearfix"></div>
			</div>
		);
	}
});

/**
 * Settings that control the grid layout and type
 * @property {object} grid - Set grid type and number of rows and columns
 * @property {number} numSeries - Number of columns, used to decide how many
 * rows/columns are possible
 * @instance
 * @memberof ChartGridEditor
 */
var ChartGrid_gridSettings = React.createClass({

	propTypes: {
		grid: PropTypes.shape({
			cols: PropTypes.number.isRequired,
			rows: PropTypes.number.isRequired,
			type: PropTypes.string.isRequired
		}).isRequired,
		numSeries: PropTypes.number.isRequired
	},

	getInitialState: function() {
		return {
			rowColOptions: [
				{ value: 1 },
				{ value: 2 },
				{ value: 3 },
				{ value: 4 }
			]
		};
	},

	_config: {
		gridTypes: [
			{ title: "Bars", content: "Bars", value: "bar" },
			{ title: "Lines", content: "Lines", value: "line" },
			{ title: "Dots", content: "Dots", value: "scatterPlot" },
			{ title: "Columns", content: "Columns", value: "column" }
		],
	},

	/* Create a button for every possible number of rows/cols */
	_buildSeriesValues: function(numSeries) {
		return map(range(0, numSeries), function(series, i) {
			return { value: i + 1 };
		});
	},

	componentWillMount: function() {
		this.setState({
			rowColOptions: this._buildSeriesValues(this.props.numSeries)
		});
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({
			rowColOptions: this._buildSeriesValues(nextProps.numSeries)
		});
	},

	_handleGridUpdate: function(k, v) {
		var gridSetting = {};
		gridSetting[k] = v;
		var grid = update(this.props.grid, { $merge: gridSetting });
		this.props.onUpdate(grid);
	},

	render: function() {
		return (
			<div className="grid-options">
				<div className="editor-option">
					<label className="editor-label">Chart type</label>
					<ButtonGroup
						onClick={this._handleGridUpdate.bind(null, "type")}
						buttons={this._config.gridTypes}
						value={this.props.grid.type}
					/>
				</div>
				<div className="editor-option">
					<label className="editor-label">Rows</label>
					<ButtonGroup
						onClick={this._handleGridUpdate.bind(null, "rows")}
						buttons={this.state.rowColOptions}
						value={this.props.grid.rows}
					/>
				</div>
				<div className="editor-option">
					<label className="editor-label">Columns</label>
					<ButtonGroup
						id="cols"
						onClick={this._handleGridUpdate.bind(null, "cols")}
						buttons={this.state.rowColOptions}
						value={this.props.grid.cols}
					/>
				</div>
			</div>
		);
	}

});

module.exports = ChartGridEditor;
