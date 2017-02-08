import {clone, map, assign, each, filter, flatten} from 'lodash';

const colorScales = require('./../../../util/colorscales');
const dataBySeries = require("./../../../util/parse-map-data-by-series");
const help = require("../../../util/helper");

const SessionStore = require("../../../stores/SessionStore");

const parseDelimInput = require("./../../../util/parse-delimited-input").parser;
const parseColumns = require("./../../../util/parse-delimited-input")._parseColumnVals;
const parseMapType = require('./../../../util/parse-map-type');

const defaultmap = 'states50';

/**
 * see [ChartConfig#parser](#chartconfig/parser)
 * @see ChartConfig#parser
 * @instance
 * @memberof xy_config
 */
let parseBubble = (config, _chartProps, callback, parseOpts, priorData = false, priorSchema = false) => {
  // Build chart settings from defaults or provided settings

  parseOpts = parseOpts || {};
  // clone so that we aren't modifying original
  // this can probably be avoided by applying new settings differently
  let chartProps = JSON.parse(JSON.stringify(_chartProps));

  let maptype;

  if (parseOpts === 'input') {
  	maptype = chartProps.input.type;
  } else {
	  if (!chartProps.input.type) {
	  	maptype = defaultmap;
	  } else {
	  	maptype = chartProps.input.type;
	  }
  }

  let bySeries = dataBySeries(chartProps.input.raw, chartProps, {
    type: maptype
  });

  const dataParsed = bySeries.data;

  const columnNames = dataParsed.columnNames;
	const valueColumn = columnNames.length === 2 ? columnNames[1] : columnNames[2];

  let parsedInputEntries = dataParsed.entries;

  const scaleNames = [];
  const scaleIndex = [];

  bySeries.series.forEach((d) => {
    scaleIndex.push(d.name);
    scaleNames.push(d.name);
  });

  /*chartProps.chartSettings.forEach((d,i) => {
    if (d.label && scaleIndex[i] !== d.label) scaleNames[i] = d.label;
  });*/

  const labels = chartProps._annotations.labels;
  const allColumn = true;
  // check if either scale contains columns, as we'll need to zero the axis
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

  // not needed
  labels.values = map(bySeries.series, (dataSeries, i) => {

    if (labels.values[i]) return assign({}, { name: chartSettings[i].label}, labels.values[i]);
    else {
      return {
        name: dataSeries.name
      };
    }
  });

  const scale = {};
  const legends = {};
  const mobileScale = {};
  const maxPrecision = 1;
  const factor = Math.pow(10, maxPrecision);

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

    const totalcolors = 1;
    const ticks = 2;

    currScale.ticks = ticks;

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
    //currLegend.shapes = help.constructLegendShapes(1);
    //currLegend.range = help.constructLegendRange(currScale.ticks, currScale.type);
    //currLegend.domain = help.constructLegendDomain(currScale.tickValues, currScale.ticks);
    currLegend.tickValues = help.constructLegendTicks(currScale.tickValues, currScale.ticks, currScale.type);

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

  /*each(chartSettings, (z,g) => {

    map(bySeries.series, (dataSeries, i) => {
      if (dataSeries.name === z.label) {
        //chartSettings[g].scale = scale[z.label];
        if (bySeries.isNumeric) {
          chartSettings[g].scale.isNumeric = bySeries.isNumeric;

          /*chartSettings[g].scale.numericSettings = clone(chartSettings[g].scale) ||
            clone(config.defaultProps.chartProps.chartSettings[0].scale);*/
        /*}
      }
    });
  });*/

  let allData = [];

  each(bySeries.series, (item, j) => {

    const thisItem = map(item.values, (d) =>  {
              d.index = item.index;
            return d; });

    allData.push(thisItem);
  });

  allData = flatten(allData);

  const firstColumn = columnNames[0];
  const allSeriesData = bySeries.series;

  let schema;

  if (priorData) {
  	if (parseOpts === 'input') {
  		schema = parseMapType.assign_map(firstColumn, bySeries.series, maptype);
  	} else {
	    if (!priorSchema) {
	    	schema = parseMapType.determine_map(firstColumn, bySeries.series);
	    }
	    else schema = priorSchema;
  	}
  }
  else {
  	// if making a map type switch, use the previous map type option
  	if (parseOpts === 'receive-model' && maptype !== defaultmap) {
  		schema = parseMapType.assign_map(firstColumn, bySeries.series, maptype);
  	} else {
  	// if just parsing data or something else, change it.
    	schema = parseMapType.determine_map(firstColumn, bySeries.series);
  	}
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

  let newChartProps = assign(chartProps, {
    chartSettings: chartSettings,
    columns: columnNames,
    entries: parsedInputEntries,
    input: bySeries.input,
    data: bySeries.series,
    alldata: allData,
    scale: scale,
    schema: schema,
    legend: legends,
    visualType: config.defaultProps.chartProps.visualType
  });

  if (callback) {
    callback(newChartProps);
  } else {
    return newChartProps;
  }

}

module.exports = parseBubble;
