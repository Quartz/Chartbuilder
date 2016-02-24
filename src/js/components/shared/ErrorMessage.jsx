var React = require("react");
var PropTypes = React.PropTypes;

var _icons = {
	1: "✓",
	2: "⚠",
	3: "✗"
};

var ErrorMessage = React.createClass({

	propTypes: {
		type: PropTypes.number,
		text: PropTypes.string
	},

	render: function() {
		var className = "error- " + this.props.type;
		return (
			<div className={className}>
				<span>{_icons[this.props.type]}</span>
				<span> – </span>
				<span>{this.props.text}</span>
			</div>
		);
	}

});

module.exports = ErrorMessage;
