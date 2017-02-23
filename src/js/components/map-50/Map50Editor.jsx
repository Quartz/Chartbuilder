/*
 * ### Editor interface for 50-state map
 */
import React, {PropTypes} from 'react';
import update from 'react-addons-update';
import {cloneDeep, bind, each, keys, map} from 'lodash';
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
    content: "Black",
    value: "#000"
  },
  {
    title: "",
    content: "Dark Grey",
    value: "#474747"
  },
  {
    title: "",
    content: "Light Grey",
    value: "#aaa"
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
const MapEditor = React.createClass({

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

	_getTypeOptions: function(colors) {
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
			numSteps: 3
		};
	},
	render: function() {

		const mapProps = this.props.chartProps;
    const stylings = mapProps.stylings;
    console.log(mapProps.chartSettings, 'hm');
		/* Create a settings component for each data series (column) */
		const mapSettings = map(mapProps.chartSettings, bind(function(chartSetting, i) {
			const typeOption = this._getTypeOptions(chartSetting.scale.colors);
			console.log(chartSetting, 'setting');
			return (
				<div key={i + '-div'}>
					<Map50_mapSettings
						chartSettings={mapProps.chartSettings}
						onUpdate={this._handlePropUpdate.bind(null, "chartSettings")}
						onUpdateReparse={this._handlePropAndReparse.bind(null, "chartSettings")}
						numColors={this.props.numColors}
						index={i}
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
					/>
				</div>
			);
		}, this));

		const mapStyles = (<MapChoro_mapStyles
							chartStyles={stylings}
							stepNumber={this.props.stepNumber}
							metadata={this.props.metadata}
							onUpdate={this._handlePropUpdate.bind(null, "stylings")}
							onUpdateReparse={this._handlePropAndReparse.bind(null, "stylings")}
						/>);

		const axisErrors = this.props.errors.messages.filter(function(e) {
			return e.location === "axis";
		});

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
					{mapStyles}
			</div>
		);
	}

});


/**

 */
const Map50_mapSettings = React.createClass({

	propTypes: {
		chartSettings: PropTypes.array,
		numColors: PropTypes.number
	},

	_handleSettingsUpdate: function(ix, k, v) {

		/* Clone the array of objects so that we dont mutate existing state */
		let chartSettings = map(this.props.chartSettings, cloneDeep);
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

const MapChoro_mapStyles = React.createClass({

	propTypes: {

	},
	_handleStylesUpdate: function(ix, v) {

		/* Clone the object so that we dont mutate existing state */
		const chartStyles = cloneDeep(this.props.chartStyles);
		/* We need the style (ix) to know which to update (v) */
		chartStyles[ix] = v;
		/* */
		this.props.onUpdateReparse(chartStyles);
	},
	render: function() {
		const stylings = this.props.chartStyles
		const steps = String(parseInt(this.props.stepNumber) + 1);
		let stateNames = false;

		const legendTicks = (<div className="toggle">
          <Toggle
            key={"legend_ticks_toggle_" + this.props.metadata.chartType}
            className="button-group-wrapper"
            label="Legend ticks"
            onToggle={this._handleStylesUpdate.bind(null, "showLegendTicks")}
            toggled={stylings.showLegendTicks}
            key="legend_ticks"
          /></div>);

		if (this.props.metadata.chartType === 'map50') {
      stateNames = (<div className="toggle">
        <Toggle
          label="State names"
          className="button-group-wrapper"
          toggled={stylings.showStateLabels}
          onToggle={this._handleStylesUpdate.bind(null, "showStateLabels")}
          key="show_state_names"
        /></div>);
    }

		return (<div className="editor-options">
	        <h2>
	          <span className="step-number">{steps}</span>
	          <span>Make additional stylings</span>
	        </h2>
	        <h3>
	          Color shape outlines
	        </h3>
	        <ButtonGroup
	          className="button-group-wrapper"
	          buttons={map_strokes}
	          onClick={this._handleStylesUpdate.bind(null, "stroke")}
	          value={stylings.stroke}
	          key="choose_strokes"
	        />
	        <div className="stylings-toggle-inputs"
	          key="stylings_inputs">
	          {stateNames}
	          {legendTicks}
	        </div>
      	</div>
		);
	}
});

module.exports = MapEditor;
