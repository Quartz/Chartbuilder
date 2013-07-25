var chart;
ChartBuilder = {
	allColors: ["ff4cf4","ffb3ff","e69ce6","cc87cc","b373b3","995f99","804c80","665266", //purples
				"158eff","99cdff","9cc2e6","87abcc","7394b3","5f7d99","466780","525c66", //blues
				"000000","f2f2f2","e6e6e6","cccccc","b3b3b3","999999","808080","666666", //grays
				"15ff67","b3ffcc","9ce6b5","87cc9e","73b389","5f9973","4c805d","526659", //greens
				"FFFF03","fbffb3","e2e69c","c9cc87","b0b373","96995F","7e804c","656652", //yellows
				"FF4200","ffb899","e6b39c","cc9c87","b38673","99715f","805c4c","665852", //oranges
				"FF005C","ff99b9","e69cb3","cc879d","b37387","995f71","804c5d","665258"  //reds
				],
	curRaw: "",
	getNewData: function() {
		
		var csvString = $("#csvInput").val()
		var parseOptions = {
			delimiter: "\"",
			separator: "|",
			escaper:"\\",
			skip:"0"
		}
		
        
		/* JUST USE TAB DELIMETED OKAY
		//check if more tabs or commas as a weak indicator of .tsv or .csv
		if(csvString.split(tab).length < csvString.split(",").length) {
			//more tabs than commas
			
			//swap tabs for pipes because of some bug in the csv library
			csvString = csvString.split(tab).join("|")
			parseOptions.separator = "|"
		}
		else {
			//more commas than tabs
		}
		*/
		
		var tab = String.fromCharCode(9)
		//swap tabs for pipes because of some bug in the csv reading library
		csvString = csvString.split(tab).join("|")
		
		/*remove commas (but not from the header row)*/
		csvString = csvString.split("\n")
		//cache the header row
		var header = csvString[0] + ""
		csvString = csvString.join("\n").split(",").join("")
		csvString = csvString.split("\n")
		csvString[0] = header;
		csvString = csvString.join("\n")
		
		var rawdata = $.csv.toArrays(csvString,parseOptions)
		var data = this.parseData(this.pivotData(rawdata))
		var output = {data: data, datetime: (/date/gi).test(data[0].name)}
		this.createTable(rawdata,output)
		return output
		
		
	},
	parseData: function(a) {
		var d = []
		var parseFunc;
		for (var i=0; i < a.length; i++) {
			if((/date/gi).test(a[i][0])){ //relies on the word date 
				parseFunc = this.dateAll
			}
			else if (i == 0) {
				parseFunc = this.doNothing
			}
			else {
				parseFunc = this.floatAll
			}
			
			d.push({
				"name": a[i].shift().split("..").join("\n"),
				"data":parseFunc(a[i]),
			});
			
		};
		for (var i = d.length - 1; i >= 0; i--){
			for (var j = d[i].length - 1; j >= 0; j--){
				if(d[i][j] == "" || d[i][j]==" ") {
					d[i][j] = null
				}
			};
		};
		return d
	},
	mergeData: function(a) {
		var d
		for (var i=0; i < a.data.length; i++) {
			d = a.data[i]
			if(i < chart.g.series.length) {
				a.data[i] = $.extend({},chart.g.series[i],d)
			}
			else {
				//defaults for new series
				a.data[i].type = "line"
			}
			
		};
		
		return a
	},
	pivotData: function(a){
		var o = []
		for (var i=0; i < a.length; i++) {
			if(a[i]) {
				for (var j=0; j < a[i].length; j++) {
					if(i == 0) {
						o.push([])
					}
					if(a[i][j] != "") {
						o[j][i] = a[i][j]
					}
				};
			}
			
		}
		return o
	},
	createTable: function(r,d){
		$table = $("#dataTable table")
		$table.text("")
		$table.append("<tr><th>"+r[0].join("</th><th>")+"</th></tr>")
		for (var i=1; i < r.length; i++) {
			if(r[i]) {
				if(d.datetime) {
					r[i][0] = Date.create(r[i][0]).format("{M}/{d}/{yy} {hh}:{mm}")
				}
				$("<tr><td>"+r[i].join("</td><td>")+"</td></tr>")
					.addClass(i%2 == 0? "otherrow":"row")
					.appendTo($table)
			}
			
				
		};
	},
	floatAll: function(a) {
		for (var i=0; i < a.length; i++) {
			if(a[i] && a[i].length > 0 && (/[\d\.]+/).test(a[i])) {
				a[i] = parseFloat(a[i])
			}
			else {
				a[i] = null
			}
		};
		return a
	},
	dateAll: function(a) {
		for (var i=0; i < a.length; i++) {
			a[i] = Date.create(a[i])
		};
		return a
	},
	doNothing: function(a) {
		return a
	},
	inlineAllStyles: function() {
		var chartStyle, selector, cssText;
		
		for (var i = document.styleSheets.length - 1; i >= 0; i--){
			if(document.styleSheets[i].href.indexOf("gneisschart.css") != -1) {
				chartStyle = document.styleSheets[i].rules
			}
		}
		for (var i=0; i < chartStyle.length; i++) {
			selector = chartStyle[i].selectorText;
			cssText = chartStyle[i].style.cssText;
			d3.selectAll(selector).attr("style",cssText)
		};

	},
	createChartImage: function() {

		var canvas = document.getElementById("canvas")
		canvas.width =1200
		canvas.height = 676

		var canvasContext = canvas.getContext("2d")
		var svg = $.trim(document.getElementById("chartContainer").innerHTML)
		canvasContext.drawSvg(svg,0,0)
		
		
		var filename = [];
		for (var i=0; i < chart.g.series.length; i++) {
			filename.push(chart.g.series[i].name);
		};
		
		if(chart.g.title.length > 0) {
			filename.unshift(chart.g.title)
		}
		
		filename = filename.join("-").replace(/[^\w\d]+/gi, '-');
		
		
		$("#downloadImageLink").attr("href",canvas.toDataURL("png"))
			.toggleClass("hide")
			.attr("download",function(){ return filename + "_chartbuilder.png"
			});
			
		$("#downloadSVGLink").attr("href","data:text/svg,"+ encodeURI($("#chartContainer").html().split("PTSerif").join("PT Serif")) )
			.toggleClass("hide")
			.attr("download",function(){ return filename + "_chartbuilder.svg"
			})
		
		var icon = this.setFavicon()
		this.storeLocalChart(filename)	
		
	},
	setFavicon: function() {
		//set favicon to image of chart
		var favicanvas = document.getElementById("favicanvas")
		favicanvas.width = 64;
		favicanvas.height = 64;
		
		var faviCanvasContext = favicanvas.getContext("2d")
		faviCanvasContext.translate(favicanvas.width / 2, favicanvas.height / 2);
		
		var svg = $.trim(document.getElementById("chartContainer").innerHTML)
		faviCanvasContext.drawSvg(svg,-16,-8,32,32)
		
		var icon = favicanvas.toDataURL("png");
		$("#favicon").attr("href",icon)
		
		return icon;
	},
	redraw: function() {
		$(".seriesItemGroup").detach()
		$(".downloadLink").addClass("hide")
		var g = chart.g, s, picker;
		this.customLegendLocaion = false;
		var colIndex = g.sbt.line.length, lineIndex = 0, bargridIndex = 0, scatterIndex = 0;
		var seriesContainer = $("#seriesItems")
		var isMultiAxis = false;
		for (var i=0; i < g.series.length; i++) {
			s = g.series[i]
			seriesItem = $('<div class="seriesItemGroup">\
				<label for="'+this.idSafe(s.name)+'_color">'+s.name+'</label>\
				<input id="'+this.idSafe(s.name)+'_color" name="'+this.idSafe(s.name)+'" type="text" />\
				<select class="typePicker" id="'+this.idSafe(s.name)+'_type">\
				<option '+(s.type=="line"?"selected":"")+' value="line">Line</option>\
				<option '+(s.type=="column"?"selected":"")+' value="column">Column</option>\
				<option '+(s.type=="bargrid"?"selected":"")+' value="bargrid">Bar Grid</option>\
				<option '+(s.type=="scatter"?"selected":"")+' value="scatter">Scatter</option>\
				<label for="'+this.idSafe(s.name)+'_check">2nd Axis</label>\
				<input id="'+this.idSafe(s.name)+'_check" name="'+this.idSafe(s.name)+'_check" type="checkbox" />\
				</select>\
				<div class="clearfix"></div>\
			</div>');
			
			var color = ""
			
			if(s.type == "line") {
				color = s.color ? s.color.replace("#","") : g.colors[lineIndex].replace("#","")
				lineIndex++
			}
			else if(s.type == "column") {
				color = s.color ? s.color.replace("#","") : g.colors[colIndex].replace("#","")
				colIndex++
			}
			else if(s.type =="bargrid") {
				color = s.color ? s.color.replace("#","") : g.colors[bargridIndex].replace("#","")
				bargridIndex++
			}
			else if(s.type =="scatter") {
				color = s.color ? s.color.replace("#","") : g.colors[scatterIndex].replace("#","")
				scatterIndex++
			}
			
			seriesContainer.append(seriesItem);
			var picker = seriesItem.find("#"+this.idSafe(s.name)+"_color").colorPicker({pickerDefault: color, colors:this.allColors});
			var typer = seriesItem.find("#"+this.idSafe(s.name)+"_type")
			var axer = seriesItem.find("#"+this.idSafe(s.name)+"_check")
			
			if(g.series[i].axis == 1) {
				axer.prop("checked",true)
				if(!g.yAxis[1].color || !isMultiAxis) {
					g.yAxis[1].color = picker.val()
				}
				isMultiAxis = true;
			}
			else {
				axer.prop("checked",false)
			}
												
			seriesItem.data("index",i)
			picker.change(function() {
				chart.g.series[$(this).parent().data().index].color = $(this).val()
				ChartBuilder.redraw()
			})
			
			typer.change(function() {
				var val = $(this).val(),
				index = $(this).parent().data().index;
				chart.g.series[index].type = val
				var hasBargrid = false;
				chart.setPadding();
				ChartBuilder.setChartArea()
				chart.setXScales()
					.resize()
				ChartBuilder.redraw()
			})
			
			axer.change(function() {
				var axis = $(this).is(':checked')?1:0;
				chart.g.series[$(this).parent().data().index].axis = axis
				
				if(!chart.g.yAxis[axis]){
					chart.g.yAxis[axis] = {
											domain: [null,null],
											tickValues: null,
											prefix: {
												value: "",
												use: "top" //can be "top" "all" "positive" or "negative"
											},
											suffix: {
												value: "",
												use: "top"
											},
											ticks: 4,
											formatter: null,
											color: null,
										}
				}
				
				if(chart.g.yAxis.length > 1 && axis == 0) {
					chart.g.yAxis.pop()
				}
				
				chart.setYScales()
					.setYAxes()
					.setLineMakers();
				ChartBuilder.redraw()
			})
			
			chart.redraw()
			this.makeLegendAdjustable()
		}
		
		
		var yAxisObj = []
		for (var i = g.yAxis.length - 1; i >= 0; i--){
			var cur = g.yAxis[i]
			yAxisObj[i] = {
				domain: cur.domain,
				tickValues: cur.tickValues,
				prefix: cur.prefix,
				suffix: cur.suffix,
				ticks: cur.ticks,
				formatter: cur.formatter
			}
		};
		
		var xAxisObj = {
			domain: g.xAxis.domain,
			prefix: g.xAxis.prefix,
			suffix: g.xAxis.suffix,
			type: g.xAxis.type,
			formatter: g.xAxis.formatter
		}
		
		if(isMultiAxis){
			$("#leftAxisControls").removeClass("hidden")
		}
		else {
			$("#leftAxisControls").addClass("hidden")
		}
		
		
		var state = {
			container: g.container,
			colors: g.colors,
			title: g.title,
			padding : g.padding,
			xAxis: xAxisObj,
			yAxis: yAxisObj,
			series: g.series,
			xAxisRef: g.xAxisRef,
			sourceline: g.sourceline,
			creditline: g.creditline
		}

		
		chart.g = g;
		ChartBuilder.inlineAllStyles();
	},
	setChartArea: function() {
		var hasBargrid = false;
		for (var i = chart.g.series.length - 1; i >= 0; i--){
			if(chart.g.series[i].type == "bargrid") {
				hasBargrid = true;
				break;
			}
		};
		
		if(hasBargrid) {
			$("#chartContainer").css("height",
				chart.g.series[0].data.length*22 + 
				chart.g.padding.top + 
				chart.g.padding.bottom
				)
		}
		else {
			$("#chartContainer").css("height",338)
		}
	},
	makeLegendAdjustable: function() {
		
		var legendLabelDrag = d3.behavior.drag()
		    .origin(Object)
			.on("dragstart",function(d){
				elem = d3.select(this)
				d3.select(elem[0][0].parentElement).selectAll("rect").style("display","none")
				if(!ChartBuilder.customLegendLocaion) {
					chart.g.legend = false;
					chart.redraw()
					ChartBuilder.inlineAllStyles()
					ChartBuilder.makeLegendAdjustable()
					ChartBuilder.customLegendLocaion = true;
				}
				
			})
		    .on("drag", function(d){
				elem = d3.select(this)
				elem.attr("x", Number(elem.attr("x")) + d3.event.dx)
					.attr("y", Number(elem.attr("y")) + d3.event.dy);
					
				
		});
		d3.selectAll("text.legendLabel").call(legendLabelDrag);
		
		
	},
	getAllInputData: function() {
		var d = {}, $el;
		var elems = $("input, textarea, select:not(#previous_charts)").each(function() {
			$el = $(this)
			d[$el.attr("id")] = $el.val()
		})
		return d
	},
	storeLocalChart: function(name) {
		try {
			localStorage["savedCharts"][0]
		}
		catch(e) {
			localStorage["savedCharts"] = JSON.stringify([])
		}
		
		var allcharts = JSON.parse(localStorage["savedCharts"])
		newChart = this.getAllInputData()
		newChart.name = name
		allcharts.push(newChart)
		localStorage["savedCharts"] = JSON.stringify(allcharts);
	},
	getLocalCharts: function() {
		var charts = []
		try {
			charts = JSON.parse(localStorage["savedCharts"])
		}
		catch(e){ /* Fail Silently */}
		
		return charts
	},
	loadLocalChart: function(d) {
		for (var key in d) {
			if(key != "name") {
				$("#"+key).val(d[key])
				//$("#"+key).text(d[key])
			}
		}
		$("input, textarea, select:not(#previous_charts)").keyup().change()
	},
	idSafe: function(s) {
		s = s.replace(/[^\w\d]+/gi,"-")
		return s
	},
	customLegendLocaion:false,
	useState: false,
	draws: 0,
	actions: {
		axis_prefix_change: function(index,that) {
			chart.g.yAxis[index].prefix.value = $(that).val()
			ChartBuilder.redraw()
			ChartBuilder.inlineAllStyles();
		},
		axis_suffix_change: function(index,that) {
			chart.g.yAxis[index].suffix.value = $(that).val()
			ChartBuilder.redraw()
			ChartBuilder.inlineAllStyles();
		},
		axis_tick_num_change: function(index,that) {
			chart.g.yAxis[index].ticks = parseInt($(that).val())
			ChartBuilder.redraw()
			ChartBuilder.inlineAllStyles();
		},
		axis_max_change: function(index,that) {
			var val = parseFloat($(that).val())
			if(isNaN(val)) {
				val = null
			}
			chart.g.yAxis[index].domain[1] = val;
			chart.setYScales();
			ChartBuilder.redraw()
			ChartBuilder.inlineAllStyles();
		},
		axis_min_change: function(index,that) {
			var val = $(that).val()
			var val = parseFloat(val)
			if(val == NaN) {
				val == null
			}

			chart.g.yAxis[index].domain[0] = val;
			chart.setYScales();
			ChartBuilder.redraw()
			ChartBuilder.inlineAllStyles();
		},
		axis_tick_override_change: function(index,that) {
			var val = $(that).val()
			val = val.split(",")
			if(val.length > 1) {
				for (var i = val.length - 1; i >= 0; i--){
					val[i] = parseFloat(val[i])
				};
			}
			else {
				val = null
			}
			chart.g.yAxis[index].tickValues = val
			chart.setYScales();
			ChartBuilder.redraw()
			ChartBuilder.inlineAllStyles();
		}
	}
}

