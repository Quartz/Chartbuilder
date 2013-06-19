cb = {
	config: {
		padding: {
			left: 10,
			right: 10,
			top: 50,
			bottom: 40
		},
		zeroLineColor: "#ff4cf4",
		dateseries: false,
		numYaxisTicks: 5,
		dualAxis: false,
		rightAxisPrefix: "",
		rightAxisSuffix: "",
		rightAxisTickValues: [],
		rightAxisMax: null,
		rightAxisMin: null,
		leftAxisPrefix: "",
		leftAxisSuffix: "",
		leftAxisTickValues: [],
		dataLine: "Data Compiled by Quartz",
		sourceLine: "Quartz | qz.com",
		dateParser: function(d){return d},
		longMonths: ["January","February","March","April","May","June","July","August","September","October","November","December"],
		shortMonths: ["Jan.","Feb.","March","April","May","June","July","Aug.","Sept.","Oct.","Nov.","Dec."]
	},
	temp: {},
	colors: ["#ff4cf4","#ffb3ff","#e69ce6","#cc87cc","#b373b3","#995f99","#804c80","#665266","#158eff","#99cdff","#9cc2e6","#87abcc","#7394b3","#5f7d99","#466780","#525c66"],
	dateParsers: {
		"mmddyyyy": function(d) {return [d.getMonth()+1,d.getDate(),d.getFullYear()].join("/");},
		"mmdd": function(d) {return [d.getMonth()+1,d.getDate()].join("/")},
		"yy": function(d) {return "’"+String(d.getFullYear()).split("").splice(2,2).join("")},
		"yyyy": function(d) {return d.getFullYear()},
		"MM": function(d) {return cb.config.longMonths[d.getMonth()]},
		"M": function(d) {return cb.config.shortMonths[d.getMonth()]}
	},
	series: [
		
	],
	chart:{},
	init: function() {
		$("#currentSeries").html("")
		$("#chartContainer").html("")
		
		//define chart area svg
		this.chart.svg = d3.select("#chartContainer")
			.append("svg")
			.attr("width","100%")
			.attr("height","100%");
		//cache chart area size
		this.chart.w = parseInt(this.chart.svg.style("width").split("p")[0])
		this.chart.h = parseInt(this.chart.svg.style("height").split("p")[0])
		
		//get right y axis extents
		var rExtent = this.extentAll(this.series,"right")
		if(this.config.rightAxisMax !== null) {
			rExtent[1] = this.config.rightAxisMax
		}
		
		if(this.config.rightAxisMin !== null) {
			rExtent[0] = this.config.rightAxisMin
		}
		//set right y scale
		this.chart.rightScale = d3.scale.linear()
			.domain(
				rExtent.reverse()
				//d3.extent(this.series[0].data).reverse()
				)
			.range([
				this.config.padding.bottom,
				this.chart.h-this.config.padding.top
				]);
		
		//get left axis extents	
		var lExtent = this.extentAll(this.series,"left")
		if(this.config.leftAxisMax !== null) {
			lExtent[1] = this.config.leftAxisMax
		}

		if(this.config.leftAxisMin !== null) {
			lExtent[0] = this.config.leftAxisMin
		}
		//set left y scale
		this.chart.leftScale = d3.scale.linear()
			.domain(
				lExtent.reverse()
				//d3.extent(this.series[0].data).reverse()
				)
			.range([
				this.config.padding.bottom,
				this.chart.h-this.config.padding.top
				]);
				
				
		//set x scale
		//test if there is a date column
		if((/date/gi).test(this.series[0].name.toLowerCase())) {			
			//use a date x scale if the series is named date
			this.chart.xScale = d3.time.scale()
				.domain(
					d3.extent(this.series[0].data)
				)
			
		}
		else {
			//use a i based x scale if there is no date series
			this.chart.xScale = d3.scale.linear()
				.domain([
					0,
					this.series[0].data.length-1
				])
		}
		
		this.chart.xScale.range([
			this.config.padding.left,
			this.chart.w - this.config.padding.right,
			])
				
		//define right y axis
		this.chart.yAxisRight = d3.svg.axis()
			.scale(this.chart.rightScale)
			.orient("right")
			.ticks(this.config.numYaxisTicks)
			.tickValues(this.config.rightAxisTickValues)
			.tickFormat(function(d,i){return d})
			.tickSize(this.chart.w-this.config.padding.left-this.config.padding.right)
			
		//insert right y axis
		this.chart.svg.append("g")
			.attr("class","axis")
			.attr("id","axisRight")
			.attr("transform","translate(" + this.config.padding.left + ",0)")
			.call(this.chart.yAxisRight)
			
		//add preffix and suffix to top most label
		//position labels ontop of lines
		//color zero line purple
		this.temp.minY = 10000000;
		this.topLab
		var axisGs = d3.selectAll("#axisRight").selectAll("g")
			.each(function(d,i) {
				cb.temp.labY = parseFloat(d3.select(this).attr("transform").split(")")[0].split(",")[1])
				var lab = d3.select(this).select("text")
					.attr("text-anchor","end")
					.attr("y",-8)
					
				var line = d3.select(this).select("line")
				
				if(lab.text() == "0") {
					line.attr("id","zeroLine")
						.attr("stroke",cb.config.zeroLineColor)
				}
				
				if(cb.temp.labY < cb.temp.minY) {
					cb.topLab = lab
					cb.temp.minY = cb.temp.labY
				}
			})
		//find top most index
		//cb.topLab.text(this.config.rightAxisPrefix + cb.topLab.text() + this.config.rightAxisSuffix)
		
		
		//define left y axis
		this.chart.yAxisLeft = d3.svg.axis()
			.scale(this.chart.leftScale)
			.orient("left")
			.ticks(this.config.numYaxisTicks)
			.tickValues(this.config.leftAxisTickValues)
			.tickFormat(function(d,i){return d})
			.tickSize(0)

		//insert left y axis
		this.chart.svg.append("g")
			.attr("class","axis")
			.attr("id","axisLeft")
			.attr("transform","translate(" + this.config.padding.left + ",0)")
			.call(this.chart.yAxisLeft)
		
		
		
		
		
		
		
			
		//define x axis
		this.chart.xAxis = d3.svg.axis()
			.scale(this.chart.xScale)
			.orient("bottom")
			
		if(this.config.dateseries) {
			this.chart.xAxis.tickFormat(this.config.dateParser)
		}
		
		//insert x axis
		this.chart.svg.append("g")
			.attr("class","axis")
			.attr("id","xAxis")
			.call(this.chart.xAxis)
			.attr("transform","translate(0,"+(this.chart.h-this.config.padding.top+5)+")")
			
		if(this.config.dateseries) {
			this.chart.svg.selectAll("#xAxis").selectAll('text')
				    .attr('text-anchor', "left");
		}
		
		//create line makers
		this.chart.rightAxisLine = d3.svg.line()
			.y(function(d){return cb.chart.rightScale(d)})
			
		if(this.config.dateseries) {
			//use date series
			this.chart.rightAxisLine.x(function(d,i){return cb.chart.xScale(cb.series[0].data[i])})
		}
		else {
			//use i position
			this.chart.rightAxisLine.x(function(d,i){return cb.chart.xScale(i)})
		}
		
		//if there are two axis create the left axis line maker
		if(this.config.dualAxis) {
			this.chart.leftAxisLine = d3.svg.line()
				.y(function(d){return cb.chart.rightScale(d)})
				
			if(this.config.dateseries) {
				//use date series
				this.chart.leftAxisLine.x(function(d,i){return cb.chart.xScale(cb.series[0].data[i])})
			}
			else {
				//use i position
				this.chart.leftAxisLine.x(function(d,i){return cb.chart.xScale(i)})
			}
		}
			
		//append line group	
		this.chart.rightAxisLineGroup = this.chart.svg.append("g")
			.attr("id","lineGroup")
		
		//append legend Group
		this.chart.legend = this.chart.svg.append("g")
			.attr("id","legendGroup")
			
			
		//append lines and legend Items to chart  
		//add controls to options
		var legItemX = 0;
		var legItemY = 16;
		var legItem, legText, legColor, lineMaker;
		for (var i=0; i < this.series.length; i++) {
			if(this.config.dateseries && i==0) {
				continue;
			}
			legColor = this.config.dateseries ? this.colors[i-1] : this.colors[i];
			lineMaker = this.series[i].axis == "left" ? this.chart.leftAxisLine : this.chart.rightAxisLine;
			
			this.chart.rightAxisLineGroup.append("path")
				.attr("d",lineMaker(this.series[i].data))
				.attr("class","chartLine")
				.attr("stroke",legColor)
			
			//create legend item group	
			legItem = this.chart.legend.append("g")
				.attr("transform","translate("+legItemX+","+legItemY+")")
				.attr("class","legendItem");
			
			//append text to group
			legText = legItem.append("text")
				.attr("fill",legColor)
				.attr("x",15)
				.text(this.series[i].name)
			
			//append icon to group	
			legItem.append("rect")
				.attr("fill",legColor)
				.attr("width",9)
				.attr("height",9)
				.attr("y",-10)
				.attr("x",4)
			
			//increment the x-position for the next legend item
			legItemX += parseInt(legText.style("width").split("p")[0]) + 20
			if(legItemX + 100> this.chart.w) {
				legItemX = 0;
				legItemY += 17;
			}
			
			//add controls to the interface
			var rightChecked = this.series[i].axis == "right" ? "checked" : " ";
			var leftChecked = this.series[i].axis == "left" ? "checked" : " ";
			
			
			$("#currentSeries").append('<div class="seriesItem" id="seriesItem_'+i+'"><p>'+this.series[i].name+'</p><label for="left_axis_'+i+'">L</label><input type="radio" class="left_axis_radio" '+ leftChecked +' name="series_'+i+'" id="left_axis_'+i+'" value='+i+'><label for="right_axis_'+i+'">R</label><input type="radio" class="right_axis_radio" '+ rightChecked +' name="series_'+i+'" id="right_axis_'+i+'" value='+i+'><div style="clear:both;"></div></div>')
				
		};
		
			
		//add credit and source
		this.chart.sourceGroup = this.chart.svg.append("g")
			.attr("class","chartSource")
			
		this.chart.sourceGroup.append("text")
			.text(this.config.sourceLine)
			.attr("y",this.chart.h-5)
			
		this.chart.sourceGroup.append("text")
			.text(this.config.dataLine)
			.attr("y",this.chart.h-5)
			.attr("x",this.chart.w)
			.attr("text-anchor","end")
		
	},
	update: function() {
		
	},
	updateConfig: function() {
		this.config.rightAxisPrefix = $("#right_axis_prefix").val();
		this.config.rightAxisSuffix = $("#right_axis_suffix").val();
		this.config.sourceLine = $("#creditLine").val();
		this.config.dataLine = $("#sourceLine").val();
		this.config.dateParser = this.dateParsers[$("#x_axis_date_format").val()];
		this.config.numYaxisTicks = parseFloat($("#right_axis_tick_num").val())
		
		//set right axis values
		this.config.rightAxisTickValues = $("#right_axis_tick_override").val().split(",")
		this.config.rightAxisMax = $("#right_axis_max").val();
		if(this.config.rightAxisMax.length < 1) {
			this.config.rightAxisMax = null
		}
		else {
			this.config.rightAxisMax = parseFloat(this.config.rightAxisMax)
		}
		this.config.rightAxisMin = $("#right_axis_min").val();
		if(this.config.rightAxisMin.length < 1) {
			this.config.rightAxisMin = null
		}
		else {
			this.config.rightAxisMin = parseFloat(this.config.rightAxisMin)
		}
		if(this.config.rightAxisTickValues.length<2) {
			this.config.rightAxisTickValues = null;
		}
		
		this.config.dualAxis = $("#dual_axes").is(":checked");
				
		//set left axis values
		this.config.numYaxisTicks = parseFloat($("#left_axis_tick_num").val())
		this.config.leftAxisTickValues = $("#left_axis_tick_override").val().split(",")
		this.config.leftAxisMax = $("#left_axis_max").val();
		if(this.config.leftAxisMax.length < 1) {
			this.config.leftAxisMax = null
		}
		else {
			this.config.leftAxisMax = parseFloat(this.config.leftAxisMax)
		}
		this.config.leftAxisMin = $("#left_axis_min").val();
		if(this.config.leftAxisMin.length < 1) {
			this.config.leftAxisMin = null
		}
		else {
			this.config.leftAxisMin = parseFloat(this.config.leftAxisMin)
		}
		
		for (var i = this.series.length - 1; i >= 0; i--){
			this.series[i].axis = $('#seriesItem_'+i).find(".left_axis_radio").is(":checked") ? "left" : "right";
		};

	},
	updateData: function() {
		var csvString = $("#csvInput").val()
		//check if more tabs or commas as a weak indicator of .tsv or .csv
		var parseOptions = {
			delimiter: "\"",
			separator: ",",
			escaper:"\\",
			skip:"0"
		}
		var tab = String.fromCharCode(9)

		if(csvString.split(tab).length > csvString.split(",").length) {
			//more tabs than commas
			
			//swap tabs for pipes
			csvString = csvString.split(tab).join("|")
			parseOptions.separator = "|"
		}
		else {
			//more commas than tabs
		}
		var data = $.csv.toArrays(csvString,parseOptions)
		this.series = this.parseData(this.pivotData(data))
		if((/date/gi).test(this.series[0].name)) {
			this.config.dateseries = true
		}
		this.init()
		return false;
	},
	parseData: function(a) {
		var d = []
		var parseFunc;
		
		for (var i=0; i < a.length; i++) {
			if((/date/gi).test(a[i][0])) {
				parseFunc = this.dateAll
				//this.config.dateseries = true;
			}
			else {
				//this.config.dateseries = false;
				parseFunc = this.floatAll
			}
			
			d.push({
				"name": a[i].shift(),
				"data":parseFunc(a[i]),
				"prefix":"",
				"suffix":"",
				"axis":"right"
			});
		};
		return d
	},
	pivotData: function(a){
		var o = []
		for (var i=0; i < a.length; i++) {
			for (var j=0; j < a[i].length; j++) {
				if(i == 0) {
					o.push([])
				}
				if(a[i][j] != "") {
					o[j][i] = a[i][j]
				}
			};
		}
		return o
	},
	extentAll: function(a,s) {
		o = []
		e = []
		var startVal

		if(this.config.dateseries){
			startVal = 1;
		}
		else {
			startVal = 0;
		}
		for (var i=startVal; i < a.length; i++) {
			if(a[i].axis != s) {
				continue;
			}
			e = d3.extent(a[i].data)
			o.push(e[0])
			o.push(e[1])
		}
		return d3.extent(o)
	},
	floatAll: function(a) {
		for (var i=0; i < a.length; i++) {
			a[i] = parseFloat(a[i])
		};
		return a
	},
	dateAll: function(a) {
		for (var i=0; i < a.length; i++) {
			a[i] = new Date(a[i])
		};
		return a
	}
	
}


$(document).ready(function() {
//	cb.init();
	$("#dataInputButton").click(function() {
		cb.updateConfig()
		cb.updateData()
		return false;
	})
	
	$("#dataConfigButton").click(function() {
		cb.updateConfig()
		cb.init()
		return false;
	})
});
