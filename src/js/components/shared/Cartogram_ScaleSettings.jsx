import React, {PropTypes} from 'React';
import {clone, cloneDeep} from 'lodash';

const ScaleReset = require("./ScaleReset.jsx");

/* Chartbuilder UI components */

import {ButtonGroup, TextInput, LabelledTangle, AlertGroup} from 'chartbuilder-ui';

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

    let scale = cloneDeep(this.props.scale, true);

    if(k != "precision") {
      scale[this.props.index].precision = 0;
    }

    scale[this.props.index][k] = v;
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

    const currScale = this.props.scale[this.props.index];
    const errors = this._renderErrors();

    let prefixSuffix = false;

    if (this.props.stylings.showLegendTicks) {

      prefixSuffix = [];
      prefixSuffix.push(<TextInput
          className="scale-option"
          key="scale-prefix"
          onChange={this._handleScaleUpdate.bind(null, "prefix")}
          value={currScale.prefix}
          placeholder="Prefix"
        />);

      prefixSuffix.push(<TextInput
          id="suffix"
          key="scale-suffix"
          className="scale-option"
          onChange={this._handleScaleUpdate.bind(null, "suffix")}
          value={currScale.suffix}
          placeholder="Suffix"
        />);
    }

    return (
      <div className={this.props.className}>
        {prefixSuffix}
        {errors}
      </div>
    );
  }
});

module.exports = Map_ScaleSettings;
