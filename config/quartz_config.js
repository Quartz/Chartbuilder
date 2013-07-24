ChartBuilder.allColors = ["ff4cf4","ffb3ff","e69ce6","cc87cc","b373b3","995f99","804c80","665266", //purples
			"158eff","99cdff","9cc2e6","87abcc","7394b3","5f7d99","466780","525c66", //blues
			"000000","f2f2f2","e6e6e6","cccccc","b3b3b3","999999","808080","666666", //grays
			"15ff67","b3ffcc","9ce6b5","87cc9e","73b389","5f9973","4c805d","526659", //greens
			"FFFF03","fbffb3","e2e69c","c9cc87","b0b373","96995F","7e804c","656652", //yellows
			"FF4200","ffb899","e6b39c","cc9c87","b38673","99715f","805c4c","665852", //oranges
			"FF005C","ff99b9","e69cb3","cc879d","b37387","995f71","804c5d","665258"  //reds
			]

chartConfig.creditline = "Quartz | qz.com"
chartConfig.colors = ["#ff4cf4","#ffb3ff","#e69ce6","#cc87cc","#b373b3","#995f99","#804c80","#665266","#158eff","#99cdff","#9cc2e6","#87abcc","#7394b3","#5f7d99","#466780","#525c66"]

Gneiss.customYAxisFormat = function(axisGroup,i) {
	var g = this.g
	axisGroup.selectAll("g")
		.each(function(d,j) {
			//create an object to store axisItem info
			var axisItem = {}
			
			//store the position of the axisItem
			//(figure it out by parsing the transfrom attribute)
			axisItem.y = parseFloat(d3.select(this)
				.attr("transform")
					.split(")")[0]
						.split(",")[1]
				)
			
			//store the text element of the axisItem
			//align the text right position it on top of the line
			axisItem.text = d3.select(this).select("text")
				.attr("text-anchor",i==0?"end":"start")
				.attr("fill",i==0?"#666666":g.yAxis[i].color)
				.attr("x",function(){var elemx = Number(d3.select(this).attr("x")); return i==0?elemx:elemx+4})
				.attr("y",-9)
			})
	this.g = g;
}