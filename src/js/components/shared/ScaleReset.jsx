var React = require("react");
var PropTypes = React.PropTypes;
var cx = require("classnames");
var clone = require("lodash/clone");

var chartbuilderUI = require("chartbuilder-ui");
var Button = chartbuilderUI.Button;

/**
 * ### Button to delete a scale, resetting it to default settings
 * @property {object} scale - Current chart's scale object
 * @property {string} scaleId - Identifier for the scale we want to delete
 * @property {function} onUpdate - Callback to send reset scale back to parent
 * @instance
 * @memberof editors
 */
var ScaleReset = React.createClass({

	propTypes: {
		scale: PropTypes.object.isRequired,
		scaleId: PropTypes.string.isRequired,
		onUpdate: PropTypes.func.isRequired
	},

	getInitialState: function() {
		return {
			customScale: false
		};
	},

	// Delete scale width given `id` and update the parent
	_handleScaleReset: function() {
		var scale = clone(this.props.scale, true);
		delete scale[this.props.scaleId];
		this.setState({ customScale: false });
		this.props.onUpdate(scale);
	},

	// Only enable button if the scale has been customized
	componentWillReceiveProps: function(nextProps) {
		var scale = nextProps.scale[nextProps.scaleId];
		if (scale.custom) {
			this.setState({ customScale: true });
		}
	},

	render: function() {
		var className = cx({
			"label-reset": true,
			"active": this.state.customScale
		});

		return (
			<Button
				onClick={this._handleScaleReset}
				className={className}
				text={"Reset scale"}
			/>
		);
	}

});

module.exports = ScaleReset;
