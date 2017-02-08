import React, {PropTypes} from 'React';
import {clone, cloneDeep} from 'lodash';

const ScaleReset = require("./ScaleReset.jsx");

/* Chartbuilder UI components */
import {ButtonGroup, TextInput, LabelledTangle, AlertGroup} from 'chartbuilder-ui';
/* Available XY chart type options */


/**
 * Y scale settings for XY charts. Used in both XY and chart grid, and most
 * likely for future charts as well
 * @instance
 * @memberof editors
 */
const Map_ScaleSettings = React.createClass({
  propTypes: {
    className: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    onReset: PropTypes.func,
    onUpdate: PropTypes.func.isRequired,
    scale: PropTypes.object,
    stylings: PropTypes.object,
    stepNumber: PropTypes.string,
    titleOverride: PropTypes.string,
    errors: PropTypes.array
  },
  _handleScaleUpdate: function(k, v) {

    const scale = cloneDeep(this.props.scale, true);

    /*if(k != "precision") {
      scale[this.props.index].precision = 0;
    }*/

    scale[this.props.index][k] = v;
    this.props.onUpdate(scale);
  },
  _handleThresholdUpdate: function(k, v) {
    const scale = cloneDeep(this.props.scale, true);

    scale[this.props.index][k.key][k.iter] = v;
    this.props.onUpdate(scale);
  },
  _handleDomainUpdate: function(k, v) {
    const scale = cloneDeep(this.props.scale,true);

    if (k == "min") {
      scale[this.props.index].domain[0] = v;
    } else if (k == "max") {
      scale[this.props.index].domain[1] = v;
    }

    this.props.onUpdate(scale);
  },
  _renderErrors: function() {
    if (!this.props.errors) {
      return null;
    } else if (this.props.errors.length === 0) {
      return null;
    } else {
      return (
        <div className="error-display">
          <AlertGroup alerts={this.props.errors} />
        </div>
      );
    }
  },
  render: function() {

    const tangleStep = 1;
    let prefixSuffix = false;

    const currScale = this.props.scale[this.props.index];
    const errors = this._renderErrors();

    const thresholds = [];
    let thresholdsLabel = [];

    if (this.props.stylings.showLegendTicks) {

      prefixSuffix = [];
      prefixSuffix.push(<TextInput
          key="scale-prefix"
          className="scale-option"
          onChange={this._handleScaleUpdate.bind(null, "prefix")}
          value={currScale.prefix}
          placeholder="Prefix" />
       );

      prefixSuffix.push(
        <TextInput
          id="suffix"
          key="scale-suffix"
          className="scale-option"
          onChange={this._handleScaleUpdate.bind(null, "suffix")}
          value={currScale.suffix}
          placeholder="Suffix" />
       );
    }

    const range = Math.abs(currScale.domain[1] - currScale.domain[0]);

    /*if (range > 10) {
      const numDigits = range.toString().length;
    }*/
    // add threshold field input
    if (currScale.type === 'threshold') {

      thresholdsLabel.push(<div className="inline-label">Define thresholds</div>);

      for (let i = 0; i < currScale.tickValues.length; i++) {
      	let thisTick = currScale.tickValues[i];
        let min = currScale.tickValues[i - 1];
        let max;
        let thresholdValue = thisTick;

        if ((i + 1) === currScale.tickValues.length) {
          max = thisTick + 2;
        } else if (i === 0) {
          thresholdsLabel = 'Threshold scales';
          max = currScale.tickValues[1];
        } else {
          max = currScale.tickValues[i + 1];
        }

        const thresholdIntent = { key: 'tickValues', iter: i }

        thresholds.push(<LabelledTangle
          tangleClass="threshold-option tangle-input"
          onChange={this._handleThresholdUpdate.bind(this, thresholdIntent)}
          onInput={this._handleThresholdUpdate.bind(this, thresholdIntent)}
          step={tangleStep}
          min={min}
          max={max}
          key={i + '_threshold'}
          value={thresholdValue} />
        );
      }
    } else {
    	thresholds.push(
	    	<LabelledTangle
	        label="Minimum"
	        labelClass="editor-label"
	        step={tangleStep}
	        tangleClass="scale-option tangle-input"
	        onChange={this._handleDomainUpdate.bind(null, "min")}
	        onInput={this._handleDomainUpdate.bind(null, "min")}
	        value={currScale.domain[0]}
	      />
	     );
	     thresholds.push(
	      <LabelledTangle
	        label="Maximum"
	        step={tangleStep}
	        labelClass="editor-label"
	        tangleClass="scale-option tangle-input"
	        onChange={this._handleDomainUpdate.bind(null, "max")}
	        onInput={this._handleDomainUpdate.bind(null, "max")}
	        value={currScale.domain[1]}
	      />
	     );
	     thresholds.push(
	      <LabelledTangle
	        label="Precision"
	        step={tangleStep}
	        labelClass="editor-label"
	        tangleClass="scale-option tangle-input"
	        onChange={this._handleScaleUpdate.bind(null, "precision")}
	        onInput={this._handleScaleUpdate.bind(null, "precision")}
	        value={currScale.precision}
	      />
	     );
    }

    return (
      <div className={this.props.className}>
        {prefixSuffix}
        <div className="scale-tangle-inputs" key={'tangle-scale'}>
          <LabelledTangle
            label="Color breaks"
            labelClass="editor-label"
            tangleClass="scale-option tangle-input"
            onChange={this._handleScaleUpdate.bind(null, "colors")}
            onInput={this._handleScaleUpdate.bind(null, "colors")}
            step={tangleStep}
            min={1}
            max={6}
            value={currScale.colors}
          />
	        {thresholdsLabel}
	        {thresholds}
        </div>
        <div className="section typesection"
            key={'type-options'}>
          <ButtonGroup
            className="button-group-wrapper"
            onClick={this._handleScaleUpdate.bind(null, "type")}
            buttons={this.props.typeOptions}
            type={currScale.type}
            value={currScale.type}
          />
        </div>
        {errors}
      </div>
    );
  }
});

module.exports = Map_ScaleSettings;
