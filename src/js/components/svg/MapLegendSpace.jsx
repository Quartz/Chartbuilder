
import d3 from 'd3';
import React, {PropTypes} from 'react';
import ReactDom from 'react-dom';


/*


should probably move this to a common file
also present in helper.js
*/


// set number of legends to position on a row, max
const legendsPerRow = 4;
//this should match the stroke-width of .legend-ticks in chart-renderer.styl
const legendMargin = 1.5;
const legendHeight = 8;
const legendyAdjustment = 15;
const yOffsetText = legendHeight + legendyAdjustment;
const legendSecondRowwOffset = 56;

const legendTotalPercents = {
	1: 60,
	2: 35,
	3: 25,
	4: 20,
	5: 20,
	6: 20,
	7: 20
}

/**
 *
 * @instance
 * @memberof RendererWrapper
 */
const LegendSpace = React.createClass({

	propTypes: {
		translate: PropTypes.object,
		chartWidth: PropTypes.number,
		className: PropTypes.string,
		metadata: PropTypes.object,
		chartProps: PropTypes.object.isRequired,
	},
	mountDraggyLegend: function() {

		const stylings = this.props.chartProps.stylings;

		if (stylings.type === 'dorling' || stylings.type === 'demers'
				|| this.props.metadata.chartType === 'mapbubble') {

			const g = d3.select('.legendsGroup');

			if (g.size()) {

				const drag = d3.behavior.drag()
					.on('drag', function (d) {

							d.x = (d.x || 0) + (d3.event.dx || 0);
							d.y = (d.y || 0) + (d3.event.dy || 0);

							d3.select(this).datum([{x:d.x,y:d.y}]).attr('transform', 'translate('+d.x +','+d.y+')');
					});

				if (!g.datum()) g.data([{x:0,y:0}]).call(drag);

				g.attr('transform', (d) => {
					return 'translate('+ (d.x || 0) +','+ (d.y || 0) +')';
				});
			}
		}

	},
	componentDidUpdate: function() {
		this.mountDraggyLegend();
	},
	componentDidMount: function() {
		this.mountDraggyLegend();
	},
	_translatePositions: function(chartWidth, n) {

		return;
	},
	_offsetPositions: function(chartWidth, legendsArray) {

		const positions = {};
		const numLegends = legendsArray.length;

		positions.legendTotalSize = chartWidth * ((legendTotalPercents[numLegends]) / 100);

		// Don't make the legend too big for single or double color values
		if (numLegends === 1 && legendsArray[0].colorValues.length < 3) {
			positions.legendTotalSize = (chartWidth / 3.5) * legendsArray[0].colorValues.length;
		}
		positions.groupMargin = legendTotalPercents[numLegends];

		return positions;
	},
	_offsetAdjustments: function(legendsArray, i, chartWidth) {

			const offsets = {};

			// two rows
			if (legendsArray.length > legendsPerRow && (i > legendsPerRow - 1)) {
				offsets.yOffsetAdjusted = legendSecondRowwOffset;

				// we add the + 1 to move the second row over one position, so as not to occlude
				// logos etc..
				const offsetPositions = this._offsetPositions(chartWidth, legendsArray);

				offsets.xOffset = ((i - legendsPerRow + 1) * offsetPositions.legendTotalSize) + (offsetPositions.groupMargin * (i - legendsPerRow + 1));
			}
			// one row
			else {

				const offsetPositions = this._offsetPositions(chartWidth, legendsArray);

				offsets.xOffset = (i * offsetPositions.legendTotalSize) + (offsetPositions.groupMargin * i);

				// by default do not offset the y
				offsets.yOffsetAdjusted = 0;
			}

			return offsets;

	},/*
	_construct_legend_domain: function (values, colors) {

	  //if (colors === values.length) return values;

	  return values;
	},
	_construct_legend_range: function (colors, scaletype) {

	  let thislegendw;

	  (colors < 2) ? thislegendw = (legendtotal / 3)
	            : thislegendw = (legendtotal + (colors * legendmargin));

	  const value = [];

	  if (scaletype === 'quantize') return [0,thislegendw];
	  else if (scaletype === 'cluster') {

	    const thisrect = (colors < 2) ? legendrect * 2 : legendtotal / colors;
	    const space = thislegendw / colors;

	    for (let i = 0; i < colors; i++) {
	      value.push((i * (space)) + (thisrect / 2));
	    }

	    return value;
	  }
	  else if (scaletype === 'threshold') {

	    /*let thisrect = (colornumber < 2) ? legendrect * 2 : legendtotal / colors;
	    let space = width / (colors);

	    for (let i = 0; i < colors; i++) {
	      value.push((i * space) + (thisrect / 2));
	    }*//*

	    return value;
	  }
	  else return [0,0];
	},*/
	_tierAdjustments: function(translate, legendsArray) {

		// defaults legend positions
		// Assume two rows. Margins are from config
		let translateLegendsAdjusted = translate.legendsTwoRow;
		// Use default legend height
		let legendheightAdjusted = legendHeight;
		//
		// for one row
		if (legendsArray.length === 1) {
			//make the legends slightly larger if only one row
			//legendheightAdjusted = legendHeight * 1.2;
			//move the legends lower if only one legend row
			translateLegendsAdjusted = translate.legendsOneRow;
		}

		return {
			legendHeightAdjusted: legendheightAdjusted,
			legendTranslateAdjusted: translateLegendsAdjusted
		}
	},
	_tickOffsets: function (j, thisTick, legendData, legendRectWidth) {

		const tickOffsets = {};

		tickOffsets.thisTick = thisTick;

		//Add prefix to first tick
		if (j === 0) tickOffsets.thisTick = legendData.prefix + thisTick.toString();
		//Add suffix to last tick
		if ((j + 1) === legendData.tickValues.length) tickOffsets.thisTick = thisTick.toString() + legendData.suffix;

		tickOffsets.x = (j === 0) ? 0 : (legendRectWidth * j) + (legendMargin * j);

		// Position the legend differently for threshold
		if (legendData.type === 'threshold') {
			tickOffsets.x = (j === 0) ? 0 : (legendRectWidth * (j)) + (legendMargin * (j));
		}

		// For non-thresholds, make a solid block rather than splitting for two rect legends
		if (legendData.tickValues.length === 2 && (legendData.tickValues[0] === legendData.tickValues[1])
			&& (legendData.type !== 'threshold')) {
			tickOffsets.x = tickOffsets.x + (legendRectWidth/2);
			if (j) tickOffsets.thisTick = false;
		}

		return tickOffsets;
	},
	render: function() {

		//console.log('render legend');
		//console.log(this.props,'props');

		const chartProps = this.props.chartProps;
		const stylings = chartProps.stylings;
		const metadata = this.props.metadata;
		const translate = this.props.translate;
		const dimensions = this.props.dimensions;
		const chartWidth = this.props.chartWidth;

		const legendsArray = Object.keys(chartProps.legend).map((k) => chartProps.legend[k]);

		const legendAdjustments = this._tierAdjustments(translate, legendsArray);

		//currLegend.range = help.constructLegendRange(currScale.ticks, currScale.type);
    //currLegend.domain = help.constructLegendDomain(currScale.tickValues, currScale.ticks);

		/*

		*/

		const legendRender = legendsArray.map((legendData, i) => {
		/* Offsets


		*/
		const positions = this._offsetPositions(chartWidth, legendsArray);
		const groupTotal = positions.groupMargin;
		const legendTotalRectWidth = positions.legendTotalSize;

		const offsets = this._offsetAdjustments(legendsArray, i, chartWidth);

			/* get individual blocks for each legend group

			*/
			const legendBlocks = legendData.colorValues.map((thisColor, j) => {
				// shapes = size of each shape in the legend
				// legendMargin = margin between shapes

				const legendRectWidth = legendTotalRectWidth / legendData.colorValues.length;

				const xOffsetEachBlock = (j === 0) ? 0 : (legendRectWidth * j) + (legendMargin * j);

					// return blocks and the tick difference markers
					return (
									<rect
										key= {`legend_block_${j}`}
										transform={`translate(${xOffsetEachBlock},0)`}
										style={{fill: thisColor || '#999'}}
										height={legendAdjustments.legendHeightAdjusted}
										width={legendRectWidth + 'px'}
									/>);
			});

			/*
				Legend ticks
			*/
			const legendTicks = legendData.tickValues.map((thisTick, j) => {

				// only perform if not last and not first
				if (j !== 0 && j !== (legendData.tickValues.length - 1)) {
					//
					const legendRectWidth = legendTotalRectWidth / (legendData.tickValues.length - 1);

					const tickOffsets = this._tickOffsets(j, thisTick, legendData, legendRectWidth);
					const adjustmentTick = 1;

					return (
										<line
											key= {`legend_tick_${j}`}
											y1={0}
											y2={legendAdjustments.legendHeightAdjusted + 4}
											x1={tickOffsets.x - adjustmentTick}
											x2={tickOffsets.x - adjustmentTick}
											className='legend-ticks'
										/>);
				}
				else return;
			});

			legendBlocks.push(legendTicks)

			/*
				Legend text
			*/
			if (stylings.showLegendTicks) {
				const legendText = legendData.tickValues.map((thisTick, j) => {

					const legendRectWidth = legendTotalRectWidth / (legendData.tickValues.length - 1);

					const tickOffsets = this._tickOffsets(j, thisTick, legendData, legendRectWidth);

					return (<text
											key= {`legend_text_${j}`}
											transform={`translate(${tickOffsets.x},${yOffsetText})`}
											className='legend-text'
										>{tickOffsets.thisTick}</text>);
				});
				legendBlocks.push(legendText);
			}
		/* Add label

		*/
		const legendLabels = (<text key= {`legend_label_${i}`}
													className='legend-label'
													transform={`translate(0,-7)`}
													>
													{`${legendData.label}`}
												</text>);

		const numPerRow = (legendsArray.length > 4) ? 4 : legendsArray.length;
		const legendOffset = (chartWidth - (groupTotal * (numPerRow - 1)) - (legendTotalRectWidth * numPerRow)) / 2;

		return (

				<g key={`legend_${i}`}
					transform={`translate(${offsets.xOffset + legendOffset},${offsets.yOffsetAdjusted})`}>
					{legendLabels}
					{legendBlocks}
				</g>
			);
		});

		const radialTest = stylings.type === 'dorling' || stylings.type === 'demers' || metadata.chartType === 'mapbubble';

		if (radialTest) {

			const demersdorlingRender = (<Map_Radial_Legend
																			metadata={metadata}
																			chartProps={chartProps}
																			stylings={stylings}
																			translate={translate}
																		/>);

			legendRender.push(demersdorlingRender)
		}

		return (
			<g className={this.props.className}
				transform={`translate(${translate.legendleft},${legendAdjustments.legendTranslateAdjusted})`}
			>
				{legendRender}
			</g>
		);
	}
});

