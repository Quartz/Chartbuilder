var React = require('react');
var chartbuilderUI = require("chartbuilder-ui");
var Button = chartbuilderUI.Button;
var ButtonGroup = chartbuilderUI.ButtonGroup;
var TextArea = chartbuilderUI.TextArea;
var TextInput = chartbuilderUI.TextInput;
var AlertGroup = chartbuilderUI.AlertGroup;
var Toggle = chartbuilderUI.Toggle;

var clone = require("lodash/clone");

var ChartViewActions = require("../../../actions/ChartViewActions");
var annotation_config = require("./annotation-config.js");

var AnnotationSettings = React.createClass({
	propTypes: {
		chartProps: React.PropTypes.object,
		stepNumber: React.PropTypes.string
	},

	getInitialState: function() {
		return {
			blurbs: this.props.chartProps._annotations.blurbs
		};
	},
	_handleAddAnnotation: function(e) {
		this.state.blurbs.values.push(clone(annotation_config.defaultBlurb))

		this.props.chartProps._annotations.blurbs = this.state.blurbs;

		ChartViewActions.updateChartProp("_annotations", this.props.chartProps._annotations)
	},

	_handleRemoveAnnotation: function(i) {
		var values = this.state.blurbs.values;
		values.splice(i,1)
		this.setState({
			blurbs:{
				values: values
			}
		})

		this.props.chartProps._annotations.blurbs = this.state.blurbs
		ChartViewActions.updateChartProp("_annotations", this.props.chartProps._annotations)
	},

	_handleAnnotationTextChange: function(i,k,v) {
		this.state.blurbs.values[i][k] = v;

		this.props.chartProps._annotations.blurbs = this.state.blurbs;
		ChartViewActions.updateChartProp("_annotations", this.props.chartProps._annotations);
	},

	_handleAnnotationChange: function(k,i,v) {

		switch(k) {
			case "annotationDelete":
				this._handleRemoveAnnotation(i)
				break

			case "annotationTout":
				this._handleAnnotationTextChange(i, "tout", v)
				break

			case "annotationCopy":
				this._handleAnnotationTextChange(i, "copy", v)
				break

			case "annotationHasArrow":
				this.state.blurbs.values[i].hasArrow = v ? true : false;
				this.props.chartProps._annotations.blurbs = this.state.blurbs;
				ChartViewActions.updateChartProp("_annotations", this.props.chartProps._annotations)
				break

			case "annotationArrowClockwise":
				this.state.blurbs.values[i].arrowClockwise = v ? true : false;
				this.props.chartProps._annotations.blurbs = this.state.blurbs;
				ChartViewActions.updateChartProp("_annotations", this.props.chartProps._annotations)
				break

			default:
		}

	},

	render: function() {
		var that = this;
		var annotationControls = this.state.blurbs.values.map(function(d,i) {
			return (<AnnotationControl
				{...d}
				index={i}
				onUpdate={that._handleAnnotationChange}
				key={"annotation-control-" + i}
				/>	
				)
		})
		return (
			<div className="section annotation-options">
				<h2 className="annotation-option-title">
					<span className="step-number">{this.props.stepNumber}</span>
					Annotate
				</h2>
				{annotationControls}
				<div>
					<Button 
						text="Add annotation"
						onClick={this._handleAddAnnotation}
					/>
				</div>
			</div>
		);
	}

});


var AnnotationControl = React.createClass({

	propTypes: {
		index: React.PropTypes.number,
		onUpdate: React.PropTypes.func,
		tout: React.PropTypes.string,
		copy: React.PropTypes.string,
		hasArrow: React.PropTypes.bool,
		arrowClockwise: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			tout: "tout",
			copy: "copy",
			hasArrow: true,
			arrowClockwise: true
		};
	},

	render: function() {
		var char_remain = annotation_config.maxCopyLength - this.props.copy.length
		var errors = [
			{
				text: "Characters remaining: " + char_remain,
				type: char_remain >= 0 ? (char_remain < 20 ? "warning" : "default") : "error"
			}
		];

		var clockwiseToggle = this.props.hasArrow ? 
				(<Toggle
					label="Clockwise arrow"
					toggled={this.props.arrowClockwise}
					onToggle={this.props.onUpdate.bind(null, "annotationArrowClockwise", this.props.index)}
				/>)
				: null;
				
		return (
			<div>
				<h3>{"Annotation " + (this.props.index + 1)}</h3>
				<Toggle
					label="Draw arrow"
					toggled={this.props.hasArrow}
					onToggle={this.props.onUpdate.bind(null, "annotationHasArrow", this.props.index)}
				/>
				{clockwiseToggle}
				<TextInput
					onChange={this.props.onUpdate.bind(null, "annotationTout",this.props.index)}
					placeholder="Tout"
					value={this.props.tout}
				/>
				<TextArea
					value={this.props.copy}
					onChange={this.props.onUpdate.bind(null, "annotationCopy",this.props.index)}
				/>
				<div className="error-display">
					<AlertGroup alerts={errors} />
				</div>
				<Button
					text={"Delete annotation " + (this.props.index + 1)}
					onClick={this.props.onUpdate.bind(null,"annotationDelete",this.props.index)}
				/>
			</div>
		);
	}

});


module.exports = AnnotationSettings;