var React = require('react');
var chartbuilderUI = require("chartbuilder-ui");
var Button = chartbuilderUI.Button;
var ButtonGroup = chartbuilderUI.ButtonGroup;
var TextArea = chartbuilderUI.TextArea;
var TextInput = chartbuilderUI.TextInput;

var ChartViewActions = require("../../../actions/ChartViewActions");

var AnnotationSettings = React.createClass({
	propTypes: {
		chartProps: React.PropTypes.object,
		stepNumber: React.PropTypes.number
	},

	getInitialState: function() {
		return {
			blurbs: this.props.chartProps._annotations.blurbs
		};
	},
	_handleAddAnnotation: function(e) {
		var values = this.state.blurbs.values;
		values.push({})
		this.setState({
			blurbs:{
				values: values
			}
		})
		this.props.chartProps._annotations.blurbs = this.state.blurbs
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

	_handleAnnotationChange: function(k,i,v) {

		switch(k) {
			case "annotationDelete":
				this._handleRemoveAnnotation(i)
				break
			default:
		}

		console.log("k",k)
		console.log("v",v)
		console.log("i",i)
		//update
	},

	render: function() {
		var that = this;
		var annotationControls = this.state.blurbs.values.map(function(d,i) {
			return (<AnnotationControl
				{...d}
				index={i}
				onUpdate={that._handleAnnotationChange}
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
		onUpdate: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			tout: "tout",
			copy: "copy"
		};
	},

	render: function() {
		return (
			<div>
				<h3>{"Annotation " + (this.props.index + 1)}</h3>
				<TextInput
					onChange={this.props.onUpdate.bind(null, "annotationTout",this.props.index)}
					placeholder="Tout"
					value={this.props.tout}
				/>
				<TextArea 
					value={this.props.copy}
					onChange={this.props.onUpdate.bind(null, "annotationCopy",this.props.index)}
				/>
				<Button
					text={"Delete annotation " + (this.props.index + 1)}
					onClick={this.props.onUpdate.bind(null,"annotationDelete",this.props.index)}
				/>
			</div>
		);
	}

});


module.exports = AnnotationSettings;