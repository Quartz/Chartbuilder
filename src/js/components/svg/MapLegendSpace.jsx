
import d3 from 'd3';
import React, {PropTypes} from 'react';
import ReactDom from 'react-dom';
import {isUndefined} from 'lodash';

/*

should probably move this to a config file

*/
// set number of legends to position on a row, max
const legendsPerRow = 4;
//this should match the stroke-width of .legend-ticks in chart-renderer.styl
const legendMargin = 1.5;
//legend thickness
const legendDefaultHeight = 8;
// set how far below the second row fits
const legendSecondRowwOffset = 56;
// distance from the top for radial
const radialTier1 = 45;
// line height for radial / demers legend
const legendLineHeight = 14;

// set percent of the width for each legend, given a number of legends
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
class LegendSpace extends React.Component {
	mountDraggyLegend () {
		//
		const props = this.props;
		const stylings = props.chartProps.stylings;
		//
		if (stylings.type === 'dorling' || stylings.type === 'demers'
				|| props.metadata.chartType === 'mapbubble') {

			const g = d3.select('.legendsGroup.' + props.isSmall);

			if (g.size()) {
				const drag = d3.behavior.drag().on('drag', function (d) {
					g.attr('transform', 'translate('+d3.event.x +','+d3.event.y+')');
				});
				g.call(drag);
			}
		}
	}
	componentDidUpdate () {
		this.mountDraggyLegend();
	}
	componentDidMount () {
		this.mountDraggyLegend();
	}
	_offsetPositions (chartWidth, legendsArray) {
		//
		const positions = {};
		const numLegends = legendsArray.length;
		//
		positions.legendTotalSize = chartWidth * ((legendTotalPercents[numLegends]) / 100);

		// Don't make the legend too big for single or double color values
		if (numLegends === 1 && legendsArray[0].colorValues.length < 3) {
			positions.legendTotalSize = (chartWidth / 3.5) * legendsArray[0].colorValues.length;
		}
		positions.groupMargin = legendTotalPercents[numLegends];

		return positions;
	}
	_offsetAdjustments (legendsArray, i, chartWidth) {
		const offsets = {};
		// two rows
		if (legendsArray.length > legendsPerRow && (i > legendsPerRow - 1)) {
			offsets.yOffsetAdjusted = legendSecondRowwOffset;
			// we add the + 1 to move the second row over one position, so as not to occlude
			// logos etc..
			const offsetPositions = this._offsetPositions(chartWidth, legendsArray);

			offsets.xOffset = ((i - legendsPerRow + 1) * offsetPositions.legendTotalSize) + (offsetPositions.groupMargin * (i - legendsPerRow + 1));
		} // one row
		else {
			const offsetPositions = this._offsetPositions(chartWidth, legendsArray);
			offsets.xOffset = (i * offsetPositions.legendTotalSize) + (offsetPositions.groupMargin * i);
			// by default do not offset the y
			offsets.yOffsetAdjusted = 0;
		}
		return offsets;
	}
	_tierAdjustments (translate, legendsArray, legendHeight) {
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
		//
		return {
			legendHeightAdjusted: legendheightAdjusted,
			legendTranslateAdjusted: translateLegendsAdjusted
		}
	}
	_tickOffsets (j, thisTick, legendData, legendRectWidth) {
		//
		const tickOffsets = {};
		//
		tickOffsets.thisTick = thisTick;

		//Add prefix to first tick
		if (j === 0) tickOffsets.thisTick = legendData.prefix + thisTick.toString();
		//Add suffix to last tick
		if ((j + 1) === legendData.tickValues.length) tickOffsets.thisTick = thisTick.toString() + legendData.suffix;

		tickOffsets.x = (j === 0) ? 0 : (legendRectWidth * j) + (legendMargin * j);

		// Position the legend differently for threshold
		if (legendData.type === 'threshold') {
			tickOffsets.x = (j === 0) ? legendRectWidth : (legendRectWidth * (j + 1)) + (legendMargin * (j + 1));
		}

		// For non-thresholds, make a solid block rather than splitting for two rect legends
		if (legendData.tickValues.length === 2 && (legendData.tickValues[0] === legendData.tickValues[1])
			&& (legendData.type !== 'threshold')) {
			tickOffsets.x = tickOffsets.x + (legendRectWidth/2);
			if (j) tickOffsets.thisTick = false;
		}
		return tickOffsets;
	}
	render () {
		const props = this.props;
		const chartProps = props.chartProps;
		const stylings = chartProps.stylings;
		const metadata = props.metadata;
		const translate = props.translate;
		const dimensions = props.dimensions;
		const chartWidth = props.chartWidth;
		const legendsArray = props.legendsArray;


		//set thickness of legend
		const legendHeight = props.isSmall ? legendDefaultHeight / 2 : legendDefaultHeight;
		// set offset of text to legend bars
		const legendyAdjustment = 15;
		const yOffsetText = legendHeight + legendyAdjustment;

		const legendAdjustments = this._tierAdjustments(translate, legendsArray, legendHeight);

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
			const legendTicks = legendData.colorValues.map((thisColor, j) => {
				// only perform if not last and not first
				if (j !== 0) {
					//
					const legendRectWidth = legendTotalRectWidth / legendData.colorValues.length;
					const xOffsetEachBlock = (j === 0) ? 0 : (legendRectWidth * j) + (legendMargin * j)
					const adjustmentTick = 1;

					return (<line
							key= {`legend_tick_${j}`}
							y1={0}
							y2={legendAdjustments.legendHeightAdjusted + 4}
							x1={xOffsetEachBlock - adjustmentTick}
							x2={xOffsetEachBlock - adjustmentTick}
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

					const legendRectWidth = legendTotalRectWidth / legendData.colorValues.length;
					//const legendTickWidth = legendTotalRectWidth / (legendData.tickValues.length - 1);
					const tickOffsets = this._tickOffsets(j, thisTick, legendData, legendRectWidth);

					return (
						<text
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
			legendRender
				.push(<Map_Radial_Legend
								metadata={metadata}
								chartProps={chartProps}
								stylings={stylings}
								translate={translate}
								chartWidth={chartWidth}
								isSmall={props.isSmall}
								legendsArray={legendsArray}
							/>)
		}

		return (
			<g className={this.props.className}
				transform={`translate(0,${legendAdjustments.legendTranslateAdjusted})`}
			>
				{legendRender}
			</g>
		);
	}
};

LegendSpace.propTypes = {
		translate: PropTypes.object,
		chartWidth: PropTypes.number,
		className: PropTypes.string,
		metadata: PropTypes.object,
		chartProps: PropTypes.object.isRequired,
};

/**
 * Series-specific settings for each column in data

 * @memberof XYEditor
 */
class Map_Radial_Legend extends React.Component {

  render () {
  	const props = this.props;
  	const stylings = props.stylings;
  	const chartProps = props.chartProps;
  	const metadata = props.metadata;
		const translate = props.translate;
		const currSettings = chartProps.scale;
		const chartWidth = props.chartWidth;

		const radiusVal = stylings.dorlingradiusVal || stylings.radiusVal
		const radiusComputed = (props.isSmall) ? radiusVal / 2 : radiusVal;

  	const radius = d3.scale.sqrt()
  			.range([0, radiusComputed])
  			.domain(currSettings.domain);

		const dataMax = currSettings.domain[1];
		const dataCircleSm = radius(Math.round(dataMax / 10));
		// Don't show a label if the circle is tiny. The labels will overlap
		const dataCirclelabelSm = radius(Math.round(dataMax / 10)) < 5 ? '' : Math.round(dataMax / 10);

		const dataCircleLg = radius(Math.round(dataMax / 2.2));
		const dataCirclelabelLg = Math.round(dataMax / 2.2);

		const demersYOffset = 20; //(dataCircleLg * 2);
		const demersYTextOffset = demersYOffset - 2;

		const rxLg = (stylings.type === 'dorling' || metadata.chartType === 'mapbubble') ? dataCircleLg : 0;
		const rxSm = (stylings.type === 'dorling' || metadata.chartType === 'mapbubble') ? dataCircleSm : 0;

		const smX = dataCircleLg - dataCircleSm; //(dataCircleLg / 2) - dataCircleSm;
		const smY = (dataCircleLg * 2) - (dataCircleSm * 2); //(rxLg) - (rxSm * 2);

		const demersTransform = 'translate(' + (chartWidth - translate.keyXOffset) + ','+ demersYOffset +')';
		// the 4 is to offset the text from the legend just slightly
		const demersTransformText1 = 'translate(-4,'+ (demersYTextOffset - (legendLineHeight)) +')';
		const demersTransformText2 = 'translate(-4,'+ (demersYTextOffset - (0)) +')';

		const s = stylings.legendText || ' ';

		let middle = Math.floor(s.length / 2);
		const before = s.lastIndexOf(' ', middle);
		const after = s.indexOf(' ', middle + 1);

		if (middle - before < after - middle) middle = before;
		else middle = after;

		const legendText1 = s.substr(0, middle);
		const legendText2 = s.substr(middle + 1);

    return (
    	<g className={"legendsGroup " + props.isSmall}
				key={"legendsGroup_" + metadata.chartType + '_' + props.isSmall}
				transform={demersTransform}
			>
				<g className='demersdorlingLegend'>
					<text x={dataCircleLg} y='-4'>
						{dataCirclelabelLg}
					</text>
					 <text x={dataCircleLg} y={smY - 2}>
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
				<g className="extra-legend" transform={demersTransformText2}>
					<text className="extra-legend-text">
						{legendText2}
					</text>
				</g>
			</g>
    );
  }
};

module.exports = LegendSpace;
