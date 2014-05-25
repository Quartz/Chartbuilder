var chart;
ChartBuilder = {
	allColors: ["BF0053","FF70B0","E15D98","C44B81","A63869","882551","6B133A","4D0022",
						"BF600A","FFC07E","E1A76A","C48D55","A67341","885A2D","6B4118","4D2704",
						"BFAA00","FFF270","E1D55D","C4B84B","A69C38","887F25","6B6213","4D4500",
						"00BFA5","70FFF7","5DE1D9","4BC4BC","38A69E","258880","136B63","004D45",
						"006DBF","70B8FF","5DA1E1","4B89C4","3871A6","255A88","13436B","002B4D",
						"9300BF","E770FF","CB5DE1","AE4BC4","9238A6","752588","59136B","3C004D"],
	curRaw: "",
	advancedMode: false,
	separators: {},
	getNewData: function(csv) {
		var i;
		if(!csv) {
			return null;
		}
		
		// Split the csv information by lines
		var csv_array = csv.split("\n");
		
		// Split the first element of the array by the designated separator, tab in this case
		var csv_matrix = [];
		var delim = String.fromCharCode(9);

		if (delim == this.separators.thousands || delim == this.separators.decimal) {
			console.warn("Your text deliminator is the same as your locale's thousands separator or decimal separator")
		}
		
		// Trim leading and trailing spaces from rows and split
		csv_matrix.push($.trim(csv_array[0]).split(delim));

		// Get the number of columns
		var cols_num = csv_matrix[0].length;

		// If there aren't at least two columns, return null
		if(cols_num < 2) {
			return null;
		}

		// Trim leading and trailing spaces from headers
		for(i = 0; i < cols_num; i++) {
			csv_matrix[0][i] = $.trim(csv_matrix[0][i]);
		}
			
		// Knowing the number of columns that every line should have, split
		// those lines by the designated separator. While doing this, count
		// the number of rows
		var rows_num = 0;
		for(i=1; i<csv_array.length; i++) {
			// If the row is empty, that is, if it is just an \n symbol, continue
			if(csv_array[i] === "") {
				continue;
			}

			// Split the row. If the row doesn't have the right amount of cols
			// then the csv is not well formated, therefore, return null
			var row = $.trim(csv_array[i]).split(delim);
			if(row.length != cols_num) {
				return null;
			}
			
			// Trim leading and trailing spaces from entries
			for(var j = 0; j < row.length; j++) {
				row[j] = $.trim(row[j]);
			}
			
			// Push row to matrix, increment row count, loop
			csv_matrix.push(row);
			rows_num++;
		}

		// If there aren't at least two non empty rows, return null
		if(rows_num < 2) {
			return null;
		}

		return csv_matrix;
	},
	// Given the matrix containing the well formated csv, create the object that
	// is going to be used later
	makeDataObj: function(csv_matrix) {
		// Make the data array
		var data = [];
		var value;
		for(var i=0; i<csv_matrix[0].length; i++) {
			// Object for a single column
			var obj = {name: csv_matrix[0][i], data: []};

			// Make the obj
			for(var j=1; j<csv_matrix.length; j++) {
				// If this is a date column
				if((/date/gi).test(obj.name)) {
					value = Date.create(csv_matrix[j][i]);
					if(value == "Invalid Date") {
						return null;
					}
					obj.data.push(value);
				}
				// If it is the first column, containing the names
				else if(i === 0) {
					obj.data.push(csv_matrix[j][i]);
				}
				// If it's a data point
				else {
					value = csv_matrix[j][i];

					//strip out currency symbol, measurement symbol and thousands separator
					//replace decimal separator with period
					value = value.split("$").join("")
								.split("£").join("")
								.split("€").join("")
								.split("%").join("")
								.split(this.separators.thousands).join("")
								.split(this.separators.decimal).join(".");


					if(value === "null" || value === "" || (/^\s+$/).test(value) || (/^\#[A-Z\\\d\/]+!{0,}$/).test(value)) {
						//allow for nulls, blank, whitespace only cells (if somehow trim didn't work), and excel errors
						value = null;
					}
					else if (isNaN(value)){
						//data isn't valid
						return null;
					}
					else {
						value = parseFloat(value);
					}
					
					obj.data.push(value);
				}
			}

			data.push(obj);
		}

		return {data: data, datetime: (/date/gi).test(data[0].name)};
	},
	parseData: function(a) {
		var d = [];
		var parseFunc;
		var i;
		for (i=0; i < a.length; i++) {
			if((/date/gi).test(a[i][0])){ //relies on the word date 
				parseFunc = this.dateAll;
			}
			else if (i === 0) {
				parseFunc = this.doNothing;
			}
			else {
				parseFunc = this.floatAll;
			}
			
			d.push({
				"name": a[i].shift().split("..").join("\n"),
				"data":parseFunc(a[i]),
			});
			
		}
		for (i = d.length - 1; i >= 0; i--){
			for (var j = d[i].length - 1; j >= 0; j--){
				if(d[i][j] === "" || d[i][j]===" ") {
					d[i][j] = null;
				}
			}
		}
		return d;
	},
	mergeData: function(a) {
		var d;
		for (var i=0; i < a.data.length; i++) {
			d = a.data[i];
			if(i < chart.series().length) {
				a.data[i] = $.extend({},chart.series()[i],d);
			}
			else {
				//defaults for new series
				a.data[i].type = "line";
			}
			
		}
		
		return a;
	},
	pivotData: function(a){
		var o = [];
		for (var i=0; i < a.length; i++) {
			if(a[i]) {
				for (var j=0; j < a[i].length; j++) {
					if(i === 0) {
						o.push([]);
					}
					if(a[i][j] !== "") {
						o[j][i] = a[i][j];
					}
				}
			}
			
		}
		return o;
	},
	createTable: function(r,d){
		$table = $("#dataTable table");
		$table.text("");


		$table.append("<tr><th>"+r[0].join("</th><th>")+"</th></tr>");

		for (var i=1; i < r.length; i++) {
			if(r[i]) {
				if(d) {
					r[i][0] = Date.create(r[i][0]).format("{M}/{d}/{yy} {hh}:{mm}");
				}
				
				//add commas to the numbers
				for (var j = 0; j < r[i].length; j++) {
					r[i][j] = this.addCommas(r[i][j]);
				}

				$("<tr><td>"+r[i].join("</td><td>")+"</td></tr>")
					.addClass(i%2 === 0? "otherrow":"row")
					.appendTo($table);
			}
		}

		// append to 
		this.outputTableAsHtml($table);
	},


	// table_el is a jQuery element
	outputTableAsHtml: function(table_el){
		var html_str = table_el.parent().html();
		// throw in some sloppy newline subbing
		html_str = html_str.replace(/(<(?:tbody|thead))/g, "\n$1");
		html_str = html_str.replace(/(<\/(?:tr|tbody|thead)>)/g, "$1\n");
		html_str = html_str.split("<tbody><tr>").join("<tbody>\n<tr>");
		html_str = $.trim(html_str);
		$('#table-html').val(html_str);
	},
	floatAll: function(a) {
		for (var i=0; i < a.length; i++) {
			if(a[i] && a[i].length > 0 && (/[\d\.\$£€\%]+/).test(a[i])) {
				a[i] = parseFloat(a[i]);
			}
			else {
				a[i] = null;
			}
		}
		return a;
	},
	dateAll: function(a) {
		for (var i=0; i < a.length; i++) {
			a[i] = Date.create(a[i]);
		}
		return a;
	},
	doNothing: function(a) {
		return a;
	},
	inlineAllStyles: function() {
		var chartStyle, selector, cssText;

		// Get rules from gneisschart.css
		for (var i = 0; i <= document.styleSheets.length - 1; i++) {
			if (document.styleSheets[i].href && document.styleSheets[i].href.indexOf('gneisschart.css') != -1) {
				if (document.styleSheets[i].rules != undefined) {
					chartStyle = document.styleSheets[i].rules
				} else {
					chartStyle = document.styleSheets[i].cssRules
				}
			}
		}

		if (chartStyle != null && chartStyle != undefined) {
			for (var i = 0; i < chartStyle.length; i++) {
				if (chartStyle[i].type == 1) {
					selector = chartStyle[i].selectorText;
					styles = ChartBuilder.makeStyleObject(chartStyle[i]);
					d3.selectAll(selector).style(styles)
				}
			};
		}
	},
	makeStyleObject: function(rule) {
		var styleDec = rule.style;
		var output = {};
		var s;

		for (s = 0; s < styleDec.length; s++) {
			output[styleDec[s]] = styleDec[styleDec[s]];
		}

		return output;
	},
	createChartImage: function() {
		// Create PNG image
		var canvas = document.getElementById("canvas");
		canvas.width = $("#chartContainer").width() * 2;
		canvas.height = $("#chartContainer").height() *2;

		var canvasContext = canvas.getContext("2d");
		var svg = $.trim(document.getElementById("chartContainer").innerHTML);
		canvasContext.drawSvg(svg,0,0);
		
		
		var filename = [];
		for (var i=0; i < chart.series().length; i++) {
			filename.push(chart.series()[i].name);
		}
		
		if(chart.title().length > 0) {
			filename.unshift(chart.title());
		}
		
		filename = filename.join("-").replace(/[^\w\d]+/gi, '-');
		
		
		$("#downloadImageLink").attr("href",canvas.toDataURL("png"))
			.attr("download",function(){ return filename + "_chartbuilder.png";
			});
			
			
		var svgContent = this.createSVGContent(document.getElementById("chart"));
		
		$("#downloadSVGLink").attr("href","data:text/svg,"+ svgContent.source[0])
			.attr("download",function(){ return filename + "_chartbuilder.svg";});

			var icon = this.setFavicon();
			this.storeLocalChart(filename);

		if(!(/Apple/).test(navigator.vendor)) {
			//blobs dont work in Safari so don't use that method

			var link = document.getElementById('downloadImageLink');
			var base64 = canvas.toDataURL("png").split(",")[1];
			var bytes = window.atob(base64);
			var ui8a = new Uint8Array(bytes.length);

			for (var i = 0; i < bytes.length; i++)
				ui8a[i] = bytes[i].charCodeAt(0);

			var blob = new Blob([ui8a], { type: 'image/png' });
			var url = URL.createObjectURL(blob);
			link.href = url;
			
			link = document.getElementById('downloadSVGLink');
			blob = new Blob(svgContent.source, { type: '"text\/xml"' });
			url = URL.createObjectURL(blob);
			link.href = url;
		}
		
	},
	createSVGContent: function(svg) {
		/*
			Copyright (c) 2013 The New York Times

			Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
			The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

			SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
		*/

		//via https://github.com/NYTimes/svg-crowbar

		var prefix = {
			xmlns: "http://www.w3.org/2000/xmlns/",
			xlink: "http://www.w3.org/1999/xlink",
			svg: "http://www.w3.org/2000/svg"
		};

		var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';


		svg.setAttribute("version", "1.1");

		var defsEl = document.createElement("defs");
		svg.insertBefore(defsEl, svg.firstChild); //TODO   .insert("defs", ":first-child")

		var styleEl = document.createElement("style");
		defsEl.appendChild(styleEl);
		styleEl.setAttribute("type", "text/css");


		// removing attributes so they aren't doubled up
		svg.removeAttribute("xmlns");
		svg.removeAttribute("xlink");

		// These are needed for the svg
		if (!svg.hasAttributeNS(prefix.xmlns, "xmlns")) {
			svg.setAttributeNS(prefix.xmlns, "xmlns", prefix.svg);
		}

		if (!svg.hasAttributeNS(prefix.xmlns, "xmlns:xlink")) {
			svg.setAttributeNS(prefix.xmlns, "xmlns:xlink", prefix.xlink);
		}

		var source = (new XMLSerializer()).serializeToString(svg).replace('</style>', '<![CDATA[' + styles + ']]></style>');

		return {svg: svg, source: [doctype + source]};
	},
	setFavicon: function() {
		//set favicon to image of chart
		var favicanvas = document.getElementById("favicanvas");
		favicanvas.width = 64;
		favicanvas.height = 64;
		
		var faviCanvasContext = favicanvas.getContext("2d");
		faviCanvasContext.translate(favicanvas.width / 2, favicanvas.height / 2);
		
		var svg = $.trim(document.getElementById("chartContainer").innerHTML);
		faviCanvasContext.drawSvg(svg,-16,-8,32,32);
		
		var icon = favicanvas.toDataURL("png");
		$("#favicon").attr("href",icon);
		
		return icon;
	},
	redraw: function() {
		$(".seriesItemGroup").detach();
		var g = chart;
		var s;
		var picker;
		var typer;
		var axer;
		this.customLegendLocaion = false;
		var colIndex = g.seriesByType().line.length;
		var lineIndex = 0;
		var bargridIndex = 0;
		var scatterIndex = 0;
		var seriesContainer = $("#seriesItems");
		var isMultiAxis = false;
		var colors = g.colors();
		var i;
		
		for (i=0; i < g.series().length; i++) {
			s = g.series()[i];
			seriesItem = $('<div class="seriesItemGroup">\
				<label for="'+this.idSafe(s.name)+'_color">'+s.name+'</label>\
				<input id="'+this.idSafe(s.name)+'_color" name="'+this.idSafe(s.name)+'" type="text" />\
				<select class="typePicker" id="'+this.idSafe(s.name)+'_type">\
					<option '+(s.type=="line"?"selected":"")+' value="line">Line</option>\
					<option '+(s.type=="column"?"selected":"")+' value="column">Column</option>\
					<option '+(s.type=="bargrid"?"selected":"")+' '+(g.xAxis().type == "date"?"disabled":"")+' value="bargrid">Bar Grid</option>\
					<option '+(s.type=="scatter"?"selected":"")+' value="scatter">Scatter</option>\
				</select>\
				<input id="'+this.idSafe(s.name)+'_check" name="'+this.idSafe(s.name)+'_check" type="checkbox" />\
				<div class="clearfix"></div>\
			</div>');
			var color = s.color ? s.color.replace("#","") : colors[i].replace("#","");
			s.color = "#" + color;
			
			seriesContainer.append(seriesItem);
			picker = seriesItem.find("#"+this.idSafe(s.name)+"_color").colorPicker({pickerDefault: color, colors:this.allColors});
			typer = seriesItem.find("#"+this.idSafe(s.name)+"_type");
			axer = seriesItem.find("#"+this.idSafe(s.name)+"_check");
			
			if(g.series()[i].axis == 1) {
				axer.prop("checked",true);
				if(!g.yAxis()[1].color || !isMultiAxis) {
					g.yAxis()[1].color = picker.val();
				}
				isMultiAxis = true;
			}
			else {
				axer.prop("checked",false);
			}
												
			seriesItem.data("index",i);
			picker.change(function() {
				chart.series()[$(this).parent().data().index].color = $(this).val();
				ChartBuilder.redraw();
			});
			typer.change(function() {
				var val = $(this).val();
				var index = $(this).parent().data().index;
				chart.series()[index].type = val;
				if(val == "column") {
					//if you're making a column chart, force the yAxis to span 0
					var axis = chart.yAxis()[chart.series()[$(this).parent().data().index].axis];
					if(axis.domain[1] > 0) {
						axis.domain[0] = Math.min(axis.domain[0],0);
					}
					else {
						axis.domain[1] = 0;
					}
				}

				var hasBargrid = false;
				chart.setPadding();
				ChartBuilder.setChartArea();
				chart.setXScales()
					.resize();
				ChartBuilder.redraw();

			});
			
			axer.change(function() {
				var axis = $(this).is(':checked') ? 1 : 0;
				chart.series()[$(this).parent().data().index].axis = axis;
				
				if(!chart.yAxis()[axis]) {
					chart.yAxis()[axis] = {
						domain: [null, null],
						tickValues: null,
						prefix: {
							value: "",
							use: "top" //can be "top", "all", "positive", or "negative"
						},
						suffix: {
							value: "",
							use: "top"
						},
						ticks: 4,
						formatter: null,
						color: null
					};
				}
				
				var leftAxisIsUsed = false;
				for(var i = 0; i < chart.series().length; i++) {
					if(chart.series()[i].axis == 1) {
						leftAxisIsUsed = true;
					}
				}
				
				if(chart.yAxis().length > 1 && !leftAxisIsUsed)
				{
					chart.yAxis().pop();
				}
				
				chart.setYScales()
					.setYAxes()
					.setLineMakers();
				ChartBuilder.redraw();
			});
			
			chart.redraw();
			this.makeLegendAdjustable();
		}
		
		
		var yAxisObj = [];
		for (i = g.yAxis().length - 1; i >= 0; i--){
			var cur = g.yAxis()[i];
			yAxisObj[i] = {
				domain: cur.domain,
				tickValues: cur.tickValues,
				prefix: cur.prefix,
				suffix: cur.suffix,
				ticks: cur.ticks,
				formatter: cur.formatter
			};
		}
		
		var xAxisObj = {
			domain: g.xAxis().domain,
			prefix: g.xAxis().prefix,
			suffix: g.xAxis().suffix,
			type: g.xAxis().type,
			formatter: g.xAxis().formatter
		};
		
		if(isMultiAxis){
			$("#leftAxisControls").removeClass("hide");
		}
		else {
			$("#leftAxisControls").addClass("hide");
		}
		
		var state = {
			container: g.containerElement(),
			colors: g.colors(),
			title: g.title(),
			padding : g.padding(),
			xAxis: xAxisObj,
			yAxis: yAxisObj,
			series: g.series(),
			xAxisRef: g.xAxisRef(),
			sourceline: g.source(),
			creditline: g.credit()
		};
		
		//chart = g;
		ChartBuilder.updateInterface();
		ChartBuilder.inlineAllStyles();
	},
	updateInterface: function() {
		if(chart.xAxis().type == "date") {
			$(".showonlywith-date").removeClass("hide");
		}

		if(chart.xAxis().type == "ordinal") {
			$(".showonlywith-ordinal").removeClass("hide");
		}

		if(chart.xAxis().type != "date") {
			$(".showonlywith-date").addClass("hide");
		}

		if(chart.xAxis().type != "ordinal") {
			$(".showonlywith-ordinal").addClass("hide");
		}

		if(this.advancedMode) {
			$(".advanced").removeClass("hide");
		}
		else {
			$(".advanced").addClass("hide");
		}
	},
	setChartArea: function() {
		var hasBargrid = false;
		for (var i = chart.series().length - 1; i >= 0; i--){
			if(chart.series()[i].type == "bargrid") {
				hasBargrid = true;
				break;
			}
		}
		
		if(hasBargrid) {
			$("#chartContainer").css("height",
				chart.series()[0].data.length * (chart.bargridBarThickness() + 2) + //CHANGE - MAGIC NUMBER
				chart.padding().top +
				chart.padding().bottom
				);
		}
		else {
			$("#chartContainer").removeAttr("height").css("height","");
		}
	},
	makeLegendAdjustable: function() {
		
		var legendLabelDrag = d3.behavior.drag()
			.origin(Object)
			.on("dragstart",function(d){
				elem = d3.select(this);
				d3.select(elem[0][0].parentNode).selectAll("rect").style("display","none");
				if(!ChartBuilder.customLegendLocaion) {
					chart.legend(false);
					chart.redraw();
					ChartBuilder.inlineAllStyles();
					ChartBuilder.makeLegendAdjustable();
					ChartBuilder.customLegendLocaion = true;
				}
				
			})
			.on("drag", function(d){
				elem = d3.select(this);
				elem.attr("x", Number(elem.attr("x")) + d3.event.dx)
					.attr("y", Number(elem.attr("y")) + d3.event.dy);
					
				
		});
		d3.selectAll("text.legendLabel").call(legendLabelDrag);
		
		
	},
	getAllInputData: function() {
		var d = {}, $el;
		var elems = $("input, textarea, select:not(#previous_charts)").each(function() {
			$el = $(this);
			d[$el.attr("id")] = $el.val();
		});
		return d;
	},
	storeLocalChart: function(name) {
		try {
			var testassignment = localStorage["savedCharts"][0];
		}
		catch(e) {
			localStorage["savedCharts"] = JSON.stringify([]);
		}
		
		var allcharts = JSON.parse(localStorage["savedCharts"]);
		newChart = this.getAllInputData();
		newChart.name = name;
		allcharts.push(newChart);
		localStorage["savedCharts"] = JSON.stringify(allcharts);
	},
	getLocalCharts: function() {
		var charts = [];
		try {
			charts = JSON.parse(localStorage["savedCharts"]);
		}
		catch(e){ /* Fail Silently */}
		
		return charts;
	},
	loadLocalChart: function(d) {
		for (var key in d) {
			if(key != "name") {
				$("#"+key).val(d[key]);
				//$("#"+key).text(d[key])
			}
		}
		$("input, textarea, select:not(#previous_charts)").keyup().change();
	},
	idSafe: function(s) {
		s = s.replace(/[^\w\d]+/gi,"-");
		return s;
	},
	addCommas: function(nStr)
	{
		if(Number(nStr) + "" == nStr) {
			//if the string is a number return a localized string
			return Number(nStr).toLocaleString()
		}

		//else return the string
		return nStr
	},
	determineLocaleNumberSeps: function() {
		var n = 1000.50;
		var l = n.toLocaleString();
		return {decimal: l.substring(5,6), thousands: l.substring(1,2)};
	},
	actions: {
		axis_prefix_change: function(index,that) {
			chart.yAxis()[index].prefix.value = $(that).val();
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		},
		axis_suffix_change: function(index,that) {
			chart.yAxis()[index].suffix.value = $(that).val();
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		},
		axis_tick_num_change: function(index,that) {
			chart.yAxis()[index].ticks = parseInt($(that).val(),10);
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		},
		axis_max_change: function(index,that) {
			var val = parseFloat($(that).val());
			if(isNaN(val)) {
				val = null;
			}
			chart.yAxis()[index].domain[1] = val;
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		},
		axis_min_change: function(index,that) {
			var val = parseFloat($(that).val());
			if(isNaN(val)) {
				val = null;
			}
			chart.yAxis()[index].domain[0] = val;
			chart.setYScales();
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		},
		axis_tick_override_change: function(index,that) {
			var val = $(that).val();
			val = val.split(",");
			if(val.length > 1) {
				for (var i = val.length - 1; i >= 0; i--){
					val[i] = parseFloat(val[i]);
				}
			}
			else {
				val = null;
			}
			chart.yAxis()[index].tickValues = val;
			chart.setYScales();
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		}
	},
	showInvalidData: function() {
		$("#inputDataHeading").addClass("inputDataHInvData");
		$("#invalidDataSpan").removeClass("hide");
	},
	hideInvalidData: function() {
		$("#inputDataHeading").removeClass("inputDataHInvData");
		$("#invalidDataSpan").addClass("hide");
	}
};

// Create default config for chartbuilder
ChartBuilder.getDefaultConfig = function() {
  var chartConfig = {};
  chartConfig.colors = ["#BF0053","#FF70B0","#E15D98","#C44B81","#A63869","#882551","#6B133A","#4D0022",
						"#BF600A","#FFC07E","#E1A76A","#C48D55","#A67341","#885A2D","#6B4118","#4D2704",
						"#BFAA00","#FFF270","#E1D55D","#C4B84B","#A69C38","#887F25","#6B6213","#4D4500",
						"#00BFA5","#70FFF7","#5DE1D9","#4BC4BC","#38A69E","#258880","#136B63","#004D45",
						"#006DBF","#70B8FF","#5DA1E1","#4B89C4","#3871A6","#255A88","#13436B","#002B4D",
						"#9300BF","#E770FF","#CB5DE1","#AE4BC4","#9238A6","#752588","#59136B","#3C004D"];
  chartConfig.creditline = "Made with Chartbuilder";
  
  return chartConfig;
};

// Starts applicatoin given config object
ChartBuilder.start = function(config) {

  // Create config
  var chartbuilderDefaultConfig = ChartBuilder.getDefaultConfig();
  var chartConfig = $.extend(true, Gneiss.defaultGneissChartConfig, chartbuilderDefaultConfig, config);
  
  $(document).ready(function() {
	
	//construct a Gneisschart using default data
	//this should change to be more like this http://bost.ocks.org/mike/chart/
  chart = new Gneiss(chartConfig);
  
	// Scale the chart up so the outputted image looks good on retina displays
	$("#chart").attr("transform", "scale(2)");
	
	//populate the input with the data that is in the chart
	$("#csvInput").val(function() {
		var data = [];
		var val = "";
		var i;

		data[0] = chart.xAxisRef()[0].data;
		data[0].unshift(chart.xAxisRef()[0].name);

		for (i = 0; i < chart.series().length; i++) {
			data[i+1] = chart.series()[i].data;
			data[i+1].unshift(chart.series()[i].name);
		}

		data = ChartBuilder.pivotData(data);

		for (i = 0; i < data.length; i++) {
			data[i] = data[i].join("\t");
		}
		return data.join("\n");
	});


	//load previously made charts
	var savedCharts = ChartBuilder.getLocalCharts();
	var chartSelect = d3.select("#previous_charts")
					.on("change",function() {
						ChartBuilder.loadLocalChart(d3.select(this.selectedOptions[0]).data()[0]);
					});
	
	chartSelect.selectAll("option")
			.data(savedCharts)
			.enter()
			.append("option")
			.text(function(d){return d.name?d.name:"Untitled Chart";});
			
	
	$("#createImageButton").click(function() {
		ChartBuilder.inlineAllStyles();

		if($("#downloadLinksDiv").hasClass("hide")) {
			ChartBuilder.createChartImage();
		}
		$("#downloadLinksDiv").toggleClass("hide");
	});

	$("#csvInput").bind("paste", function(e) {
	//do nothing special
	});

	/*
	//
	// add interactions to chartbuilder interface
	//
	*/
	
	$("#csvInput").keyup(function() {
		//check if the data is different
		if( $(this).val() != ChartBuilder.curRaw) {
			//cache the the raw textarea value
			ChartBuilder.curRaw = $(this).val();
			
			if($("#right_axis_max").val().length === 0 && $("#right_axis_min").val().length === 0) {
					chart.yAxis()[0].domain = [null,null];
			}
			
			if(chart.yAxis().length > 1 && $("#left_axis_max").val().length === 0 && $("#left_axis_min").val().length === 0) {
					chart.yAxis()[1].domain = [null,null];
			}
			
			var csv = $("#csvInput").val();
			var newData = ChartBuilder.getNewData(csv);
			if(newData === null) {
					ChartBuilder.showInvalidData();
				return;
			}
  
			dataObj = ChartBuilder.makeDataObj(newData);
			if(dataObj === null) {
					ChartBuilder.showInvalidData();
				return;
			}
				ChartBuilder.hideInvalidData();

			if(dataObj.datetime) {
				chart.xAxis().type = "date";
				
				//when there is new datetime data, always autopick the the xaxis format
				var formatter = "";
				var firstDate = dataObj.data[0].data[0];
				var secondDate = dataObj.data[0].data[dataObj.data[0].data.length - 1];
				var timeSpan = Math.max(firstDate,secondDate) - Math.min(firstDate,secondDate);
				months = timeSpan/2592000000;
				years = timeSpan/31536000000;
				days = timeSpan/86400000;
				hours = timeSpan/3600000;
								
				if(years > 15) {
					formatter = "yy";
				}
				else if(years > 1) {
					formatter = "yyyy";
				}
				else if(months > 2){
					formatter = "M";
				}
				else if (days > 3){
					formatter = "Mdd";
				}
				else {
					formatter = "hmm"
				}

				chart.xAxis().formatter = formatter;
				
			}
			else {
				chart.xAxis().type = "ordinal";
				chart.xAxis().formatter = null;
			}
  
			ChartBuilder.createTable(newData, dataObj.datetime);
			
			chart.series().unshift(chart.xAxisRef);
			dataObj = ChartBuilder.mergeData(dataObj);
			
			//TODO add a linear scale type

			chart.xAxisRef([dataObj.data.shift()]);
			
			chart.series(dataObj.data);

			//if there is only one series (and isn't a bargrid), make the name of it the title and fill the title box
			if(!chart.isBargrid()) {
				if(chart.series().length === 1 && chart.title().length === 0 || chart.title() === chart.series()[0].name) {
					chart.title(chart.series()[0].name);
					chart.titleElement().text(chart.title());
					$("#chart_title").val(chart.title());
				}
			}

			chart.setPadding();
			
			ChartBuilder.setChartArea();
			
			chart.setYScales()
				.setXScales()
				.setLineMakers();
				
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		}
  
	}).keyup();
	
	$("#right_axis_prefix").keyup(function() {
		ChartBuilder.actions.axis_prefix_change(0,this);
	});
	
	$("#right_axis_suffix").keyup(function() {
		ChartBuilder.actions.axis_suffix_change(0,this);
	});
	
	$("#right_axis_tick_num").change(function() {
		ChartBuilder.actions.axis_tick_num_change(0,this);
	});
	
	$("#right_axis_max").keyup(function() {
		ChartBuilder.actions.axis_max_change(0,this);
	});
	
	$("#right_axis_min").keyup(function() {
		ChartBuilder.actions.axis_min_change(0,this);
	});
	
	$("#right_axis_tick_override").keyup(function() {
		ChartBuilder.actions.axis_tick_override_change(0,this);
	});
	
	$("#x_axis_tick_num").change(function() {
		chart.xAxis().ticks = parseInt($(this).val(),10);
		ChartBuilder.redraw();
		ChartBuilder.inlineAllStyles();
	});
	
	$("#x_axis_tick_date_frequency").change(function(){
		var val = $(this).val().split(" ");
		//if the selected option has two words set it as the number of ticks
		//else set ticks to null
		chart.xAxis().ticks = val.length > 1 ? val : null;
		ChartBuilder.redraw();
		ChartBuilder.inlineAllStyles();
	});
	
	$("#left_axis_prefix").keyup(function() {
		ChartBuilder.actions.axis_prefix_change(1,this);
	});
  
	$("#left_axis_suffix").keyup(function() {
		ChartBuilder.actions.axis_suffix_change(1,this);
	});
  
	$("#left_axis_tick_num").change(function() {
		ChartBuilder.actions.axis_tick_num_change(1,this);
	});
  
	$("#left_axis_max").keyup(function() {
		ChartBuilder.actions.axis_max_change(1,this);
	});
  
	$("#left_axis_min").keyup(function() {
		ChartBuilder.actions.axis_min_change(1,this);
	});
  
	$("#left_axis_tick_override").keyup(function() {
		ChartBuilder.actions.axis_tick_override_change(1,this);
	});
	
	$("#x_axis_date_format").change(function() {
		var val = $(this).val();
		chart.xAxis().formatter = val;

		if(val == "QJul" || val == "QJan") {
			$("#x_axis_tick_date_frequency")
			.val("3 months")
			.change()
			.attr("disabled","");
		}
		else {
			$("#x_axis_tick_date_frequency").removeAttr("disabled");
		}


		ChartBuilder.redraw();
		ChartBuilder.inlineAllStyles();
	});
	
	$("#creditLine").keyup(function() {
		var val = $(this).val();
		chart.credit(val);
		chart.creditElement().text(chart.credit());
	});
		
	$("#sourceLine").keyup(function() {
		var val = $(this).val();
		chart.source(val);
		chart.sourceElement().text(chart.source());
	});
	
	$("#chart_title").keyup(function() {
		var val = $(this).val();
		chart.title(val);
		chart.resize()
			.setPadding();
		ChartBuilder.setChartArea();
		chart.setYScales()
			.redraw();
		ChartBuilder.makeLegendAdjustable();
		
		chart.titleElement().text(chart.title());
	});
	
	$(".downloadLink").click(function() {
		$("#downloadLinksDiv").toggleClass("hide");
	});

	//store the decimal and thousands separators
	ChartBuilder.separators = ChartBuilder.determineLocaleNumberSeps();

  });
};
