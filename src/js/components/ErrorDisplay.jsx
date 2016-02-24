var React = require("react");
var PropTypes = React.PropTypes;
var ErrorMessage = require("./shared/ErrorMessage.jsx");

var ErrorDisplay = React.createClass({

	propTypes: {
		type: PropTypes.number,
		text: PropTypes.string
	},

	_renderErrorMessages: function() {
		if (this.props.messages.length === 0) {
			return (
				<ErrorMessage
					type={1}
					text="No errors here!"
				/>
			);
		} else {
			return this.props.messages.map(function(msg, i) {
				return (
					<ErrorMessage
						key={i}
						type={msg.type}
						text={msg.text}
					/>
				);
			});
		}

	},

	render: function() {

		var errorMessages = this._renderErrorMessages();

		return (
			<div className="error-display">
				<h2>
					<span className="step-number">{this.props.stepNumber}</span>
					<span>Everything look good?</span>
				</h2>
				{errorMessages}
			</div>
		);
	}

});

module.exports = ErrorDisplay;
