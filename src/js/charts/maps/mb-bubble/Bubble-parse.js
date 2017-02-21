import {clone, map, assign, each, merge} from 'lodash';

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
 * see [ChartConfig#parser](#chartconfig/parser)
 * @see ChartConfig#parser
 * @instance
 * @memberof xy_config
 */
let parseBubble = (config, _chartProps, callback, parseOpts, priorData = false, priorSchema = false) => {
   // Build chart settings from defaults or provided settings

  // clone so that we aren't modifying original
  // this can probably be avoided by applying new settings differently
  let chartProps = JSON.parse(JSON.stringify(_chartProps));

  const scale = {};
  const legends = {};
  const mobileScale = {};

  parseOpts = parseOpts || {};

  let maptype;
  let bySeries = {};
  let _computed;
  let dataParsed;
  let parsedInputEntries;
  let columnNames;

  const labels = chartProps._annotations.labels;


	if (!chartProps.input.type) {
  	maptype = defaultmap;
  } else {
  	maptype = chartProps.input.type;
  }

  if (parseOpts === 'input' || parseOpts === 'receive-model' || parseOpts.updateData) {
  	bySeries = dataBySeries(chartProps.input.raw, chartProps, {
	    type: maptype
	  });

	  dataParsed = bySeries.data;
	  parsedInputEntries = dataParsed.entries;
	  columnNames = dataParsed.columnNames;
	  _computed = {};
  } else {
	  bySeries.series = chartProps.data;
	  bySeries.input = chartProps.input;
	  parsedInputEntries = chartProps.entries;
	  columnNames = chartProps.columns;
	  _computed = chartProps.computedData;
  }

  const valueColumn = columnNames.length === 2 ? columnNames[1] : columnNames[2];
  const firstColumn = columnNames[0];
  const allData = bySeries.series;
  const allValues = [];

  // build the _computed and chartSettings objects
  // this can be condensed into something simpler
  const chartSettings = map(bySeries.series, (dataSeries, i) => {

  	// use new values if there is new input or switching to different map type
  	// otherwise the values are assigned to the last chartProps in the above conditional
  	if (parseOpts === 'input' || parseOpts === 'receive-model' || parseOpts.updateData) {
	  	_computed[i] = {
	    	data : map(dataSeries.values, (d) => {
		      return +d[valueColumn]; })
	    };
  	}

  	merge(allValues,_computed[i].data);

    let settings = chartProps.chartSettings[i] || clone(config.defaultProps.chartProps.chartSettings[0]);
    settings.label = (parseOpts.columnsChanged) ? clone(bySeries.series[i].name) : settings.label || bySeries.series[i].name;

    return settings;
  });

  // Calculate domain and tick values for any scales that exist
  each(_computed, (name, j) => {

    let currScale;

    //use the existing scale config unless it is undefined
    if (chartProps.scale) {
      if (chartProps.scale[j]) currScale = chartProps.scale[j];
      else currScale = clone(config.defaultProps.chartProps.chartSettings[0].scale, true);
    } else {
    	currScale = clone(config.defaultProps.chartProps.chartSettings[0].scale, true);
    }

    /*
    Domain
		*/
		//first, compute full domain for all series
		// based on currScale passed in values or on the full dataset, whichever needed
    assign(currScale, help.computeMapScaleDomain(currScale, allValues, parseOpts));


    /*
    Colors

    */
    // The bubble map always uses one color per group */
    currScale.colors = 1;
    const totalcolors = 1;

    // One more tick than there are legend shapes
    currScale.ticks = totalcolors + 1;
    currScale.colorIndex = chartSettings[j].colorIndex;
    currScale.color = colorScales.scalesMap(currScale.colorIndex)[totalcolors];

    /*
    */
    scale.domain = currScale.domain;
    scale[j] = currScale;
    chartSettings[j].scale = currScale;


    /*
    Legend

    */
    // compute the legend based on the scales built
    const currLegend = {
    	colorValues:colorScales.scalesMap(currScale.colorIndex)[totalcolors],
    	type:currScale.type,
    	label:chartSettings[j].label,
    	prefix:currScale.prefix,
    	suffix:currScale.suffix
    }

    legends[j] = currLegend;
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

  /*
  Schemas

  */
  //
  let schema;

  if (priorData) {
  	if (parseOpts === 'input') {
  		schema = parseMapType.assign_map(firstColumn, allData, maptype);
  	} else {
	    if (!priorSchema) schema = parseMapType.determine_map(firstColumn, allData);
	    else schema = priorSchema;
  	}
  } else {
  	  // if making a map type switch, use the previous map type option
  	if (parseOpts === 'receive-model' && maptype !== defaultmap) {
  		schema = parseMapType.assign_map(firstColumn, allData, maptype);
  	} else {
  	  // if just parsing data or something else, change it.
    	schema = parseMapType.determine_map(firstColumn, allData);
  	}
  }
  // now update the series type
  bySeries.input.type = schema.schema.name;



    /*

    Mobile

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
    computedData: _computed,
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

module.exports = parseBubble;
