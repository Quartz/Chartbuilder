var chartGenerators = require("../chart-generators");
require("react/addons");
var RendererWrapper = require("../../src/js/components/RendererWrapper.jsx");
var test_charts = require("./test_charts.json");
var sample = require("lodash").sample;

var chartDivStyle = {
	"marginTop": "20px"
};

// Optional array of chart ids to exclusively render.
var ids = [
];

var widths = [ 320, 320, 480, 480 ];
var numCharts = 25;

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
					<h2 style={{"textAlign": "center"}}>
						{[ model.metadata.chartType, width, model._id ].join(" - ")}
					</h2>
					<RendererWrapper
						editable={false}
						model={model}
						showMetadata={true}
						enableResponsive={true}
					/>
				</div>
			);
		})
		return (
			<div className="rendered-charts">
				{charts}
			</div>
		);
	}

});

