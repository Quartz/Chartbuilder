/**
 * Render a
 * @instance
 * @memberof RendererWrapper
 */
function ClippingPath (props) {
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
};


module.exports = ClippingPath;