$(document).ready(function() {
	
	chartConfig.colors = []
	for (var i=0; i < ChartBuilder.allColors.length; i++) {
		chartConfig.colors[i] = "#"+ ChartBuilder.allColors[i]
	}
	
	//construct a Gneisschart using default data
	//this should change to be more like this http://bost.ocks.org/mike/chart/
	chart = Gneiss.build(chartConfig)
	
	//scale it up so it looks good on retina displays
	$("#chart").attr("transform","scale(2)")
	
	ChartBuilder.redraw()
	ChartBuilder.inlineAllStyles();
	
	//populate the input with the data that is in the chart
	$("#csvInput").val(function() {
		var val = ""
		for (var i=0; i < chart.g.series.length; i++) {
			val += chart.g.series[i].name 
			val += (i<chart.g.series.length-1) ? "\t" : "\n"
		};
		for (var j=0; j < chart.g.series[0].data.length; j++) {
			for (var i=0; i < chart.g.series.length; i++) {
				val += chart.g.series[i].data[j] 
				val += (i<chart.g.series.length-1) ? "\t" : "\n"
			};
		};
		return val
	})
	
	//load previously made charts
	var savedCharts = ChartBuilder.getLocalCharts();
	var chartSelect = d3.select("#previous_charts")
					.on("change",function() {
						ChartBuilder.loadLocalChart(d3.select(this.selectedOptions[0]).data()[0])
					})
	
	chartSelect.selectAll("option")
			.data(savedCharts)
			.enter()
			.append("option")
			.text(function(d){return d.name?d.name:"Untitled Chart"})
			
	
	$("#createImageButton").click(function() {
		ChartBuilder.inlineAllStyles();
		ChartBuilder.createChartImage();
	})
	
	$("#csvInput").bind("paste", function(e) {
		if($("#right_axis_max").val().length == 0 && $("#right_axis_min").val().length == 0) {
			for (var i = chart.g.yAxis.length - 1; i >= 0; i--){
				chart.g.yAxis[i].domain = [null,null];
			};
		}
		
	})
	
	/*
	//
	// add interactions to chartbuilder interface
	//
	*/
	
	$("#csvInput").keyup(function() {
		//check if the data is different
		if( $(this).val() != ChartBuilder.curRaw) {
			
			//cache the the raw textarea value
			ChartBuilder.curRaw = $(this).val()
			
			var newData = ChartBuilder.getNewData()
			
			chart.g.series.unshift(chart.g.xAxisRef)
			newData = ChartBuilder.mergeData(newData)
			
			if(newData.datetime) {
				chart.g.xAxis.type = "date";
				chart.g.xAxis.formatter = "Mdd"
			}
			else {
				chart.g.xAxis.type = "ordinal";
			}
			chart.g.xAxisRef = [newData.data.shift()]
			
			chart.g.series=newData.data
			chart.setPadding();
			
			ChartBuilder.setChartArea()
			
			chart.setYScales()
				.setXScales()
				.setLineMakers();
				
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		}

	}).keyup()
	
	$("#right_axis_prefix").keyup(function() {
		ChartBuilder.actions.axis_prefix_change(0,this)
	})
	
	$("#right_axis_suffix").keyup(function() {
		ChartBuilder.actions.axis_suffix_change(0,this)
	})
	
	$("#right_axis_tick_num").change(function() {
		ChartBuilder.actions.axis_tick_num_change(0,this)
	})
	
	$("#right_axis_max").keyup(function() {
		ChartBuilder.actions.axis_max_change(0,this)
	})
	
	$("#right_axis_min").keyup(function() {
		ChartBuilder.actions.axis_min_change(0,this)
	})
	
	$("#right_axis_tick_override").keyup(function() {
		ChartBuilder.actions.axis_tick_override_change(0,this)
	})
	
	$("#x_axis_tick_num").change(function() {
		chart.g.xAxis.ticks = parseInt($(this).val())
		ChartBuilder.redraw()
		ChartBuilder.inlineAllStyles();
	})
	
	$("#left_axis_prefix").keyup(function() {
		ChartBuilder.actions.axis_prefix_change(1,this)
	})

	$("#left_axis_suffix").keyup(function() {
		ChartBuilder.actions.axis_suffix_change(1,this)
	})

	$("#left_axis_tick_num").change(function() {
		ChartBuilder.actions.axis_tick_num_change(1,this)
	})

	$("#left_axis_max").keyup(function() {
		ChartBuilder.actions.axis_max_change(1,this)
	})

	$("#left_axis_min").keyup(function() {
		ChartBuilder.actions.axis_min_change(1,this)
	})

	$("#left_axis_tick_override").keyup(function() {
		ChartBuilder.actions.axis_tick_override_change(1,this)
	})
	
	$("#x_axis_date_format").change(function() {
		var val = $(this).val()
		chart.g.xAxis.formatter = val
		ChartBuilder.redraw()
		ChartBuilder.inlineAllStyles();
	})
	
	$("#creditLine").keyup(function() {
		var val = $(this).val()
		chart.g.creditline = val
		chart.g.creditLine.text(chart.g.creditline)
	})
	
	$("#sourceLine").keyup(function() {
		var val = $(this).val()
		chart.g.sourceline = val
		chart.g.sourceLine.text(chart.g.sourceline)
	})
	
	$("#chart_title").keyup(function() {
		var val = $(this).val()
		chart.g.title = val
		chart.resize()
			.setPadding();
		ChartBuilder.setChartArea()
		chart.setYScales()
			.redraw();
		ChartBuilder.makeLegendAdjustable()
		
		chart.g.titleLine.text(chart.g.title)
	})
	
	$(".downloadLink").click(function() {
		$(".downloadLink").toggleClass("hide")
	})


})