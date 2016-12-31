
import React, {PropTypes} from 'react';
import ReactDOM from 'React-dom';
import d3 from 'd3';

// Flux actions
const MapViewActions = require("../../actions/ChartViewActions");

// Color scales and helpers
const colorScales = require('./../../util/colorscales');
const helperCarto = require('../../charts/maps/mb-cartogram/mb-cartogram-helpers');

import {filter, toNumber} from 'lodash';

const force = d3.layout.force()
    .charge(0)
    .gravity(0)
    .size([650, 425]);

let d3Nodes;

const enterNode = (selection, stylings, data) => {

  selection.classed('node', true);

  switch(stylings.type){
    case('grid'):
      helperCarto.enterGrid(selection, stylings, force, data);
      break;
    case('dorling'):
      helperCarto.enterDorling(selection, stylings, force, data);
      break;
    case('demers'):
      helperCarto.enterDemers(selection, stylings, force, data);
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

    const stylings = this.props.chartProps.stylings;

    d3Nodes = d3.select(ReactDOM.findDOMNode(this.refs.graph));

    const theseNodes = d3Nodes.selectAll('.node')
      .data(this.props.nodes, function (node) { return node.shp; })

    theseNodes.enter().append('g').attr('class','node');
    	enterNode(theseNodes, stylings, this.props.nodes);
    theseNodes.exit().remove();

    const d3Node = d3.select(ReactDOM.findDOMNode(this.refs.graph)).selectAll('.node');

    if (stylings.type !== 'grid') {

      force.on("tick", (e, i) => {
        if (i > 200) force.stop();
        return (stylings.type === 'dorling') ?
                helperCarto.updateDorling (e, d3Node, this.props.nodes) :
                helperCarto.updateDemers (e, d3Node, this.props.nodes);
      })
      .resume();

      helperCarto.updateNode(theseNodes);

      force.nodes(this.props.nodes);
      force.start();
    }
  },
  componentDidUpdate:  function(nextProps, nextState) {

  	console.log('did update');
    const stylings = this.props.chartProps.stylings;

    d3Nodes = d3.select(ReactDOM.findDOMNode(this.refs.graph));

    let theseNodes = d3Nodes.selectAll('.node')
      .data(this.props.nodes, function (node) { return node.shp; });

    d3.selectAll('.node').selectAll('*')
      .data(this.props.nodes, function (node) { return node.shp; });

    theseNodes.enter().append('g')
      .attr('class','node');

    theseNodes.exit().remove();

    const d3Node = d3.select(ReactDOM.findDOMNode(this.refs.graph)).selectAll('.node');

    enterNode(d3Node, stylings, this.props.nodes);

    if (stylings.type !== 'grid') {

      (stylings.type === 'dorling') ?
                helperCarto.switchDorling (d3Node, stylings) :
                helperCarto.switchDemers (d3Node, stylings);

      if (stylings.type !== nextProps.stylings.type
          || stylings.showDC !== nextProps.stylings.showDC) {

        force.on("tick", (e, i) => {
          if (i > 200) force.stop();
          return (stylings.type === 'dorling') ?
                  helperCarto.updateDorling (e, d3Node, this.props.nodes) :
                  helperCarto.updateDemers (e, d3Node, this.props.nodes);
        })
        .resume();

        force.nodes(this.props.nodes);
        force.start();

      }
      else force.stop();
    }
    else {
      force.stop();
      helperCarto.switchGrid(d3Node, stylings)
    }
  },
  render: function() {

  	let topTranslation = this.props.displayConfig.margin.maptop;

    if (this.props.metadata.subtitle) {
    	if (this.props.metadata.subtitle.length > 0) {
    		topTranslation += 20;
    	}
    }

    const translation = `translate(${this.props.displayConfig.margin.left},${topTranslation})`;

    return (
      <g transform={translation}
        className='cartogram-map-render'
        ref='graph'
      />
    );
  }
});

module.exports = PolygonCollection
