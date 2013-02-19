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
		//check if more tabs or commas as a weak indicator of .tsv or .csv
		var parseOptions = {
			delimiter: "\"",
			separator: ",",
			escaper:"\\",
			skip:"0"
		}
		var tab = String.fromCharCode(9)
        
		/* JUST USE TAB DELIMETED OKAY
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
		
		//swap tabs for pipes because of some bug in the csv library
		csvString = csvString.split(tab).join("|")
		parseOptions.separator = "|"
		
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
		//var dataLength = Math.min(a.data.length,chart.q.series.length)
		for (var i=0; i < a.data.length; i++) {
			d = a.data[i]
			//d.prefix = chart.q.series[i].prefix
			//d.suffix = chart.q.series[i].suffix
			//d.axis = chart.q.series[i].axis
			//d.type = chart.q.series[i].type
			//d.color = chart.q.series[i].color
			
			//a.data[i] = d
			if(i < chart.q.series.length) {
				a.data[i] = $.extend({},chart.q.series[i],d)
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
	inlineAllStyles: function() {
		
		d3.selectAll("#interactiveContent svg .axis line")
			.attr("fill","none")
			.attr("shape-rendering","crispEdges")
			
		d3.selectAll("#interactiveContent svg .axis line#zeroLine")
				.attr("stroke", "#ff4cf4");
				
		d3.selectAll("#interactiveContent svg #xAxis line")
			.attr("stroke","#e6e6e6")

		d3.selectAll("#interactiveContent svg .axis path")
			.attr("stroke", "none")
			.attr("fill","none");
			
		d3.selectAll("#interactiveContent svg .axis text")
				.attr("style","font-family:'PTSerif';font-size: 16px;")
				.attr("fill","#666666")
		
		d3.selectAll("#interactiveContent svg .legendItem text")
					.attr("style","font-family:'PTSerif';font-size: 16px;")

		d3.selectAll("#interactiveContent svg text.metaText")
			.attr("style","font-family:'PTSerif';font-size: 12px; text-rendering:  optimizeLegibility; fill: #999999;") 
				
	},
	createChartImage: function() {
		var canvas = document.getElementById("canvas")
		canvas.width =1200
		canvas.height = 676

		var canvasContext = canvas.getContext("2d")
		var svg = $.trim(document.getElementById("chartContainer").innerHTML)
		canvasContext.drawSvg(svg,0,0)
		
		
		var filename = [];
		for (var i=0; i < chart.q.series.length; i++) {
			filename.push(chart.q.series[i].name);
		};
		filename = filename.join("-").replace(/[^\w\d]+/gi, '-');
		
		
		$("#downloadImageLink").attr("href",canvas.toDataURL("png"))
			.toggleClass("hide")
			.attr("download",function(){ return filename + "_chart.png"
			});
			
		$("#downloadSVGLink").attr("href","data:text/svg,"+ encodeURI($("#chartContainer").html().split("PTSerif").join("PT Serif")) )
			.toggleClass("hide")
			.attr("download",function(){ return filename + "_chart.svg"
			})
	},

	redraw: function() {
		$(".seriesItemGroup").detach()
		$(".downloadLink").addClass("hide")
		var q = chart.q, s, picker;
		
		var colIndex = q.sbt.line.length, lineIndex = 0;
		var seriesContainer = $("#seriesItems")
		for (var i=0; i < q.series.length; i++) {
			s = q.series[i]
			seriesItem = $('<div class="seriesItemGroup">\
				<label for="'+this.idSafe(s.name)+'_color">'+s.name+'</label>\
				<input id="'+this.idSafe(s.name)+'_color" name="'+this.idSafe(s.name)+'" type="text" />\
				<select class="typePicker" id="'+this.idSafe(s.name)+'_type">\
				<option '+(s.type=="line"?"selected":"")+' value="line">Line</option>\
				<option '+(s.type=="column"?"selected":"")+' value="column">Column</option>\
				</select>\
				<div class="clearfix"></div>\
			</div>');
			
			var color = ""
			
			if(s.type == "line") {
				color = s.color ? s.color.replace("#","") : q.colors[lineIndex].replace("#","")
				lineIndex++
			}
			else if(s.type == "column") {
				color = s.color ? s.color.replace("#","") : q.colors[colIndex].replace("#","")
				colIndex++
			}
			
			seriesContainer.append(seriesItem);
			var picker = seriesItem.find("#"+this.idSafe(s.name)+"_color").colorPicker({pickerDefault: color, colors:this.allColors});
			var typer = seriesItem.find("#"+this.idSafe(s.name)+"_type")
												
			seriesItem.data("index",i)
			picker.change(function() {
				chart.q.series[$(this).parent().data().index].color = $(this).val()
				ChartBuilder.redraw()
			})
			
			typer.change(function() {
				chart.q.series[$(this).parent().data().index].type = $(this).val()
				ChartBuilder.redraw()
			})
			
			chart.redraw()
		}
		
		
		var yAxisObj = []
		for (var i = q.yAxis.length - 1; i >= 0; i--){
			var cur = q.yAxis[i]
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
			domain: q.xAxis.domain,
			prefix: q.xAxis.prefix,
			suffix: q.xAxis.suffix,
			type: q.xAxis.type,
			formatter: q.xAxis.formatter
		}
		
		var state = {
			container: q.container,
			colors: q.colors,
			padding : q.padding,
			xAxis: xAxisObj,
			yAxis: yAxisObj,
			series: q.series,
			dateRef: q.dateRef,
			sourceline: q.sourceline,
			creditline: q.creditline
		}
		//console.log("pushState", state, "Chart Builder")
		//	window.history.pushState(state, "Chart Builder", window.location.toString().split(".local")[1])
			ChartBuilder.useState = true;
			ChartBuilder.draws += 1;

		
		chart.q = q;
		
		
	},
	idSafe: function(s) {
		s = s.replace(/[^\w\d]+/gi,"-")
		return s
	},
	useState: false,
	draws: 0
}

$(document).ready(function() {
	
	chartConfig.colors = []
	for (var i=0; i < ChartBuilder.allColors.length; i++) {
		chartConfig.colors[i] = "#"+ ChartBuilder.allColors[i]
	}
	
	chart = QuartzCharts.build(chartConfig)
	$("#chart").attr("transform","scale(2)")
	
	ChartBuilder.redraw()
	ChartBuilder.inlineAllStyles();
	$("#csvInput").val(function() {
		var val = ""
		for (var i=0; i < chart.q.series.length; i++) {
			val += chart.q.series[i].name 
			val += (i<chart.q.series.length-1) ? "\t" : "\n"
		};
		for (var j=0; j < chart.q.series[0].data.length; j++) {
			for (var i=0; i < chart.q.series.length; i++) {
				val += chart.q.series[i].data[j] 
				val += (i<chart.q.series.length-1) ? "\t" : "\n"
			};
		};
		return val
		
		//return chart.q.series[0].name + "\n" + chart.q.series[0].data.join("\n")
	})
	
	$("#createImageButton").click(function() {
		ChartBuilder.inlineAllStyles();
		ChartBuilder.createChartImage();
		//$("#downloadLink").toggleClass("hide")
	})
	
	$("#csvInput").bind("paste", function(e) {
		if($("#right_axis_max").val().length == 0 && $("#right_axis_min").val().length == 0) {
			for (var i = chart.q.yAxis.length - 1; i >= 0; i--){
				chart.q.yAxis[i].domain = [null,null];
			};
		}
		
	})
	
	//add interactions to interface
	$("#csvInput").keyup(function() {
		
		if( $(this).val() != ChartBuilder.curRaw) {
			ChartBuilder.curRaw = $(this).val()
			
			var newData = ChartBuilder.getNewData()
			
			if(newData.datetime) {
				chart.q.series.unshift(chart.q.dateRef)
				newData = ChartBuilder.mergeData(newData)
				chart.q.dateRef = [newData.data.shift()]
				chart.q.xAxis.type = "date";
			}
			else {
				newData = ChartBuilder.mergeData(newData)
				chart.q.xAxis.type = "linear";
			}
			
			
			
			chart.q.series=newData.data
			//chart.setYScales();
			//chart.setXScales();
			chart.setLineMakers();
			ChartBuilder.redraw()
			ChartBuilder.inlineAllStyles();
		}

	})
	
	$("#right_axis_prefix").keyup(function() {
		chart.q.yAxis[0].prefix.value = $(this).val()
		ChartBuilder.redraw()
		ChartBuilder.inlineAllStyles();
	})
	
	$("#right_axis_suffix").keyup(function() {
		chart.q.yAxis[0].suffix.value = $(this).val()
		ChartBuilder.redraw()
		ChartBuilder.inlineAllStyles();
	})
	
	$("#right_axis_tick_num").change(function() {
		chart.q.yAxis[0].ticks = parseInt($(this).val())
		ChartBuilder.redraw()
		ChartBuilder.inlineAllStyles();
	})
	
	$("#right_axis_max").keyup(function() {
		var val = parseFloat($(this).val())
		if(isNaN(val)) {
			val = null
		}
		chart.q.yAxis[0].domain[1] = val;
		chart.setYScales();
		ChartBuilder.redraw()
		ChartBuilder.inlineAllStyles();
	})
	
	$("#right_axis_min").keyup(function() {
		var val = $(this).val()
		var val = parseFloat(val)
		if(val == NaN) {
			val == null
		}
		
		chart.q.yAxis[0].domain[0] = val;
		chart.setYScales();
		ChartBuilder.redraw()
		ChartBuilder.inlineAllStyles();
	})
	
	$("#right_axis_tick_override").keyup(function() {
		var val = $(this).val()
		val = val.split(",")
		if(val.length > 1) {
			for (var i = val.length - 1; i >= 0; i--){
				val[i] = parseFloat(val[i])
			};
		}
		else {
			val = null
		}
		chart.q.yAxis[0].tickValues = val
		chart.setYScales();
		ChartBuilder.redraw()
		ChartBuilder.inlineAllStyles();
	})
	
	$("#x_axis_date_format").change(function() {
		var val = $(this).val()
		chart.q.xAxis.formatter = val
		ChartBuilder.redraw()
		ChartBuilder.inlineAllStyles();
	})
	
	$("#creditLine").keyup(function() {
		var val = $(this).val()
		chart.q.creditline = val
		chart.q.creditLine.text(chart.q.creditline)
	})
	
	$("#sourceLine").keyup(function() {
		var val = $(this).val()
		chart.q.sourceline = val
		chart.q.sourceLine.text(chart.q.sourceline)
	})
	
	$(".downloadLink").click(function() {
		$(".downloadLink").toggleClass("hide")
	})


})
// Revert to a previously saved state
//window.onpopstate = function(e) {
//	if(ChartBuilder.draws > 2) {
//		chart.q.chart.remove()
//		chart = QuartzCharts.build(e.state)
//		ChartBuilder.redraw()
//		ChartBuilder.inlineAllStyles();
//		
//	}
//
//};
