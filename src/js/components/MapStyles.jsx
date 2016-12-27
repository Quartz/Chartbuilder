import React, {Component, PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import {clone, map} from 'lodash';
// Chartbuilder UI components
import chartbuilderUI, {ButtonGroup, TextArea, Toggle, LabelledTangle} from "chartbuilder-ui";

// Flux stores
const MapViewActions = require("../actions/ChartViewActions");

/*cornersTangle = [];
      cornersTangle.push(<h3>Style corners</h3>);
      cornersTangle.push(
              <LabelledTangle
                tangleClass="tangle-input"
                onChange={this._handleStylingsUpdate.bind(null, 'corners')}
                onInput={this._handleStylingsUpdate.bind(null, 'corners')}
                step={1}
                min={0}
                max={20}
                corners={this.props.stylings.corners}
                value={this.props.stylings.corners}
              />);*/

const map_strokes = [
  {
    title: "",
    content: "Darker Grey",
    value: "#333"
  },
  {
    title: "",
    content: "Dark Grey",
    value: "#666"
  },
  {
    title: "",
    content: "Grey",
    value: "#aaa"
  },
  {
    title: "",
    content: "Lightest Grey",
    value: "#eee"
  },
  {
    title: "",
    content: "White",
    value: "#fff"
  }
];

const map_type = [
  {
    title: "",
    content: "Grid",
    value: "grid"
  },
  {
    title: "",
    content: "Demers",
    value: "demers"
  },
  {
    title: "",
    content: "Dorling",
    value: "dorling"
  }
];

/**
 *
 */
const MapStyles = React.createClass({

  propTypes: {
    stepNumber: PropTypes.string
  },
  _handleStylingsUpdate: function(k, v) {
    MapViewActions.updateStylings(k, v);
  },
  render: function() {

    let cartogramOption = false;
    //let cornersTangle = false;
    let shapeSize = false;
    let valuesOption = false;
    let dcOption = false;
    let stateNames = false;
    let legendTextOption = false;
    let legendTicks = false;

    console.log(this.props,'props');

    const stylings = this.props.chartProps.stylings;

    if (this.props.metadata.chartType !== 'mapbubble') {
      legendTicks = (<div className="toggle">
          <Toggle
            key={"legend_ticks_toggle_" + this.props.metadata.chartType}
            className="button-group-wrapper"
            label="Legend ticks"
            onToggle={this._handleStylingsUpdate.bind(null, "showLegendTicks")}
            toggled={stylings.showLegendTicks}
          /></div>);

    } else {
      legendTextOption = (<div className="legend-text"><h3>Extra legend text</h3>
          <TextArea
            key="legend_text_extra"
            onChange={this._handleStylingsUpdate.bind(null, "legendText")}
            value={stylings.legendText}
            isRequired={true}
          /></div>)

        shapeSize = (<div className="toggle">
              <LabelledTangle
                tangleClass="tangle-input"
                onChange={this._handleStylingsUpdate.bind(null, 'radiusVal')}
                onInput={this._handleStylingsUpdate.bind(null, 'radiusVal')}
                step={1}
                label="Max shape"
                key="max_shape"
                min={1}
                max={60}
                value={this.props.stylings.radiusVal}
              /></div>);
    }

    if (this.props.metadata.chartType === 'mapcartogram') {

      cartogramOption = [];
      cartogramOption.push(<h3>Cartogram Type</h3>);
      cartogramOption.push(<ButtonGroup
          className="button-group-wrapper"
          buttons={map_type}
          key="cartogram_type"
          onClick={this._handleStylingsUpdate.bind(null, "type")}
          value={stylings.type}
        />);



      if (this.props.stylings.type === 'grid') {
        valuesOption = (<div className="toggle">
          <Toggle
            className="button-group-wrapper"
            key="show_values"
            label="Show Values"
            onToggle={this._handleStylingsUpdate.bind(null, "showValuesLabels")}
            toggled={stylings.showValuesLabels}
          /></div>);
      }
      else {
        legendTextOption = (<div className="legend-text"><h3>Extra legend text</h3>
          <TextArea
            label="Extra legend text"
            onChange={this._handleStylingsUpdate.bind(null, "legendText")}
            value={stylings.legendText}
            isRequired={true}
            key="legend_text_extra"
          /></div>)


      shapeSize = (<div className="toggle">
              <LabelledTangle
                tangleClass="tangle-input"
                onChange={this._handleStylingsUpdate.bind(null, 'radiusVal')}
                onInput={this._handleStylingsUpdate.bind(null, 'radiusVal')}
                step={1}
                label="Max shape"
                min={1}
                max={60}
                key="radius_val"
                value={this.props.stylings.radiusVal}
              /></div>);
      }

      dcOption = (<div className="toggle"><Toggle
          className="button-group-wrapper"
          label="DC Y/N"
          onToggle={this._handleStylingsUpdate.bind(null, "showDC")}
          toggled={stylings.showDC}
          key="show_hide_dc"
        /></div>);
    }
    else if (this.props.metadata.chartType === 'map50') {

      stateNames = (<div className="toggle">
        <Toggle
          label="State names"
          className="button-group-wrapper"
          onToggle={this._handleStylingsUpdate.bind(null, "showStateLabels")}
          toggled={stylings.showStateLabels}
          key="show_state_names"
        /></div>);

    }

    return (
      <div className="editor-options">
        <h2>
          <span className="step-number">{this.props.stepNumber}</span>
          <span>Make additional stylings</span>
        </h2>
        	{cartogramOption}
        <h3>
          Color shape outlines
        </h3>
        <ButtonGroup
          className="button-group-wrapper"
          buttons={map_strokes}
          onClick={this._handleStylingsUpdate.bind(null, "stroke")}
          value={stylings.stroke}
          key="choose_strokes"
        />
        <div className="stylings-toggle-inputs"
          key="stylings_inputs">
          {stateNames}
          {legendTicks}
          {valuesOption}
          {shapeSize}
          {dcOption}
        </div>
        {legendTextOption}
      </div>
    );
  }
});

module.exports = MapStyles;
