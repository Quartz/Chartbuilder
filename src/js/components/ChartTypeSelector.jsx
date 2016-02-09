// Select one of an array of chart types.
// Delete chartProps that are "private" to certain chart types (namespaced with `_`)
// and apply setting that carry over to the new type

var React = require("react");
var clone = require("lodash/clone");
var map = require("lodash/map");
var keys = require("lodash/keys");
var helper = require("../util/helper");

// Flux actions
var ChartServerActions = require("../actions/ChartServerActions");

// Chartbuilder UI components
var chartbuilderUI = require("chartbuilder-ui");
var ButtonGroup = chartbuilderUI.ButtonGroup;

var chartConfig = require("../charts/chart-config");

/**
 * Select a new chart type, copying shared settings over to the new type.
 * @instance
 * @memberof editors
 */
var ChartTypeSelctor = React.createClass({

	/* Generate values for each chart type that can be used to create buttons */
	getInitialState: function() {
		var chartTypeButtons = map(keys(chartConfig), function(chartTypeKey) {
			return {
				title: chartConfig[chartTypeKey].displayName,
				content: chartConfig[chartTypeKey].displayName,
				value: chartTypeKey
			};
		});
		return { chartConfig: chartTypeButtons };
	},

	/*
	 * Change the chart type
	 * @param {string} chartType - the new chart type
	*/
	_handleChartTypeChange: function(chartType) {
		/* Dont rerender if the chart type is the same */
		if (chartType === this.props.metadata.chartType) {
			return;
		}
		var metadata = clone(this.props.metadata);
		/* Set the new chart type in metadata */
		metadata.chartType = chartType;

		var prevProps = this.props.chartProps;
		var newDefaultProps = chartConfig[chartType].defaultProps.chartProps;
		var prevSettings = prevProps.chartSettings;
		var newDefaultSettings = newDefaultProps.chartSettings[0];
		var prevKeys = keys(prevSettings[0]);

		/* Apply any settings that carry over, otherwise ignore them */
		var newProps = helper.mergeOrApply(newDefaultProps, prevProps);

		/*
		 * For each data series, check whether a `chartSetting` has already been
		 * defined by another chart type. If so, apply it. If not, use the new
		 * type's default
		*/
		newProps.chartSettings = map(prevProps.data, function(d, i) {
			return helper.mergeOrApply(newDefaultSettings, prevSettings[i]);
		});

		/* Dispatch the new model to the flux stores */
		ChartServerActions.receiveModel({
			chartProps: newProps,
			metadata: metadata
		});
	},

	render: function() {
		return (
		<div className="editor-options">
			<h2>
				<span className="step-number">1</span>
				<span>Select chart type</span>
			</h2>
			<ButtonGroup
				buttons={this.state.chartConfig}
				onClick={this._handleChartTypeChange}
				className="chart-type-select"
				value={this.props.metadata.chartType}
			/>
		 </div>
		);
	}

});

module.exports = ChartTypeSelctor;
