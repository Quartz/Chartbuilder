/*
 * ### GridChart
 * A single chart in a grid of N columns by N rows of the same kind of chart.
 * See `ChartGridRenderer.jsx`, the parent component
*/

var React = require("react");
var ReactDOM = require("react-dom");
var PropTypes = React.PropTypes;
var update = require("react-addons-update");
var d4 = require("d4");

// Date parsing settings
var DateScaleMixin = require("../mixins/DateScaleMixin.js");
var NumericScaleMixin = require("../mixins/NumericScaleMixin.js");
/**
 * ### Component that renders a single grid chart. One of these is rendered for each series in a chart grid
 * @property {object} styleConfig - Allow the rendered component to interacted with and edited
 * @property {object} displayConfig - Parsed visual display configuration for chart grid
 * @property {object} chartProps - Properties used to draw this chart
 * @property {function} rendererFunc - Function that we will pass to grid to
 * draw the actual chart
 * @property {object} grid - Settings for grid type, and number of columns/rows
 * @instance
 * @memberof ChartGridRenderer
 */
var GridChart = React.createClass({

	propTypes: {
		index: PropTypes.number.isRequired,
		chartProps: PropTypes.shape({
			chartSettings: PropTypes.object.isRequired,
			data: PropTypes.array.isRequired,
			scale: PropTypes.object.isRequired
		}).isRequired,
		styleConfig: PropTypes.object.isRequired,
		rendererFunc: PropTypes.func.isRequired,
		grid: PropTypes.object.isRequired,
		padding: PropTypes.object
	},

	getInitialState: function() {
		return {
			positions: {
				x: 0,
				y: 0
			}
		};
	},

	mixins: [DateScaleMixin, NumericScaleMixin],

	shouldComponentUpdate: function(nextProps, nextState) {
		// Draw chart when updated
		var el = ReactDOM.findDOMNode(this);
		this.props.rendererFunc(el, this._getChartState(nextProps, nextState));
		return true;
	},

	componentWillMount: function() {
		// Set the position of this `GridChart`
		var positions = this._computeGridPositions(this.props);

		this.setState({
			positions: positions
		});
	},

	componentDidMount: function() {
		// Draw chart once mounted
		var el = ReactDOM.findDOMNode(this);

		if (this.props.chartProps.data.length === 0) {
			return;
		} else {
			this.props.rendererFunc(el, this._getChartState(this.props, this.state));
		}
	},

	componentWillReceiveProps: function(nextProps) {
		// Update positions when new props are received
		// We do this in `componentWillReceiveProps` because it allows you to run
		// `setState` before the component renders, avoiding a double render
		var positions = this._computeGridPositions(nextProps);

		this.setState({
			positions: positions
		});
	},

	_getChartState: function(props, state) {

		var dateSettings;
		var numericSettings;
		// Calculate date settings if date scale is being used
		if (props.chartProps.scale.hasDate) {
			dateSettings = this.generateDateScale(props);
		} else if (props.chartProps.scale.isNumeric) {
			numericSettings = this.generateNumericScale(props);
		}

		return {
			chartProps: props.chartProps,
			dimensions: props.dimensions,
			grid: props.grid,
			styleConfig: props.styleConfig,
			displayConfig: props.displayConfig,
			hasColumn: (props.grid.type == "column"),
			barLabelOverlap: props.barLabelOverlap,
			dateSettings: dateSettings,
			numericSettings: numericSettings,
			positions: state.positions,
			padding: props.padding,
		};
	},

	_computeGridPositions: function(props) {
		// Compute the position of each grid chart based on its index, the number
		// of rows and columns, and the dimensions of the chart. These return
		// [x,y] coordinates that correlate to its position in the grid, like so:
		//
		// ```
		// | 0,0 | 1,0 | 2,0 |
		// | 0,1 | 1,1 | 2,1 |
		// | 0,2 | 1,2 | 2,2 |
		// ```
		//
		// These values are then multiplied by the dimensions divided by number of
		// rows/cols to find the position in the SVG stage.
		var grid = props.grid;
		var ix = props.index;

		return {
			x: ix % grid.cols,
			y: (ix === 0) ? 0 : Math.floor( ix / grid.cols )
		};
	},

	render: function() {
		// Draw `<svg:g>` for the chart and translate it to its positions
		var chartProps = this.props.chartProps;
		var translateY = 0;
		var translateX = 0;

		if (this.state.positions.y > 0) {
			translateY =
				chartProps.extraPadding.top +
				(this.props.dimensions.height * this.state.positions.y);
		} else {
			translateY = chartProps.extraPadding.top;
		}
		if (this.state.positions.x > 0) {
			translateX =
				chartProps.extraPadding.left +
				(this.props.dimensions.width + chartProps.extraPadding.right) *
				this.state.positions.x;
		}

		return (
			<g
				className="grid-chart-block"
				transform={"translate(" + [translateX, translateY] + ")"}
			/>
		);
	}

});


module.exports = GridChart;
