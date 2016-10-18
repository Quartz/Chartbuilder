/**
* ### Chart config
* Set up a configuration object for a given chart type
* @name ChartConfig
* @class
* @property {object} settings
* @property {string} settings.displayName - How this type's name should be displayed in the interface
* @property {function} settings.parser - Func to parse input for this chart type
* @property {function} settings.calculateDimensions - Func to calculate dimensions of this chart type
* @property {object} settings.display - Static display config for this chart type, such as positioning and spacing
* @property {object} settings.defaultProps - Defaults for dynamic properties that will be used to draw the chart
*/

function ChartConfig(settings) {
	this.displayName = settings.displayName;

	/**
	 * Func that parses input and settings to return newly parsed `chartProps`
	 * @param {object} config - The parsed configuration for this chart type
	 * @param {object} _chartProps - Previous `chartProps`
	 * @param {function} callback - Function to pass new `chartProps` to upon parse completion
	 * @param {object} parseOpts - Additional parse options
	 *
	 * @return {Object} chartProps - Updated `chartProps`
	 * @memberof ChartConfig
	 * @instance
	 */
	this.parser = settings.parser;

	/**
	 * Func that returns an object of `{width: N, height: N}` that will determine
	 * dimensions of a chart
	 * @param {number} width - Width of container or area that will contain the chart
	 * @param {object} model - The `chartProps` and `metadata` of the current chart
	 * @param {object} chartConfig - Parsed chart configuration
	 * @param {boolean} enableResponsive - Should we make dimensions relative to
	 * container or use preset sizes
	 * @param {number} extraHeight - Additional height we need to account for, eg
	 * from wrapped text at the footer
	 *
	 * @return {Object} dimensions - Dimensions returned by calculation
	 * @return {number} dimensions.width
	 * @return {number} dimension.height
	 * @memberof ChartConfig
	 * @instance
	 */
	this.calculateDimensions = settings.calculateDimensions;
	this.display = settings.display;
	this.defaultProps = settings.defaultProps;
}

module.exports = ChartConfig;
