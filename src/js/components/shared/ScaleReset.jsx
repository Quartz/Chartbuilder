import React, {PropTypes} from 'react';
const cx = require("classnames");
import {clone} from 'lodash';

import {Button} from 'chartbuilder-ui';

/**
 * ### Button to delete a scale, resetting it to default settings
 * @property {object} scale - Current chart's scale object
 * @property {string} scaleId - Identifier for the scale we want to delete
 * @property {function} onUpdate - Callback to send reset scale back to parent
 * @instance
 * @memberof editors
 */
class ScaleReset extends React.Component {

	constructor (props) {
		super(props);

		this.state = {
			customScale: false
		}
		this._handleScaleReset = this._handleScaleReset.bind(this);
	}
	// Delete scale width given `id` and update the parent
	_handleScaleReset () {
		const scale = clone(this.props.scale, true);
		delete scale[this.props.scaleId];
		this.setState({ customScale: false });
		this.props.onUpdate(scale);
	}

	// Only enable button if the scale has been customized
	componentWillReceiveProps (nextProps) {
		const scale = nextProps.scale[nextProps.scaleId];
		if (scale.custom) {
			this.setState({ customScale: true });
		}
	}

	render () {
		const className = cx({
			"label-reset": true,
			"active": this.state.customScale
		});

		return (
			<Button
				onClick={this._handleScaleReset}
				className={className}
				text={"Reset scale"}
			/>
		);
	}
};

ScaleReset.propTypes = {
	scale: PropTypes.object.isRequired,
	scaleId: PropTypes.string.isRequired,
	onUpdate: PropTypes.func.isRequired
};

module.exports = ScaleReset;
