/*
 * ### Editor interface for 50-state map
 */
import React, {PropTypes} from 'react';
import update from 'react-addons-update';
import {clone, bind, each, keys, map} from 'lodash';
import PureRenderMixin from 'react-addons-pure-render-mixin';

const NumericScaleSettings = require("../shared/NumericScaleSettings.jsx");
const Map_ScaleSettings = require("../shared/Map_ScaleSettings.jsx");
const cx = require("classnames");

/* Shared Chartbuilder components */
const DataInput = require("../shared/DataInput.jsx");

/* Chartbuilder UI components */
import {ButtonGroup, ColorPicker, Dropdown, LabelledTangle, TextInput, Toggle} from 'chartbuilder-ui';

const colorScales = require('./../../util/colorscales');
const MapEditorMixin = require("./../mixins/MapEditorMixin.js");


const map_strokes = [
  {
    title: "",
    content: "Darker Grey",
    value: "#333"
  },
  {
    title: "",
    content: "Dark Grey",
    value: "#666"
  },
  {
    title: "",
    content: "Grey",
    value: "#aaa"
  },
  {
    title: "",
    content: "Lightest Grey",
    value: "#eee"
  },
  {
    title: "",
    content: "White",
    value: "#fff"
  }
];

/**
 * ### Editor interface for a XY chart
 * @property {object} chartProps - Properties used to draw this chart
 * @property {number} numSteps - Allow the rendered component to interacted with and edited
 * @instance
 * @memberof editors
 */
let MapEditor = React.createClass({

	propTypes: {
		errors: PropTypes.object,
		chartProps: PropTypes.shape({
			input: PropTypes.object.isRequired,
			chartSettings: PropTypes.array,
			entries: PropTypes.array,
			data: PropTypes.array,
			scale: PropTypes.object,
			_annotations: PropTypes.object
		}),
		numSteps: PropTypes.number
	},

	mixins: [MapEditorMixin],

	getTypeOptions: function(colors) {
		if (colors < 2) {
			return [
			  { title: "Even Breaks", content: "Even Breaks", value: "quantize" },
			  { title: "Cluster", content: "Cluster", value: "cluster" }
			];
		} else {
			return [
				  { title: "Even Breaks", content: "Even Breaks", value: "quantize" },
				  { title: "Cluster", content: "Cluster", value: "cluster" },
				  { title: "Threshold", content: "Threshold", value: "threshold" }
				];
		}
	},
	getDefaultProps: function() {
		return {
			numSteps: 4
		};
	},

	render: function() {
		const mapProps = this.props.chartProps;
    const stylings = mapProps.stylings;
		/* Create a settings component for each data series (column) */
		const mapSettings = [];

		console.log(stylings,'stylings');

		mapSettings.push( map(mapProps.chartSettings, bind(function(chartSetting, i) {

			const typeOption = this.getTypeOptions(chartSetting.scale.colors);

			return (
				<div>
					<Map50_mapSettings
						chartSettings={mapProps.chartSettings}
						onUpdate={this._handlePropUpdate.bind(null, "chartSettings")}
						onUpdateReparse={this._handlePropAndReparse.bind(null, "chartSettings")}
						numColors={this.props.numColors}
						index={i}
						key={i}
					/>

					<Map_ScaleSettings
						scale={mapProps.scale}
						stylings={mapProps.stylings}
						className="scale-options"
						onUpdate={this._handlePropAndReparse.bind(null, "scale")}
						onReset={this._handlePropAndReparse.bind(null, "scale")}
						id={chartSetting.label}
						name={chartSetting.label}
						typeOptions={typeOption}
						stepNumber="0"
						index={i}
						key={i + '-scale'}
					/>

				</div>
			);
		}, this)));


		const legendTicks = (<div className="toggle">
          <Toggle
            key={"legend_ticks_toggle_" + this.props.metadata.chartType}
            className="button-group-wrapper"
            label="Legend ticks"
            onToggle={this._handlePropAndReparse.bind(null, "showLegendTicks")}
            toggled={stylings.showLegendTicks}
          /></div>);


		let stateNames = false;

		if (this.props.metadata.chartType === 'map50') {

      stateNames = (<div className="toggle">
        <Toggle
          label="State names"
          className="button-group-wrapper"
          onToggle={this._handlePropAndReparse.bind(null, "showStateLabels")}
          toggled={stylings.showStateLabels}
          key="show_state_names"
        /></div>);

    }

		const axisErrors = this.props.errors.messages.filter(function(e) {
			return e.location === "axis";
		});

		/* Y scale settings */
		/*mapProps.chartSettings.forEach(function(chartSetting,i) {
			mapSettings.push(
				<div>
				<Map50_mapSettings
					chartSettings={chartSetting}
					onUpdate={that._handlePropUpdate.bind(null, "chartSettings")}
					onUpdateReparse={that._handlePropAndReparse.bind(null, "chartSettings")}
					numColors={that.props.numColors}
					index={i}
					key={i}
				/>

				<Map_ScaleSettings
					scale={chartSetting.scale}
					errors={axisErrors}
					className="scale-options"
					onUpdate={that._handlePropAndReparse.bind(null, "scale")}
					onReset={that._handlePropAndReparse.bind(null, "scale")}
					id="primaryScale"
					name="Primary"
					stepNumber="0"
					key={i}
				/>
				</div>
			);
		});*/

		/*if (chartProps.scale.isNumeric) {
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
		}*/

		const inputErrors = this.props.errors.messages.filter(function(e) {
			return e.location === "input";
		});

		return (
			<div className="xy-editor">
				<div className="editor-options">
					<h2>
						<span className="step-number">2</span>
						<span>Input your data</span>
					</h2>
					<DataInput
						errors={inputErrors}
						chartProps={mapProps}
						className="data-input"
					/>
				</div>
				<div className="editor-options">
					<h2>
						<span className="step-number">{this.props.stepNumber}</span>
						<span>Set series options</span>
					</h2>
					{mapSettings}
				</div>
				<div className="editor-options">

				</div>
				<div className="editor-options">
        <h2>
          <span className="step-number">{this.props.stepNumber + 1}</span>
          <span>Make additional stylings</span>
        </h2>
        <h3>
          Color shape outlines
        </h3>
        <ButtonGroup
          className="button-group-wrapper"
          buttons={map_strokes}
          onClick={this._handlePropAndReparse.bind(null, "stroke")}
          value={stylings.stroke}
          key="choose_strokes"
        />
        <div className="stylings-toggle-inputs"
          key="stylings_inputs">
          {stateNames}
          {legendTicks}
        </div>
      </div>
			</div>
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
const Map50_mapSettings = React.createClass({

	propTypes: {
		chartSettings: PropTypes.array,
		numColors: PropTypes.number
	},

	_handleSettingsUpdate: function(ix, k, v) {

		/* Clone the array of objects so that we dont mutate existing state */
		let chartSettings = map(this.props.chartSettings, clone);
		/* We need the index (ix) of the settings object to know which to update */
		chartSettings[ix][k] = v;
		/* `axis` and `colorIndex` require reparsing the input and splitting it up */
		this.props.onUpdateReparse(chartSettings);
	},

	render: function() {
		const chartSetting = this.props.chartSettings[this.props.index];
		const numColors = colorScales.scalesNum();

		return (
			<div className="series-control">
				<TextInput
					type="text"
					label={chartSetting.label}
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
							numColors={numColors}
							index={this.props.index}
							colorIndex={chartSetting.colorIndex}
							labelText="Color"
						/>
					</div>
				</div>

				<div className="clearfix"></div>
			</div>
		);
	}
});

module.exports = MapEditor;
