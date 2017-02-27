import React from 'react';

const Canvas = React.createClass({

	render: function() {
		const self = this;
		return <canvas id="output-canvas"></canvas>;
	}
});

module.exports = Canvas;
