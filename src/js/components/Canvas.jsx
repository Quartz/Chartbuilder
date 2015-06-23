var React = require("react");

var Canvas = React.createClass({

	render: function() {
		var self = this;
		return <canvas id="output-canvas"></canvas>;
	}
});

module.exports = Canvas;
