

//

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

		return (
			<clippPath>
			<rect
						x='0.8em'
						y='0.6em'
						width={620}
						height={360}
					/>
				</clippPath>

		);
	}
};


module.exports = ClippingPath;
