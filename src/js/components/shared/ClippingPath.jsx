
import React, {PropTypes} from 'react';
import ReactDom from 'react-dom';
import update from 'react-addons-update';

/**
 * Render a
 * @instance
 * @memberof RendererWrapper
 */
class ClippingPath extends React.Component {

	constructor(props) {
    super(props);

    this._config = {
		}

    this.state = {
		};
  }

	render () {
		//
		const props = this.props;
		const margin = props.displayConfig.margin;
		const chartAreaDimensions = props.chartAreaDimensions;

		const translate = {
			top: margin.cliptop,
		};

		return (
			<clipPath id="clip">
				<rect
					x={0}
					y={translate.top}
					width={chartAreaDimensions.width}
					height={chartAreaDimensions.height}
				/>
			</clipPath>

		);
	}
};


module.exports = ClippingPath;
