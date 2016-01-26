var React = require("react");
var ReactDOM = require("react-dom")

var chartGenerators = require("../chart-generators");
var RendererWrapper = require("../../src/js/components/RendererWrapper.jsx");
var test_charts = require("./test_charts.json");
var sample = require("lodash/sampleSize");
var breakpoints = require("../../src/js/config/chart-breakpoints");

var chartDivStyle = {
	"marginTop": "30px"
};

// Optional array of chart ids to exclusively render.
var ids = [
];

// TODO: automatically get 2-4? charts of each type

var widths = [ 960, 640, 480, 360 ];
var numCharts = 12;

module.exports = React.createClass({

	render: function() {

		var specified_charts;

		if (ids.length > 0) {
			specified_charts = test_charts.filter(function(chart) {
				return (ids.indexOf(chart._id) > -1);
			});
		} else {
			specified_charts = sample(test_charts, numCharts);
		}

		var charts = specified_charts.map(function(model, i) {
			var width = widths[(i % widths.length)];
			return (
				<div key={i} style={chartDivStyle} className="model-sample">
					<h1>{"Type: " + model.metadata.chartType}</h1>
					<h1>{"Width: " + width}</h1>
					<div style={{margin: "0 auto", width: width}}>
						<RendererWrapper
							editable={false}
							model={model}
							svgSizeClass={breakpoints.getBreakpointObj(width)}
							showMetadata={true}
							enableResponsive={true}
						/>
					</div>
				</div>
			);
		});

		return (
			<div className="rendered-charts">
				{charts}
			</div>
		);
	}

});

