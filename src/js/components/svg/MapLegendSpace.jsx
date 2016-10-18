import d3 from 'd3';
import React, {PropTypes} from 'react';
import ReactDom from 'react-dom';

const legendMargin = 5;
const groupMargin = 60;
const legendRect = 30;
const legendHeight = 16;
const legendtotal = 140;
const legendyAdjustment = 18;
const legendSecondRowwOffset = 70;
const yOffetText = legendHeight + legendyAdjustment;


/**
 * Render a footer with the chart credit and source
 * @instance
 * @memberof RendererWrapper
 */
const LegendSpace = React.createClass({

  propTypes: {
    translate: PropTypes.object,
    chartWidth: PropTypes.number,
    className: PropTypes.string,
    stylings: PropTypes.object,
    metadata: PropTypes.object,
    chartProps: PropTypes.object.isRequired,
  },
  mountDraggyLegend: function() {

    const drag = d3.behavior.drag()
      .on('drag', function (d) {

          d.x = d.x || 0; 
          d.y = d.y || 0;

          d.x += d3.event.dx || 0;
          d.y += d3.event.dy || 0;

          d3.select(this).datum([{x:d.x,y:d.y}])
          .attr('transform', 'translate('+d.x +','+d.y+')');
      });

    let g = d3.select('.legendsGroup');

    if (g.size()) {

      if (!g.datum()) g.data([{x:0,y:0}]).call(drag);

      g.attr('transform', (d) => { 
        if (d.x === undefined) d.x = 0;
        if (d.y === undefined) d.y = 0;
        return 'translate('+ d.x +','+ d.y +')';
      });
    }

  },
  componentDidUpdate: function() {
    this.mountDraggyLegend();
  },
  componentDidMount: function() {
    this.mountDraggyLegend();
  },
  render: function() {

    const stylings = this.props.stylings;
    const translate = this.props.translate;
    const chartProps = this.props.chartProps;
    const metadata = this.props.metadata;

    const legends = chartProps.legend;
    const legendsArray = Object.keys(legends).map((k) => legends[k]);

    const showTicks = stylings.showLegendTicks;
    const legendsXMargin = translate.legendleft;
    
    let translateLegends;
    let legendheightAdjusted;

    let testTwoRow = false;
    let yOffset = 0;
    
    if (legendsArray.length < 4) {
      legendheightAdjusted = legendHeight * 1.2;
      translateLegends = translate.legendsOneRow;
    } 
    else {
      testTwoRow = true;
      legendheightAdjusted = legendHeight;
      translateLegends = translate.legendsTwoRow;
    }

    let demersdorlingRender = false;

    if (stylings.type === 'dorling' || stylings.type === 'demers' 
        || metadata.chartType === 'mapbubble') {

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

      demersdorlingRender = (<g 
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
      </g>);
    }
    /*

    */
    const legendRender = legendsArray.map((legendData, i) => {

      let xOffset = (i * legendtotal) + (groupMargin * i);

      if (testTwoRow && (i > 2)) {
        yOffset = legendSecondRowwOffset;
        xOffset = ((i - 3) * legendtotal) + (groupMargin * (i - 3));
      }

      const legendBlock = legendData.colorValues.map((thisColor, j) => {

        const styles = {
          fill: thisColor || '#999'
        }
        const xOffetBlock = (j === 0) ? 0 : (legendData.shapes * j) + (legendMargin * j);

          return (<rect 
                    key= {`legend_block_${j}`}
                    transform={`translate(${xOffetBlock},0)`}
                    style={styles}
                    height={legendheightAdjusted}
                    width={legendData.shapes + 'px'}
                  />);
      });

       const legendText = legendData.tickValues.map((thisTick, j) => {

        if (j === 0) thisTick = legendData.prefix + thisTick.toString();
        if ((j + 1) === legendData.tickValues.length) thisTick = thisTick.toString() + legendData.suffix;

        let xOffetBlock;

        if (legendData.type === 'threshold') {
          xOffetBlock = (j === 0) ? legendData.shapes : (legendData.shapes * (j + 1)) + (legendMargin * (j + 1));
        } 
        else xOffetBlock = (j === 0) ? 0 : (legendData.shapes * j) + (legendMargin * j);

        if (legendData.tickValues.length === 2 && (legendData.tickValues[0] 
            === legendData.tickValues[1]) && (legendData.type !== 'threshold')) {
          xOffetBlock = xOffetBlock + (legendData.shapes/2);
          if (j) thisTick = false;
        }

        if (showTicks) {
          return (<text 
                    key= {`legend_text_${j}`}
                    transform={`translate(${xOffetBlock},${yOffetText})`}
                    className='legend-text'
                  >{thisTick}</text>);
        } 
        else return false;

      });

    const legendLabel = (<text key= {`legend_label_${i}`}
                          className='legend-label'
                          transform={`translate(0,-10)`}
                          >
                          {`${legendData.label}`}
                        </text>);

    return (

        <g key={`legend_${i}`}
          transform={`translate(${xOffset},${yOffset})`}>
          {legendLabel}
          {legendBlock}
          {legendText}
        </g>
      );
    });

    return (
      <g className={this.props.className}
        transform={`translate(${legendsXMargin},${translateLegends})`}
      >
        {legendRender}
        {demersdorlingRender}
      </g>
    );
  }
});

module.exports = LegendSpace;
