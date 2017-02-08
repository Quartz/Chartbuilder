import {clone, map, assign, each, filter, flatten, isEqual} from 'lodash';

const colorScales = require('./../../../util/colorscales');
const dataBySeries = require("./../../../util/parse-map-data-by-series");
const help = require("./../../../util/helper");
const SessionStore = require("../../../stores/SessionStore");

const parseDelimInput = require("./../../../util/parse-delimited-input").parser;
const parseColumns = require("./../../../util/parse-delimited-input")._parseColumnVals;
const parseMapType = require('./../../../util/parse-map-type');

const defaultmap = 'states50';
const mintickPrecision = 0;
/**
 * see [MapConfig#parser](#mapconfig/parser)
 * @see MapConfig#parser
 * @instance
 * @memberof xy_config
 */

const parse50 = (config, _chartProps, callback, parseOpts, priorData = false, priorSchema = false) => {
  // Build chart settings from defaults or provided settings

  const scale = {};
  const legends = {};
  const mobileScale = {};
  //const maxPrecision = 1;
  //const factor = Math.pow(10, maxPrecision);


  const scaleNames = [];
  const scaleIndex = [];

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
  let parsedInputEntries = dataParsed.entries;
  const columnNames = dataParsed.columnNames;
	const valueColumn = columnNames.length === 2 ? columnNames[1] : columnNames[2];

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
   /* else {
    	// use defaults if there a column is missing from the series..
      settings = clone(config.defaultProps.chartProps.chartSettings[0], true);
      settings.colorIndex = i;
    }*/

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

  // Calculate domain and tick values for any scales that exist
  each(scaleNames, (name, j) => {

    let currScale;

    //use the existing scale config unless it is undefined
    if (chartProps.scale) {
      if (chartProps.scale[j]) currScale = chartProps.scale[j];
      else currScale = clone(config.defaultProps.chartProps.chartSettings[0].scale, true);
    } else {
    	currScale = clone(config.defaultProps.chartProps.chartSettings[0].scale, true);
    }

    /*
		The scales are computed as follows:

		there is the data "domain" -- the full domain of the value extent.
		there is the scale domain -- the domain for the specific type of scale, threshold, cluster etc
		there are the ticks -- computed based on the scale domain and the data's properties

		first, compute full domain based on currScale passed in values or on the full dataset, whichever needed

    */
    let domain = help.computeMapScaleDomain(currScale, _computed[j].data);
    assign(currScale, domain);

    /* colors

    */
    /* if updating the data length to be shorter for a series, reduce the num of colors
    */
    if (_computed[j].data.length <= currScale.colors) {
    	currScale.colors = _computed[j].data.length;
    }
    const totalcolors = currScale.colors;
    // should be one more tick than there are legend shapes
    currScale.ticks = currScale.colors + 1;
    currScale.colorIndex = chartSettings[j].colorIndex;

    /* TICKS */

    // compute the tick values based on the scale and the data
    const ticks = currScale.ticks;

	  currScale.tickValues = help.exactTicks(currScale.domain, ticks, currScale.type, currScale.tickValues, _computed[j].data);
    //round the tick values by the precision indicated
   	// set a minimum level of precison (ie., 0, meaning no decimal points, or 1)
    //
    if (mintickPrecision > currScale.precision) {
      currScale.precision = mintickPrecision;
    }
    // for each tick value, test the number of decimals. if greater than precision, round down.
    currScale.tickValues.forEach((v, i) => {
      currScale.tickValues[i] = (help.getDecimals(v) > currScale.precision) ? help.roundToPrecision(v, currScale.precision) : v;  //Math.round(v * (Math.pow(10, currScale.precision)) / (Math.pow(10, currScale.precision))) : v;
    });
    /* Build scale based on the data and the full domain */
    currScale.d3scale = help.returnD3Scale(currScale.colorIndex, totalcolors, currScale.domain, currScale.type, _computed[j].data, currScale.tickValues);

    scale[j] = currScale;
    chartSettings[j].scale = currScale;

    //
    // compute the legend based on the scales built
    //
    const currLegend = {
    	d3scale:help.returnD3Scale(currScale.colorIndex, totalcolors, currScale.domain, currScale.type, _computed[j].data, currScale.tickValues),
    	colorValues:colorScales.scalesMap(currScale.colorIndex)[totalcolors],
    	type:currScale.type,
    	label:chartSettings[j].label,
    	prefix:currScale.prefix,
    	suffix:currScale.suffix,
    	tickValues:help.constructLegendTicks(currScale.tickValues, currScale.ticks, currScale.type)
    }

    legends[name] = currLegend;
    chartSettings[j].legends = currLegend;
    /*

    work on mobile
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


 /* each(chartSettings, (z,g) => {

    map(bySeries.series, (dataSeries, i) => {
      if (dataSeries.name === z.label) {
        //chartSettings[g].scale = scale[z.label];
        if (bySeries.isNumeric) {
          chartSettings[g].scale.isNumeric = bySeries.isNumeric;

          /*chartSettings[g].scale.numericSettings = clone(chartSettings[g].scale) ||
            clone(config.defaultProps.chartProps.chartSettings[0].scale);*/
       /* }
      }
    });
  });*/

  /*
  	Schemas
  */

  const firstColumn = columnNames[0];
  const allData = bySeries.series;

  let schema;

  if (priorData) {
  	if (parseOpts === 'input') {
  		schema = parseMapType.assign_map(firstColumn, allData, maptype);
  	} else {
	    if (!priorSchema) schema = parseMapType.determine_map(firstColumn, allData);
	    else schema = priorSchema;
  	}
  }
  else {
  	// if making a map type switch, use the previous map type option
  	if (parseOpts === 'receive-model' && maptype !== defaultmap) {
  		schema = parseMapType.assign_map(firstColumn, allData, maptype);
  	} else {
  	// if just parsing data or something else, change it.
    	schema = parseMapType.determine_map(firstColumn, allData);
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
