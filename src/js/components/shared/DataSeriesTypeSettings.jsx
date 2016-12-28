
import React, {PropTypes} from 'react';
import {ButtonGroup} from 'chartbuilder-ui';

const dataTypeOptions = [
	{ title: "Dates", content: "Dates", value: "date" },
	{ title: "Names", content: "Names", value: "ordinal" },
	{ title: "Numbers", content: "Numbers", value: "numeric" }
];

const DataSeriesTypeSettings = React.createClass({
	propTypes: {
		onUpdate: PropTypes.func,
		chartProps: PropTypes.object
	},

	_handleSeriesTypeUpdate: function(ix,k,v) {
		const chartProps = this.props.chartProps;
		chartProps.input.type = v;
		this.props.onUpdate(chartProps.input);
	},

	render: function() {
		const chartProps = this.props.chartProps;

		if (chartProps.visualType === 'chart') {

			return (
				<div className="section datatypesection">
						<h3>Your first column is</h3>
						<ButtonGroup
							className="button-group-wrapper"
							onClick={this._handleSeriesTypeUpdate.bind(null, this.props.chartProps, "dataType")}
							buttons={dataTypeOptions}
							value={
								chartProps.input.type ? chartProps.input.type : (
								chartProps.scale.hasDate ? "date" : (
								chartProps.scale.isNumeric ? "numeric" :
									"ordinal"
								))
							}
						/>
					</div>
				);
		}
		else {
			return(
				<div></div>
				);
		}
	}
});

module.exports = DataSeriesTypeSettings;