/**
 * Series-specific settings for each column in data

 * @memberof XYEditor
 */
const Map_Radial_Legend = React.createClass({

  propTypes: {
  },

  render: function() {

  	const stylings = this.props.stylings;
  	const chartProps = this.props.chartProps;
  	const metadata = this.props.metadata;
		const translate = this.props.translate;

  	const radius = d3.scale.sqrt().range([0, stylings.radiusVal]);

		const dataMax = d3.max(chartProps.alldata, function(d){ return +d.values; } );
		radius.domain([0, dataMax]);

		const dataCircleSm = radius(Math.round(dataMax / 10));
		const dataCirclelabelSm = Math.round(dataMax / 10);

		const dataCircleLg = radius(Math.round(dataMax / 2.2));
		const dataCirclelabelLg = Math.round(dataMax / 2.2);

		const offsetbase = -30;
		const demersYOffset = offsetbase - (dataCircleLg * 2);
		const demersYTextOffset = offsetbase - 2;

		const rxLg = (stylings.type === 'dorling' || metadata.chartType === 'mapbubble') ? dataCircleLg : 0;
		const rxSm = (stylings.type === 'dorling' || metadata.chartType === 'mapbubble') ? dataCircleSm : 0;

		const smX = dataCircleLg - dataCircleSm; //(dataCircleLg / 2) - dataCircleSm;
		const smY = (dataCircleLg * 2) - (dataCircleSm * 2); //(rxLg) - (rxSm * 2);

		const demersTransform = 'translate(' + (translate.right - 120) + ','+ demersYOffset +')';
		const demersTransformText1 = 'translate(' + (translate.right - 130) + ','+ (demersYTextOffset - 18) +')';
		const demersTransformText2 = 'translate(' + (translate.right - 130) + ','+ demersYTextOffset +')';

		const s = stylings.legendText || ' ';

		let middle = Math.floor(s.length / 2);
		const before = s.lastIndexOf(' ', middle);
		const after = s.indexOf(' ', middle + 1);

		if (middle - before < after - middle) middle = before;
		else middle = after;

		const legendText1 = s.substr(0, middle);
		const legendText2 = s.substr(middle + 1);

    return (
    	<g
				className="legendsGroup"
				key={"legendsGroup_" + metadata.chartType}
					>
					<g transform={demersTransform}
					className='demersdorlingLegend'>
					<text
					x={dataCircleLg}
					y='-4'>
						{dataCirclelabelLg}
					</text>
					 <text
					 x={dataCircleLg}
					 y={smY - 2}
					 >
						{dataCirclelabelSm}
					</text>
					<rect
						ry={rxSm}
						rx={rxSm}
						x={smX}
						y={smY}
						height={dataCircleSm * 2}
						width={dataCircleSm * 2}
					/>
					<rect
						ry={rxLg}
						rx={rxLg}
						x='0'
						y='0'
						height={dataCircleLg * 2}
						width={dataCircleLg * 2}
					/>
				</g>
				<g className="extra-legend"
					transform={demersTransformText1}>
					<text className="extra-legend-text">
						{legendText1}
					</text>
				</g>
				<g className="extra-legend"
					transform={demersTransformText2}>
					<text className="extra-legend-text">
						{legendText2}
					</text>
				</g>
			</g>
    );
  }
});


module.exports = LegendSpace;
