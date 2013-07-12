ChartBuilder.inlineAllStyles = function() {
	
	d3.selectAll("#interactiveContent svg .axis line")
		.style("fill","none")
		.style("shape-rendering","crispEdges")
		
	d3.selectAll("#interactiveContent svg .axis line#zeroLine")
			.style("stroke", "#ff4cf4");
			
	d3.selectAll("#interactiveContent svg #xAxis line")
		.style("stroke","#e6e6e6")
		
	d3.selectAll("#interactiveContent svg #xAxis text")
		.style("fill","#666666")

	d3.selectAll("#interactiveContent svg .axis path")
		.style("stroke", "none")
		.style("fill","none");
		
	d3.selectAll("#interactiveContent svg .axis text")
			.style("font-family",'Olsen, Helvetica, Arial, sans-serif')
			.style("font-size", "16px")
	
	d3.selectAll("#interactiveContent svg .legendItem text")
			.style("font-family",'Olsen, Helvetica, Arial, sans-serif')
			.style("font-size:", "16px")

	d3.selectAll("#interactiveContent svg text.metaText")
		.style("font-family",'Olsen, Helvetica, Arial, sans-serif')
		.style("font-size","12px")
		.style("text-rendering","optimizeLegibility")
		.style("fill","#99999")
	
	d3.selectAll("#interactiveContent svg text.barLabel, #interactiveContent svg text.bargridLabel")
		.style("font-family",'Olsen, Helvetica, Arial, sans-serif')
		.style("font-size", "16px")
		
	d3.selectAll("#titleLine")
		.style("font-family",'Olsen, Helvetica, Arial, sans-serif')
		.style("font-size", "16px")
		.style("fill","#666666")
}
ChartBuilder.allColors = ["fecd08","b39602","dadada","0093d3","226eaa","72bf44","336b25"]

chartConfig.creditline = "Defense One | defenseone.com"
chartConfig.colors = ["#fecd08","#b39602","#dadada","#0093d3","#226eaa","#72bf44","#336b25"]