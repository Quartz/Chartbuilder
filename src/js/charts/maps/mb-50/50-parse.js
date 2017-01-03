import {clone, map, assign, each, filter, flatten, isEqual} from 'lodash';

const colorScales = require('./../../../util/colorscales');
const dataBySeries = require("./../../../util/parse-map-data-by-series");
const help = require("./../../../util/helper");
const SessionStore = require("../../../stores/SessionStore");

const parseDelimInput = require("./../../../util/parse-delimited-input").parser;
const parseColumns = require("./../../../util/parse-delimited-input")._parseColumnVals;
const parseMapType = require('./../../../util/parse-map-type');

/**
 * see [MapConfig#parser](#mapconfig/parser)
 * @see MapConfig#parser
 * @instance
 * @memberof xy_config
 */


const parse50 = (config, _chartProps, callback, parseOpts, priorData = [], priorSchema = []) => {
  // Build chart settings from defaults or provided settings

  parseOpts = parseOpts || {};
  // clone so that we aren't modifying original
  // this can probably be avoided by applying new settings differently
  let chartProps = JSON.parse(JSON.stringify(_chartProps));

  let bySeries = dataBySeries(chartProps.input.raw, chartProps, {
    type: chartProps.input.type
  });

  const dataParsed = bySeries.data;

  let parsedInputEntries = dataParsed.entries;
  const columnNames = dataParsed.columnNames;
	const valueColumn = columnNames.length === 2 ? columnNames[1] : columnNames[2];

  const scaleNames = [];
  const scaleIndex = [];

  bySeries.series.forEach((d) => {
    scaleIndex.push(d.name);
    scaleNames.push(d.name);
  });

  const labels = chartProps._annotations.labels;
  const _computed = {};

  scaleIndex.forEach((name, i) => {
    _computed[i] = {
      data : []
    };
  });

  const chartSettings = map(bySeries.series, (dataSeries, i) => {
    let settings;

    if (chartProps.chartSettings[i]) settings = chartProps.chartSettings[i];
    else {
      settings = clone(config.defaultProps.chartProps.chartSettings[0], true);
      settings.colorIndex = i;
    }

    if (parseOpts.columnsChanged) settings.label = clone(bySeries.series[i].name);
    else {
      settings.label = settings.label || bySeries.series[i].name;
    }

    const values = map(dataSeries.values, (d) => {
      return +d[valueColumn];
    });

    _computed[i].data = _computed[i].data.concat(values);

    return settings;
  });

  const scale = {};
  const legends = {};
  const mobileScale = {};
  const maxPrecision = 1;
  const factor = Math.pow(10, maxPrecision);

  /*

  good god review this

  */

  // Calculate domain and tick values for any scales that exist
  each(scaleNames, (name,j) => {

    let currScale;
    const currLegend = {};

    if (chartProps.scale) {
      if (chartProps.scale[j]) currScale = chartProps.scale[j];
      else currScale = clone(config.defaultProps.chartProps.chartSettings[0].scale, true);
    }
    else currScale = clone(config.defaultProps.chartProps.chartSettings[0].scale, true);

    let domain = help.computeScaleDomain(currScale, _computed[j].data);

    assign(currScale, domain);

    if (_computed[j].data.length <= currScale.colors) currScale.colors = _computed[j].data.length;

    currScale.ticks = currScale.colors + 1;
    const ticks = currScale.ticks;

    const totalcolors = currScale.colors;

    currScale.colorIndex = chartSettings[j].colorIndex;

    currScale.tickValues = help.exactTicks(currScale.domain, ticks, _computed[j].data, currScale.type, currScale.tickValues);

    currScale.tickValues.forEach((v, i) => {
      const tickPrecision = help.precision(Math.round(v*factor)/factor);
      if (tickPrecision > currScale.precision) {
        currScale.precision = tickPrecision;
      }
      currScale.tickValues[i] = currScale.precision ? Math.round(v * (10 * currScale.precision)) / (10 * currScale.precision) : v;

    });

    currScale.d3scale = help.returnD3Scale(currScale.colorIndex, totalcolors, currScale.domain, currScale.type, _computed[j].data, currScale.tickValues);
    currLegend.d3scale = help.returnD3Scale(currScale.colorIndex, totalcolors, currScale.domain, currScale.type, _computed[j].data, currScale.tickValues);

    scale[j] = currScale;
    chartSettings[j].scale = currScale;

    currLegend.colorValues = colorScales.scalesMap(currScale.colorIndex)[totalcolors];
    currLegend.type = currScale.type;
    currLegend.label = chartSettings[j].label;
    currLegend.prefix = currScale.prefix;
    currLegend.suffix = currScale.suffix;
    currLegend.tickValues = help.constructLegendTicks(currScale.tickValues, currScale.ticks, currScale.type);


    //currLegend.shapes = help.constructLegendShapes(currScale.colors, );
    //currLegend.range = help.constructLegendRange(currScale.ticks, currScale.type);
    //currLegend.domain = help.constructLegendDomain(currScale.tickValues, currScale.ticks);

    //currLegend.spacings = help.constructLegendSpacings();
    //currLegend.transforms = help.constructLegendTransform(j, legends,currLegend, scaleNames);


    legends[name] = currLegend;
    chartSettings[j].legends = currLegend;

    /*

    this is not right
    */
    /*if (chartProps.mobile) {
      if (chartProps.mobile.scale) {
        let currMobile = chartProps.mobile.scale[name];
        if (currMobile) {
          let domain = help.computeScaleDomain(currMobile, _computed.data, {
            nice: true,
            minZero: _computed.hasColumn
          });
          assign(currMobile, domain);

        }
      }
    } else {
      chartProps.mobile = {};
    } */

  });

  // this should all be included in one big loopa loop

  each(chartSettings, (z,g) => {

    map(bySeries.series, (dataSeries, i) => {
      if (dataSeries.name === z.label) {
        //chartSettings[g].scale = scale[z.label];
        if (bySeries.isNumeric) {
          chartSettings[g].scale.isNumeric = bySeries.isNumeric;

          /*chartSettings[g].scale.numericSettings = clone(chartSettings[g].scale) ||
            clone(config.defaultProps.chartProps.chartSettings[0].scale);*/
        }
      }
    });
  });

  const firstColumn = columnNames[0];
  const allData = bySeries.series;

  let schema;

  if (priorData.length) {

    const test2 = parseMapType.first_column(priorData, firstColumn);
    const test = parseMapType.first_column(allData, firstColumn);

    const test3 = help.isEqualTest(test2, test);

    if (!test3) schema = parseMapType.determine_map(firstColumn, allData);
    else schema = priorSchema;
  }
  else {

    schema = parseMapType.determine_map(firstColumn, allData);
  }


    /*

    if (chartProps.mobile) {
      if (chartProps.mobile.scale) {
        let currMobile = chartProps.mobile.scale.numericSettings;
        if (currMobile) {
          let domain = help.computeScaleDomain(currMobile, _computed.data, {
            nice: true,
            minZero: false
          });
          assign(currMobile, domain);

          let ticks = currMobile.ticks;
          currMobile.tickValues = help.exactTicks(currMobile.domain, ticks);
          each(currMobile.tickValues, function(v) {
            let tickPrecision = help.precision(Math.round(v*factor)/factor);
            if (tickPrecision > currMobile.precision) {
              currMobile.precision = tickPrecision;
            }
          });
        }
        chartProps.mobile.scale.numericSettings = currMobile;
      }
    } else {
      chartProps.mobile = {};
    } */


  const newChartProps = assign(chartProps, {
    chartSettings: chartSettings,
    data: bySeries.series,
    entries: parsedInputEntries,
    input: bySeries.input,
    columns: columnNames,
    scale: scale,
    legend: legends,
    schema: schema,
    visualType: config.defaultProps.chartProps.visualType
  });

  if (callback) {
    callback(newChartProps);
  } else {
    return newChartProps;
  }
}

module.exports = parse50;
