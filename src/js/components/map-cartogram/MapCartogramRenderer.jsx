
import React, {PropTypes} from 'react';
import ReactDOM from 'React-dom';
import d3 from 'd3';

// Flux actions
const MapViewActions = require("../../actions/VisualViewActions");

// Color scales and helpers
const colorScales = require('./../../util/colorscales');
const helperCarto = require('../../charts/maps/mb-cartogram/mb-cartogram-helpers');

import {filter, toNumber} from 'lodash';

const forceDesktop = d3.layout.force()
    .charge(0)
    .gravity(0)
    .size([608, 308]);

const forceMobile = d3.layout.force()
    .charge(0)
    .gravity(0)
    .size([372, 244]);

let d3Nodes;

const enterNode = (selection, stylings, data, typeCast, isMobile, force) => {

  selection.classed('node', true);

  switch(stylings[typeCast]) {
    case('grid'):
      helperCarto.enterGrid(selection, stylings, force, data, isMobile);
      break;
    case('dorling'):
      helperCarto.enterDorling(selection, stylings, force, data, isMobile);
      break;
    case('demers'):
      helperCarto.enterDemers(selection, stylings, force, data, isMobile);
      break;
  }
};

const PolygonCollection = React.createClass({

  propTypes: {
    polygonClass: React.PropTypes.string,
    onClick: React.PropTypes.func,
    nodes: React.PropTypes.array,
    chartProps: React.PropTypes.object.isRequired
  },
  componentDidMount: function() {

  	const props = this.props;
    const stylings = props.chartProps.stylings;
    const typeCast = props.schemaName;

    d3Nodes = d3.select(ReactDOM.findDOMNode(this.refs.graph));

    const theseNodes = d3Nodes.selectAll('.node')
      .data(props.nodes, function (node) { return node.shp; })

    theseNodes.enter().append('g').attr('class','node');

    const force = (props.isSmall) ? forceMobile : forceDesktop;

    enterNode(theseNodes, stylings, props.nodes, typeCast, props.isSmall, force);

    theseNodes.exit().remove();

    const d3Node = d3.select(ReactDOM.findDOMNode(this.refs.graph)).selectAll('.node');

    if (stylings[typeCast] !== 'grid') {

      force.on("tick", (e, i) => {
        if (i > 200) force.stop();
        return (stylings[typeCast] === 'dorling') ?
                helperCarto.updateDorling (e, d3Node, props.nodes) :
                helperCarto.updateDemers (e, d3Node, props.nodes);
      })
      .resume();

      helperCarto.updateNode(theseNodes);

      force.nodes(this.props.nodes);
      force.start();
    }
  },
  _testDataChange(pastDataset, newDataset) {
  	let testDatasetChange = false;

  	pastDataset.forEach(function(d, i) {
  		if (!newDataset[i]) {
  			testDatasetChange = true;
  		} else {
  			if (d.values.length !== newDataset[i].values.length) testDatasetChange = true;
  		}
  	});

  	return testDatasetChange;
  },
  componentDidUpdate: function() {
  },
  componentWillUpdate: function(nextProps, nextState) {

  	const props = this.props;

    const stylings = nextProps.chartProps.stylings;
    const typeCast = nextProps.schemaName;
    const nodes = nextProps.nodes;

    const force = (nextProps.isSmall) ? forceMobile : forceDesktop;

    d3Nodes = d3.select(ReactDOM.findDOMNode(this.refs.graph));

    let theseNodes = d3Nodes.selectAll('.node')
	      .data(nodes, function (node) { return node.shp; });

    theseNodes.enter().append('g')
      .attr('class','node');

    theseNodes.exit().remove();

    const d3Node = d3.select(ReactDOM.findDOMNode(this.refs.graph)).selectAll('.node');

    enterNode(d3Node, stylings, nodes, typeCast, nextProps.isSmall, force);

    if (stylings[typeCast] !== 'grid') {
    	//update the dorling or demers
      /*(stylings[typeCast] === 'dorling') ?
          helperCarto.switchDorling (d3Node, stylings, nextProps.isSmall) :
          helperCarto.switchDemers (d3Node, stylings, nextProps.isSmall);*/

      // Only tick if making a large change to the layout
      if (props.cartogramType !== nextProps.cartogramType
          || props.chartProps.stylings.showDC !== stylings.showDC
          || nextProps.schemaType !== props.schemaType
          || nextProps.radiusVal !== props.radiusVal
          || this._testDataChange(props.chartProps.data, nextProps.chartProps.data)) {

        force.on("tick", (e, i) => {
          if (i > 200) force.stop();
          return (stylings[typeCast] === 'dorling') ?
                  helperCarto.updateDorling (e, d3Node, nodes) :
                  helperCarto.updateDemers (e, d3Node, nodes);
        }).resume();

        force.nodes(nodes);
        force.start();
      } else {
      	force.stop();
      }
    } else {
    	//update or swap out for grid
	  	 force.stop();
	     helperCarto.switchGrid(d3Node, stylings, nextProps.isSmall);
    }
  },
  _topTranslation: function(topTranslation) {
  	if (this.props.metadata.subtitle.length > 0) {
  		topTranslation += this.props.displayConfig.margin.subtitle;
  	}
    return topTranslation;
  },
  _getTranslation: function(chartProps) {
  	const props = this.props;
  	const withMobile = (props.isSmall) ? props.displayConfig.margin.mobile.extraMapMarginTop : 0;
    const topTranslation = (Object.keys(chartProps.legend).length === 1) ?
    				withMobile + props.displayConfig.margin.maptop + props.displayConfig.margin.legendsOneRow
    			: props.displayConfig.margin.maptopMultiple;

    return `translate(0,${this._topTranslation(topTranslation)})`;
  },
  render: function() {

  	const props = this.props;
  	//const topTranslation = this._topTranslation(props.displayConfig.margin.maptop);
    const translation = this._getTranslation(props.chartProps);

    const polygonCollection = props.polygonCollection;

    console.log(polygonCollection, 'polygonCollection');

    return (
      <g transform={translation}
      	clipPath="url(#clip)"
        className={'cartogram-map-render ' + props.isSmall}
        ref='graph'
      >{polygonCollection}</g>
    );
  }
});

module.exports = PolygonCollection
