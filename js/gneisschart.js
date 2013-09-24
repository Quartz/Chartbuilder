/*
`````````````````````````````````````````````````````````````````````````````````````````````````````````````````````
```````````***`````````````***```````***```````````***````````````******```````````************``````************````
```````***********`````````***```````***``````````*****```````````**********```````************``````************````
`````***`````````***```````***```````***`````````***`***``````````***`````***``````````***```````````````````***`````
````***```````````***``````***```````***````````***```***`````````***``````***`````````***`````````````````***```````
````***```````````***``````***```````***```````***`````***````````***********``````````***```````````````***`````````
````***``````***`***```````***```````***``````*************```````*********````````````***``````````````***``````````
`````***```````****`````````***`````***``````***************``````***````***```````````***````````````***````````````
```````*************`````````*********``````***```````````***`````***`````***``````````***```````````************````
```````````***`````**```````````***````````***`````````````***````***``````***`````````***```````````************````
`````````````````````````````````````````````````````````````````````````````````````````````````````````````````````
*/
var yAxisIndex;

//add prepend ability
Element.prototype.prependChild = function(child) { this.insertBefore(child, this.firstChild); };

Date.setLocale('en');

//A default configuration 
//Should change to more d3esque methods e.g. http://bost.ocks.org/mike/chart/
Gneiss.defaultGneissChartConfig = {
	container: "#chartContainer", //css id of target chart container
	editable: true, // reserved for enabling or dissabling on chart editing
	lineDotsThreshold: 15,
	primaryAxisPosition: "right",
	legend: true, // whether or not there should be a legend
	title: "", // the chart title 
	colors: ["#ff4cf4","#ffb3ff","#e69ce6","#cc87cc","#b373b3","#995f99","#804c80","#665266","#158eff","#99cdff","#9cc2e6","#87abcc","#7394b3","#5f7d99","#466780","#525c66"], //this is the order of colors that the 
	padding :{
		top: 25,
		bottom: 50,
		left: 10,
		right: 10
	},
	xAxis: {
		domain: [0,100],
		prefix: "",
		suffix: "",
		type: "linear",
		formatter: null,
		mixed: true,
		ticks: 5
	},
	yAxis: [
		{
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
			color: null
		}
	],
	series: [
		{
			name: "apples",
			data: [5.5,10.2,6.1,3.8],
			source: "Some Org",
			type: "line",
			axis: 0,
			color: null
		},
		{
			name: "oranges",
			data: [23,10,13,7],
			source: "Some Org",
			type: "line",
			axis: 0,
			color: null
		}
	],
	xAxisRef: [
		{
			name: "names",
			data: ["juicyness","color","flavor","travelability"]
		}
	],
	sourceline: "",
	creditline: "Made with Chartbuilder"
};

Gneiss.dateParsers = {
  "mmddyyyy": function(d) { return [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/"); },
  "ddmmyyyy": function(d) { return [d.getDate(), d.getMonth() + 1, d.getFullYear()].join("/"); },
  "mmdd": function(d) { return [d.getMonth() + 1, d.getDate()].join("/"); },
  "Mdd": function(d) {
    var month = d.getMonth() + 1;
    if(month == 5) {
      return d.format('{Mon}') + " " + d.getDate();
    } 
    else { 
      return d.format('{Mon}.') + " " + d.getDate();
    }
  },
  "ddM": function(d) {
    var month = d.getMonth() + 1;
    if(month == 5) {
      return "" + d.getDate() + " " + d.format('{Mon}');
    } 
    else { 
      return "" + d.getDate() + " " + d.format('{Mon}.');
    }
  },
  "mmyy": function(d) { return [d.getMonth() + 1, String(d.getFullYear()).split("").splice(2,2).join("")].join("/"); },
  "yy": function(d) { return "’" + String(d.getFullYear()).split("").splice(2,2).join(""); },
  "yyyy": function(d) { return "" + d.getFullYear(); },
  "MM": function(d) {
    var month = d.getMonth() + 1;
    if(month == 1) {
      return "" + d.getFullYear();
    }
    else {
      return d.format('{Month}');
    }
  },
  "M": function(d) {	
    var month = d.getMonth() + 1;
    if(month == 1) {
      return "’" + String(d.getFullYear()).split("").splice(2,2).join("");
    } 
    else if(month == 5) {
      return d.format('{Mon}');
    }
    else {
      return d.format('{Mon}.');
    }
  },
  "hmm": function(d) {
    if(Date.getLocale().code == 'en') {
      return d.format('{12hr}:{mm}');
    } else {
      return d.format('{24hr}:{mm}');
    }
  }
};

Gneiss.helper = {
  multiextent: function(a, key) {
    // Find the min and max values of multiple arrays
    var data = [];
    var ext;
    
    for (var i = a.length - 1; i >= 0; i--) {
      ext = d3.extent(key ? key(a[i]) : a[i]);
      data.push(ext[0]);
      data.push(ext[1]);
    }
    
    return d3.extent(data);
  },
  columnXandHeight: function(d, domain) {
    //a function to find the proper value to cut off a column
    if(d > 0 && domain[0] > 0) {
      return domain[0];
    }
    else if (d < 0 && domain[1] < 0) {
      return domain[1];
    }			
    return 0;
  },
  exactTicks: function(domain,numticks) {
    numticks -= 1;
    var ticks = [];
    var delta = domain[1] - domain[0];
    for (var i=0; i < numticks; i++) {
      ticks.push(domain[0] + (delta/numticks)*i);
    };
    ticks.push(domain[1]);
    
    if(domain[1]*domain[0] < 0) {
      //if the domain crosses zero, make sure there is a zero line
      var hasZero = false;
      for (var i = ticks.length - 1; i >= 0; i--) {
        //check if there is already a zero line
        if(ticks[i] == 0) {
          hasZero = true;
        }
      };
      if(!hasZero) {
        ticks.push(0);
      }
    }
    
    return ticks;
  },  
  transformCoordOf: function(elem){
    var separator = elem.attr("transform").indexOf(",") > -1 ? "," : " ";
    var trans = elem.attr("transform").split(separator);
    return { x: (trans[0] ? parseFloat(trans[0].split("(")[1]) : 0), y: (trans[1] ? parseFloat(trans[1].split(")")[0] ): 0) };
  }
};

function Gneiss(config)
{ 	
	var containerElement;
	var defaultPadding;
	var containerId;
	var seriesByType;
	var width;
	var height;
	var isBargrid;
	
	this.containerId = function Gneiss$containerId(elem) {
		if (!arguments.length) {
			return containerId;
		}
		containerId = elem;
	};
	
	this.containerElement = function Gneiss$containerElement(elem) {
		if (!arguments.length) {
			return containerElement;
		}
		containerElement = elem;
	};
	
	this.defaultPadding = function Gneiss$defaultPadding(padding) {
		if (!arguments.length) {
			return defaultPadding;
		}
		defaultPadding = padding;
	};
	
	this.width = function Gneiss$width(w) {
		if (!arguments.length) {
			return width;
		}
		width = w;
	};
	
	this.height = function Gneiss$height(h) {
		if (!arguments.length) {
			return height;
		}
		height = h;
	};
	
	this.seriesByType = function Gneiss$seriesByType(sbt) {
		if (!arguments.length) {
			return seriesByType;
		}
		seriesByType = sbt;
	};
	
	this.isBargrid = function Gneiss$isBargrid(b) {
		if (!arguments.length) {
			return isBargrid;
		}
		isBargrid = b;
	};
	
	this.build = function Gneiss$build(config) {
		/*
			Initializes the chart from a config object
		*/
		
		if(!config) {
			throw new Error("build() must be called with a chart configuration");
		}
		
		$.extend(this, config);
		var g = this;
		 
		// Set container as a jQuery object wrapping the DOM element specified in the config
		if(!config.container) {
			throw new Error("build() must be called with a chart configuration with a 'container' property");
		}
		
		g.containerId(config.container);
		g.containerElement($(g.containerId()));
				
		g.defaultPadding($.extend({}, config.padding)); // deep copy the padding configuration
		
		//append svg to container using svg
		g.chart = d3.select(g.containerId()).append("svg")
			.attr("id","chart")
			.attr("width","100%") //set width to 100%
			.attr("height","100%"); //set height to 100%
			
		g.width(g.containerElement().width()); //save the width in pixels
		g.height(g.containerElement().height()); //save the height in pixels
		
		//add rect, use as a background to prevent transparency
		g.chart.append("rect")
			.attr("id","ground")
			.attr("width", g.width())
			.attr("height", g.height());
			
		//add a rect to allow for styling of the chart area
		g.chart.append("rect")
			.attr("id","plotArea")
			.attr("width", g.width())
			.attr("height", g.height())
		
		//group the series by their type
		g.seriesByType(this.splitSeriesByType(g.series));
		this.updateGraphPropertiesBasedOnSeriesType(g, g.seriesByType());
		
		g.titleLine = g.chart.append("text")
			.attr("y",18)
			.attr("x", g.padding.left)
			.attr("id","titleLine")
			.text(g.title);
		
		this.calculateColumnWidths()
			.setYScales(true)
			.setXScales(true)
			.setYAxes(true)
			.setXAxis(true);
				
		this.drawSeriesAndLegend(true);
		
		g.metaInfo = g.chart.append("g")
			.attr("id","metaInfo")
			.attr("transform","translate(0," + (g.height() - 4) + ")");
		
		g.sourceLine = g.metaInfo.append("text")
			.attr("text-anchor", "end")
			.attr("x", g.width() - g.padding.right)
			.attr("class", "metaText")
			.text(g.sourceline);
		
		g.creditLine = g.metaInfo.append("text")
			.attr("x", g.padding.left)
			.attr("class", "metaText")
			.text(g.creditline);
      
		return this;
	};
  
	this.numberFormat = d3.format(",");
  
	this.resize = function Gneiss$resize(){
		/*
			Adjusts the size dependent stored variables
		*/
		var g = this;
    
		// Save the width and height in pixels
		g.width(g.containerElement().width());
		g.height(g.containerElement().height());
    
		// Insert a background rectangle to prevent transparency
		d3.select("rect#ground")
			.attr("width", g.width())
			.attr("height", g.height());
      
		g.metaInfo.attr("transform", "translate(0," + (g.height() - 4) + ")");
		
		return this;
	};
  
  this.setYScales = function Gneiss$setYScales(first) {
		/*
			calculates and saves the y-scales from the existing data
		*/
		var g = this;
		/*
		*
		* Y AXIS SECTION
		*
		*/	
		//calculate number of yaxes and their maxes and mins
		var axisIndex = 0;
		var extremes = [];
		var ex;
		for (var i = g.series.length - 1; i >= 0; i--){
			
			//CHANGE if there is no axis set to 0
			if(!g.series[i].axis) {
				g.series[i].axis = 0;
			}
					
			axisIndex = g.series[i].axis;			
			
			//CHANGE check if there are any extremes for the current axis
			if(extremes[axisIndex] === undefined) {
				extremes[axisIndex] = [];
			}			
			
			if(g.yAxis[axisIndex] === undefined) {
				console.error(g.series[i].name + " ["+i+"] is associated with axis " + axisIndex + ", but that axis does not exist");
			}
			
			//calculate extremes of current series and add them to extremes array
			e = d3.extent(g.series[i].data);
			extremes[axisIndex].push(e[0]);
			extremes[axisIndex].push(e[1]);
		};
		
		for (var i = extremes.length - 1; i >= 0; i--){
			var ex = d3.extent(extremes[i])
			if(g.yAxis[i].domain[0] == null) {
				g.yAxis[i].domain[0] = ex[0];
			}
			
			if(g.yAxis[i].domain[1]  == null) {
				g.yAxis[i].domain[1] = ex[1];
			}
		};
		
		//set extremes in y axis objects and create scales
		for (var i = g.yAxis.length - 1; i >= 0; i--) {
			//g.yAxis[i].domain = d3.extent(extremes[i])
			if(first || !g.yAxis[i].scale) {
				g.yAxis[i].scale = d3.scale.linear()
					.domain(g.yAxis[i].domain);
			}
			else {
				//set extremes in y axis objects and update scales
				g.yAxis[i].domain = d3.extent(g.yAxis[i].domain);
				g.yAxis[i].scale.domain(g.yAxis[i].domain);
			}	
		};		
		
		if(g.isBargrid()) {
			for (var i = g.yAxis.length - 1; i >= 0; i--){
				g.yAxis[i].domain[0] = Math.min(g.yAxis[i].domain[0],0);
				g.yAxis[i].scale.range([
					g.padding.left,
					(g.width() / g.seriesByType().bargrid.length) - g.padding.right
					]).nice();				
			};
		}
		else {
			for (var i = g.yAxis.length - 1; i >= 0; i--){
				g.yAxis[i].scale.range([
					g.height() - g.padding.bottom,
					g.padding.top
					]).nice();
			};
		}
		
		return this;
	};
  
	this.setPadding = function Gneiss$setPadding() {
		/*
			calulates and stores the proper amount of extra padding beyond what the user specified (to account for axes, titles, legends, meta)
		*/
		var g = this,
			padding_top = g.defaultPadding().top,
			padding_bottom = g.defaultPadding().bottom,
			padding_left = g.defaultPadding().left,
			padding_right = g.defaultPadding.right
		
		
		if(!g.legend) {
			padding_top = 5;
		}
		
		//Add the height of the title line to the padding, if the title line has a height
		title_bottom_margin = 5;
		title_height = g.titleLine[0][0].getBBox().height;
		padding_top += title_height > 0? title_height + title_bottom_margin : 0
		
		//if there is more than one axis or the default axis is on the left and it isn't a bar grid 
		//add enough space for the top axis label
		
		axis_label_height = d3.selectAll(".yAxis text")[0][0].getBBox().height;
		padding_top += (g.yAxis.length == 1 && !g.isBargrid() || g.primaryAxisPosition == "left") ? 0 : axis_label_height + title_bottom_margin;
		
		if(g.isBargrid()) {
			padding_top += -15;
			padding_bottom -= 15;
			
			padding_right += 0;
		}
		
		g.padding.top = padding_top;
		g.padding.bottom = padding_bottom;
		
		d3.select("#plotArea")
			.attr("transform","translate("+g.padding.left+","+g.padding.top+")")
			.attr("width",g.width()-g.padding.left-g.padding.right)
			.attr("height",g.height()-g.padding.top-g.padding.bottom)
			
		return this;
	};
  
  this.setXScales = function Gneiss$setXScales(first) {
		/*
			calculate and store the x-scales
		*/
		var g = this;
		var dateExtent;
		var shortestPeriod = Infinity;
		
		if(first) {
			//create x scales
			
			/*
			*
			* X AXIS SECTION
			*
			*/

			//calculate extremes of axis
			if(g.xAxis.type == "date") {
				dateExtent = d3.extent(g.xAxisRef[0].data);
				g.xAxis.scale = d3.time.scale()
					//.domain(Gneiss.multiextent(g.series,function(d){return d.data}))
					.domain(dateExtent)
				
				//calculate smallest gap between two dates
				for (var i = g.xAxisRef[0].data.length - 2; i >= 0; i--){
					shortestPeriod = Math.min(shortestPeriod, Math.abs(g.xAxisRef[0].data[i] - g.xAxisRef[0].data[i+1]))
				}
				
				g.maxLength = Math.abs(Math.floor((dateExtent[0] - dateExtent[1]) / shortestPeriod))
			}
			else {

				//calculate longest series and store series names
				var maxLength = 0;
				for (var i = g.series.length - 1; i >= 0; i--){
					maxLength = Math.max(maxLength, g.series[i].data.length)
				};
				g.xAxis.scale = d3.scale.ordinal()
					.domain(g.xAxisRef[0].data)
					
				g.maxLength = maxLength;
			}
			
		}
		else {
			//update the existing scales

			//calculate extremes of axis
			if(g.xAxis.type == "date") {
				dateExtent = d3.extent(g.xAxisRef[0].data);
				g.xAxis.scale = d3.time.scale()
					//.domain(Gneiss.multiextent(g.series,function(d){return d.data}))
					.domain(dateExtent)
					
				//calculate smallest gap between two dates
				for (var i = g.xAxisRef[0].data.length - 2; i >= 0; i--){
					shortestPeriod = Math.min(shortestPeriod, Math.abs(g.xAxisRef[0].data[i] - g.xAxisRef[0].data[i+1]))
				}
				
				g.maxLength = Math.abs(Math.floor((dateExtent[0] - dateExtent[1]) / shortestPeriod))
			}
			else {

				//calculate longest series
				var maxLength = 0;
				for (var i = g.series.length - 1; i >= 0; i--){
					maxLength = Math.max(maxLength, g.series[i].data.length)
				};
				g.xAxis.scale.domain(g.xAxisRef[0].data)
				
				g.maxLength = maxLength;
			}
		}
		var rangeArray = []
		//set the range of the x axis
		if(g.isBargrid()) {
			rangeArray = [
				g.padding.top,
				 g.height() - g.padding.bottom
			]
		}
		else if (g.xAxis.hasColumns) {
			rangeArray = [
				g.padding.left + g.columnGroupWidth/2 + (g.yAxis.length==1?0:g.columnGroupWidth/2),
				g.width() - g.padding.right - g.columnGroupWidth
				] 
			//g.xAxis.scale.range([g.padding.left + this.g.columnGroupWidth/2,g.width - g.padding.right - (10* (Math.round(this.g.yAxis[0].domain[1]*3/4*100) + "").length )]) 
		}
		else {
			rangeArray = [g.padding.left, g.width() - g.padding.right]
			//g.xAxis.scale.range([g.padding.left,g.width - g.padding.right])
		};
		
		if(g.xAxis.type == "date") {
			g.xAxis.scale.range(rangeArray);
		}
		else {
			g.xAxis.scale.rangePoints(rangeArray);
		}
		
		return this;		
	};
  
  this.setLineMakers = function Gneiss$setLineMakers(first) {
		var g = this;

		for (var i = g.yAxis.length - 1; i >= 0; i--){
			if(first || !g.yAxis[i].line) {
						g.yAxis[i].line = d3.svg.line();
						g.yAxis[i].line.y(function(d,j){return d||d===0?g.yAxis[yAxisIndex].scale(d):null})
						g.yAxis[i].line.x(function(d,j){return d||d===0?g.xAxis.scale(g.xAxisRef[0].data[j]):null})
			}
			else {
				for (var i = g.yAxis.length - 1; i >= 0; i--){
					g.yAxis[i].line.y(function(d,j){return d||d===0?g.yAxis[yAxisIndex].scale(d):null})
					g.yAxis[i].line.x(function(d,j){return d||d===0?g.xAxis.scale(g.xAxisRef[0].data[j]):null})
				};
			}

		}
		return this;
	};
  
  this.setYAxes = function Gneiss$setYAxes(first) {
		/*
		*
		* Y-Axis Drawing Section
		*
		*/
		var g = this;
		var curAxis;
		var axisGroup;
		
		//CHANGE
		if(g.yAxis.length == 1 ){
			d3.select("#leftAxis").remove()
		}

		for (var i = g.yAxis.length - 1; i >= 0; i--){
			curAxis = g.yAxis[i]
			
			//create svg axis
			if(first || !g.yAxis[i].axis) {	
				g.yAxis[i].axis = d3.svg.axis()
					.scale(g.yAxis[i].scale)
					.orient(i==0?"right":"left")
					.tickSize(g.width() - g.padding.left - g.padding.right)
					//.ticks(g.yAxis[0].ticks) // I'm not using built in ticks because it is too opinionated
					.tickValues(g.yAxis[i].tickValues?g.yAxis[i].tickValues:Gneiss.helper.exactTicks(g.yAxis[i].scale.domain(),g.yAxis[0].ticks))
					
				//append axis container

				axisGroup = g.chart.append("g")
					.attr("class","axis yAxis")
					.attr("id",i==0?"rightAxis":"leftAxis")
					.attr("transform",i==0?"translate("+g.padding.left+",0)":"translate("+( g.width()-g.padding.right)+",0)")
					.call(g.yAxis[i].axis)
			}
			else {
				g.yAxis[i].axis//.ticks(g.yAxis[0].ticks) // I'm not using built in ticks because it is too opinionated
					.tickValues(g.yAxis[i].tickValues?g.yAxis[i].tickValues:Gneiss.helper.exactTicks(g.yAxis[i].scale.domain(),g.yAxis[0].ticks))
					
				axisGroup = g.chart.selectAll(i==0?"#rightAxis":"#leftAxis")
					.call(g.yAxis[i].axis)
				
			}
				
			//adjust label position and add prefix and suffix
			var topAxisLabel, minY = Infinity;
			
			this.customYAxisFormat(axisGroup, i);
			
			
			axisGroup
				.selectAll("g")
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
					axisItem.text = d3.select(this).select("text")

					//store the line element of the axisItem	
					axisItem.line = d3.select(this).select("line")
						.attr("stroke","#E6E6E6")
						
					
					//apply the prefix as appropriate
					switch(curAxis.prefix.use) {
						case "all":
							//if the prefix is supposed to be on every axisItem label, put it there
							axisItem.text.text(curAxis.prefix.value + axisItem.text.text())
						break;
						
						case "positive":
							//if the prefix is supposed to be on positive values and it's positive, put it there
							if(parseFloat(axisItem.text.text()) > 0) {
								axisItem.text.text(curAxis.prefix.value + axisItem.text.text())
							}
						break;
						
						case "negative":
							//if the prefix is supposed to be on negative values and it's negative, put it there
							if(parseFloat(axisItem.text.text()) < 0) {
								axisItem.text.text(curAxis.prefix.value + axisItem.text.text())
							}
						break;
						
						case "top":
							//do nothing
						break;
					}
					
					//apply the suffix as appropriate
					switch(curAxis.suffix.use) {
						case "all":
							//if the suffix is supposed to be on every axisItem label, put it there
							axisItem.text.text(axisItem.text.text() + curAxis.suffix.value)
						break;

						case "positive":
							//if the suffix is supposed to be on positive values and it's positive, put it there
							if(parseFloat(axisItem.text.text()) > 0) {
								axisItem.text.text(axisItem.text.text() + curAxis.suffix.value)
							}
						break;

						case "negative":
							//if the suffix is supposed to be on negative values and it's negative, put it there
							if(parseFloat(axisItem.text.text()) < 0) {
								axisItem.text.text(axisItem.text.text() + curAxis.suffix.value)
							}
						break;

						case "top":
							//do nothing
						break;
					}
					
					//find the top most axisItem
					//store its text element
					if(axisItem.y < minY) {
						topAxisLabel = axisItem.text
						g.topAxisItem = axisItem
						minY = axisItem.y
					}
					
					
					if(parseFloat(axisItem.text.text()) == 0) {
						if(d == 0) {
							//if the axisItem represents the zero line
							//change it's class and make sure there's no decimal
							//axisItem.line.attr("stroke","#666666")
							d3.select(this).classed("zero", true)
							axisItem.text.text("0")
						}
						else {
							// A non-zero value was rounded into a zero
							// hide the whole group
							this.style("display","none")
						}
						
					}
				})
				
			//add the prefix and suffix to the top most label as appropriate
			if(curAxis.suffix.use == "top" && curAxis.prefix.use == "top") {
				//both preifx and suffix should be added to the top most label
				if(topAxisLabel) {
					topAxisLabel.text(g.yAxis[i].prefix.value + topAxisLabel.text() + g.yAxis[i].suffix.value)
				}
				else {
					
				}
				
			}
			else if (curAxis.suffix.use == "top") {
				//only the suffix should be added (Because the prefix is already there)
				topAxisLabel.text(topAxisLabel.text() + g.yAxis[i].suffix.value)
			}
			else if(curAxis.prefix.use == "top") {
				//only the prefix should be added (Because the suffix is already there)
				topAxisLabel.text(g.yAxis[i].prefix.value + topAxisLabel.text())
			}
			
		};
		
		if(g.isBargrid()){
			d3.selectAll(".yAxis").style("display","none")
			g.titleLine.attr("y",g.padding.top - 36)
			
		}
		else {
			//isn't a bargrid
			d3.selectAll(".yAxis").style("display",null)
			
			if(g.yAxis.length==1) {
				//only has one axis
				try{
					if(!g.legend || g.series.length == 1) {
						//no legend or only one seriesgit 
						g.titleLine.attr("y",g.topAxisItem.y - 4)
					}
					else {
						g.titleLine.attr("y",g.topAxisItem.y - 25)
					}
				}catch(e){} //fail silently
					
			}
			else {
				try{
					g.titleLine.attr("y",g.padding.top - 36)
				}catch(e){} //fail silently
			}
		}
		
		d3.selectAll(".yAxis").each(function(){this.parentNode.prependChild(this);})
		d3.selectAll("#plotArea").each(function(){this.parentNode.prependChild(this);})
		d3.selectAll("#ground").each(function(){this.parentNode.prependChild(this);})
		
		
		return this;
	};
  
	this.customYAxisFormat = function Gneiss$customYAxisFormat(axisGroup, i) {
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
					.attr("fill",i==0?"#666666":chart.yAxis[i].color)
					.attr("x",function(){var elemx = Number(d3.select(this).attr("x")); return i==0?elemx:elemx+4})
					.attr("y",-9)
				});
	};
  
  this.setXAxis = function Gneiss$setXAxis(first) {
		var g = this;
    
		if(first) {
			/*
			*
			* X-Axis Drawing Section
			*
			*/
			g.xAxis.axis = d3.svg.axis()
				.scale(g.xAxis.scale)
				.orient(g.isBargrid() ? "left" : "bottom")
				.tickFormat(g.xAxis.formatter ? Gneiss.dateParsers[g.xAxis.formatter] : function(d) {return d})
				.ticks(g.xAxis.ticks)
				
				if(g.xAxis.type == "date") {
					if(g.xAxis.ticks === null || !isNaN(g.xAxis.ticks)) {
						//auto suggest the propper tick gap
						var timeSpan = g.xAxis.scale.domain()[1]-g.xAxis.scale.domain()[0],
										months = timeSpan/2592000000,
										years = timeSpan/31536000000;
									
						if(years > 30) {
							yearGap = 10
						}
						if(years > 15) {
							yearGap = 5;
						}
						else {
							yearGap = 1;
						}
						switch(g.xAxis.formatter) {
						   // "mmddyyyy":
						   // "mmdd"
							case "yy":
								g.xAxis.axis.ticks(d3.time.years,yearGap)
							break;

							case "yyyy":
								g.xAxis.axis.ticks(d3.time.years,yearGap)
							break;

							case "MM":
								g.xAxis.axis.ticks(d3.time.months,1)
							break;

							case "M":
								g.xAxis.axis.ticks(d3.time.months,1)
							break;
						   // "hmm"

							case "YY":
								g.xAxis.axis.ticks(d3.time.years,1)
							break;
						}
					}
					else if(g.xAxis.ticks instanceof Array) {
						//use the specified tick gap
						var gap,
							gapString = g.xAxis.ticks[1], 
							num = parseInt(g.xAxis.ticks[0]);
						
							if((/day/i).test(gapString)) {
								gap = d3.time.days;
							}
							else if((/week/i).test(gapString)) {
								gap = d3.time.weeks;
							}
							else if((/month/i).test(gapString)) {
								gap = d3.time.months;
							}
							else if((/year/i).test(gapString)) {
								gap = d3.time.years;
							}
						g.xAxis.axis.ticks(gap,num)
					}
					else {
						throw new Error("xAxis.ticks set to invalid date format");
					}
				}
			
			
			g.chart.append("g")
				.attr("class",'axis')
				.attr("id","xAxis")
				.attr("transform",g.isBargrid() ? "translate(" + g.padding.left + ",0)" : "translate(0," + (g.height() - g.padding.bottom + 8) + ")")
				.call(g.xAxis.axis);			
		}
		else {
			g.xAxis.axis.scale(g.xAxis.scale)
				.tickFormat(g.xAxis.formatter ? Gneiss.dateParsers[g.xAxis.formatter] : function(d) { return d; })
				.ticks(g.isBargrid() ? g.series[0].data.length : g.xAxis.ticks)
				.orient(g.isBargrid() ? "left" : "bottom")
			
			if(g.xAxis.type == "date") {
				if(g.xAxis.ticks === null || !isNaN(g.xAxis.ticks)) {
					//auto suggest the propper tick gap
					var timeSpan = g.xAxis.scale.domain()[1]-g.xAxis.scale.domain()[0],
									months = timeSpan/2592000000,
									years = timeSpan/31536000000;
									
					if(years > 30) {
						yearGap = 10
					}
					if(years > 15) {
						yearGap = 5;
					}
					else {
						yearGap = 1;
					}
					switch(g.xAxis.formatter) {
					   // "mmddyyyy":
					   // "mmdd"
						case "yy":
							g.xAxis.axis.ticks(d3.time.years,yearGap)
						break;

						case "yyyy":
							g.xAxis.axis.ticks(d3.time.years,yearGap)
						break;

						case "MM":
							g.xAxis.axis.ticks(d3.time.months,1)
						break;

						case "M":
							g.xAxis.axis.ticks(d3.time.months,1)
						break;
					   // "hmm"

						case "YY":
							g.xAxis.axis.ticks(d3.time.years,1)
						break;
					}
				}
				else if(g.xAxis.ticks instanceof Array) {
					var gap,
						gapString = g.xAxis.ticks[1], 
						num = parseInt(g.xAxis.ticks[0]);
						
						if((/day/i).test(gapString)) {
							gap = d3.time.days;
						}
						else if((/week/i).test(gapString)) {
							gap = d3.time.weeks;
						}
						else if((/month/i).test(gapString)) {
							gap = d3.time.months;
						}
						else if((/year/i).test(gapString)) {
							gap = d3.time.years;
						}
					g.xAxis.axis.ticks(gap,num)
				}
				else {
					throw new Error("xAxis.ticks set to invalid date format");
				}
			}
			
			g.chart.select("#xAxis")
				.attr("transform",g.isBargrid() ? "translate(" + g.padding.left + ",0)" : "translate(0," + (g.height() - g.padding.bottom + 8) + ")")
				.call(g.xAxis.axis)
		}
		
		g.chart.selectAll("#xAxis text")
			.attr("text-anchor", g.xAxis.type == "date" ? (g.seriesByType().column.length>0 && g.seriesByType().line.length == 0 && g.seriesByType().scatter.length == 0 ? "middle":"start"): (g.isBargrid() ? "end":"middle"))
			//.attr("text-anchor", g.isBargrid ? "end":"middle")
			.each(function() {
				var pwidth = this.parentNode.getBoundingClientRect().width
				var attr = this.parentNode.getAttribute("transform")
				var attrx = Number(attr.split("(")[1].split(",")[0])
				var attry = Number(attr.split(")")[0].split(",")[1])
				if(!g.isBargrid()) {
					// fix labels to not fall off edge when not bargrid
					if (pwidth/2 + attrx >  g.width()) {
						this.setAttribute("x",Number(this.getAttribute("x"))-(pwidth + attrx -  g.width() + g.padding.right))
						this.setAttribute("text-anchor","start")
					}
					else if (attrx - pwidth/2 < 0) {
						this.setAttribute("text-anchor","start")
					}
					g.padding.left = g.defaultPadding().left
				}
				else {
					//adjust padding for bargrid
					if(g.padding.left - pwidth < g.defaultPadding().left) {
						g.padding.left = pwidth + g.defaultPadding().left;
						g.redraw() //CHANGE (maybe)
					}
					
				}
			});
		
			
      
		return this;
	};
  
  this.calculateColumnWidths = function Gneiss$calculateColumnWidths() {
		/*
			Calculate the propper column width for column charts
		*/
		
		var g = this;
		//store split by type for convenience
		var sbt = g.seriesByType();
		
		
		//determine the propper column width
		//								---- Width of chart area ----------     -Num Data pts-  -Num Column Series-
		var columnWidth = Math.floor((( g.width()-g.padding.right-g.padding.left) / g.maxLength) / sbt.column.length) - 3;
		//make sure width is >= 1
		columnWidth = Math.max(columnWidth, 1);
		columnWidth = Math.min(columnWidth, ( g.width()-g.padding.right-g.padding.left) * 0.075)
		var columnGroupShift = columnWidth + 1;
		
		g.columnWidth = columnWidth;
		g.columnGroupWidth = (columnWidth + 1) * sbt.column.length;
		g.columnGroupShift = columnWidth +1;
		
		return this;
	};
  
  this.drawSeriesAndLegend = function Gneiss$drawSeriesAndLegend(first){
		this.drawSeries(first);
		this.drawLegend();
		return this;
	};
  
  this.drawSeries = function Gneiss$drawSeries(first) {
		/*
		*
		* Series Drawing Section
		*
		*/
		var g = this;
		
		//construct line maker Gneiss.helper functions for each yAxis
		this.setLineMakers(first);
		
		//store split by type for convenience
		var sbt = g.seriesByType();
		
		var columnWidth = g.columnWidth;
		var columnGroupShift = g.columnGroupShift;
		
		var lineSeries;
		
		if(first) {
			
			//create a group to contain series
			g.seriesContainer = g.chart.append("g")
				.attr("id","seriesContainer")
				
				
			lineSeries = g.seriesContainer.selectAll("path");
			columnSeries = g.seriesContainer.selectAll("g.seriesColumn")
			var columnGroups
			var columnRects
			var lineSeriesDots = g.seriesContainer.selectAll("g.lineSeriesDots")
			var scatterSeries = g.seriesContainer.selectAll("g.seriesScatter")
			
				
			//create a group to contain the legend items
			g.legendItemContainer = g.chart.append("g")
				.attr("id","legendItemContainer")
				
				//add columns to chart
				columnGroups = columnSeries.data(sbt.column)
					.enter()
					.append("g") 
						.attr("class","seriesColumn seriesGroup")
						.attr("fill",function(d,i){return d.color? d.color : g.colors[i+sbt.line.length]})
						.attr("transform",function(d,i){return "translate("+(i*columnGroupShift - (columnGroupShift * (sbt.column.length-1)/2))+",0)"})
						
				columnGroups.selectAll("rect")
					.data(function(d,i){return d.data})
					.enter()
						.append("rect")
						.attr("width",columnWidth)
						.attr("height", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis[yAxisIndex].scale(d)-g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain())))})
						.attr("x", function(d,i) {
							return g.xAxis.scale(g.xAxisRef[0].data[i])  - columnWidth/2
							})
						.attr("y",function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return (g.yAxis[yAxisIndex].scale(d)-g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain()))) >= 0 ? g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain())) : g.yAxis[yAxisIndex].scale(d)})
								
				
				//add lines to chart
				lineSeries.data(sbt.line)
					.enter()
					.append("path")
						.attr("d",function(d,j) { yAxisIndex = d.axis; pathString = g.yAxis[d.axis].line(d.data).split("L0,0L").join("M");  return pathString.indexOf("NaN")==-1?pathString:"M0,0"})
						.attr("class","seriesLine seriesGroup")
						.attr("stroke",function(d,i){return d.color? d.color : g.colors[i]})
				
				lineSeriesDotGroups = lineSeriesDots.data(sbt.line)
					.enter()
					.append("g")
					.attr("class","lineSeriesDots seriesGroup")
					.attr("fill", function(d,i){return d.color? d.color : g.colors[i]})
				
				lineSeriesDotGroups
					.filter(function(d){return d.data.length < g.lineDotsThreshold})
					.selectAll("circle")
					.data(function(d){ return d.data})
					.enter()
						.append("circle")
						.attr("r",4)
						.attr("transform",function(d,i){
							yAxisIndex = d3.select(this.parentNode).data()[0].axis; 
							return "translate("+(g.xAxis.type=="date" ?
								g.xAxis.scale(g.xAxisRef[0].data[i]):
								g.xAxis.scale(i)) + "," + g.yAxis[yAxisIndex].scale(d) + ")"
							})
							
				
				//add scatter to chart
				scatterGroups = scatterSeries.data(sbt.scatter)
					.enter()
					.append("g")
					.attr("class","seriesScatter seriesGroup")
					.attr("fill", function(d,i){return d.color? d.color : g.colors[i]})

				scatterDots = scatterGroups
					.selectAll("circle")
					.data(function(d){ return d.data})
				scatterDots.enter()
						.append("circle")
						.attr("r",4)
						.attr("transform",function(d,i){
							yAxisIndex = d3.select(this.parentNode).data()[0].axis; 
							return "translate("+(g.xAxis.type=="date" ?
								g.xAxis.scale(g.xAxisRef[0].data[i]):
								g.xAxis.scale(i)) + "," + g.yAxis[yAxisIndex].scale(d) + ")"
							})
		}
		else {
			//update don't create
			
			lineSeries = g.seriesContainer.selectAll("path");
			columnSeries = g.seriesContainer.selectAll("g.seriesColumn")
			scatterSeries = g.seriesContainer.selectAll("g.seriesScatter")
			lineSeriesDotGroups = g.seriesContainer.selectAll("g.lineSeriesDots")
			var columnGroups
			var columnRects
			
			if(g.isBargrid()) {
				//add bars to chart
				columnGroups = g.seriesContainer.selectAll("g.seriesColumn")
					.data(sbt.bargrid)
					.attr("fill",function(d,i){return d.color? d.color : g.colors[i+sbt.line.length]})
				
				var seriesColumns = columnGroups.enter()
					.append("g") 
						.attr("class","seriesColumn")
						.attr("fill",function(d,i){return d.color? d.color : g.colors[i+g.series.length]})
						.attr("transform",function(d,i){return "translate(0,"+g.padding.top+")"})
				
				var bargridLabel = columnGroups.selectAll("text.bargridLabel")
					.data(function(d,i){return [d]})
				
						
				bargridLabel.enter()
					.append("text")
					.attr("class","bargridLabel")
					.text(function(d,i){return d.name})
					.attr("x",g.yAxis[0].scale(0))
					.attr("y",g.padding.top-18)
								
				bargridLabel.transition()
					.text(function(d,i){return d.name})
					.attr("x",g.yAxis[0].scale(0))
					.attr("y",g.padding.top-18)
				
				bargridLabel.exit().remove()
				
				columnSeries.transition()
					.duration(500)
					.attr("transform",function(d,i){return "translate("+(i * ( g.width()-g.padding.left)/g.series.length)+",0)"})
					
				columnGroups.exit().remove()
				
				
				columnRects = columnGroups.selectAll("rect")
					.data(function(d,i){return d.data})
				
				columnRects.enter()
						.append("rect")
						.attr("height",20)
						.attr("width", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis[yAxisIndex].scale(d) - g.yAxis[yAxisIndex].scale(0))})
						.attr("x", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return g.yAxis[yAxisIndex].scale(0) - (d<0?Math.abs(g.yAxis[yAxisIndex].scale(d)):0)})
						.attr("y",function(d,i) {return g.xAxis.scale(i) - 10})
				
				columnRects.transition()
					.duration(500)
					.attr("height",20)
					.attr("width", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis[yAxisIndex].scale(d) - g.yAxis[yAxisIndex].scale(0))})
					.attr("x", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return g.yAxis[yAxisIndex].scale(0) - (d<0?Math.abs(g.yAxis[yAxisIndex].scale(d) - g.yAxis[yAxisIndex].scale(0)):0)})
					.attr("y",function(d,i) {return g.xAxis.scale(i) - 10})
				
				//add label to each bar
				var barLabels = columnGroups.selectAll("text.barLabel")
					.data(function(d,i){return d.data})
					
				barLabels.enter()
					.append("text")
					.attr("class","barLabel")
					.text(function(d,i){return g.numberFormat(d)})
					.attr("x", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis[yAxisIndex].scale(d) - g.yAxis[yAxisIndex].scale(0))})
					.attr("y",function(d,i) {return g.xAxis.scale(i) + 5})
				
				//reset the padding to the default before mucking with it in the label postitioning
				
				g.padding.right = g.defaultPadding().right
					
				barLabels.transition()
					.text(function(d,i){var yAxisIndex = d3.select(this.parentNode).data()[0].axis; return (i==0?g.yAxis[yAxisIndex].prefix.value:"") + g.numberFormat(d) + (i==0?g.yAxis[yAxisIndex].suffix.value:"")})
					.attr("x", function(d,i) {
						var yAxisIndex = d3.select(this.parentNode).data()[0].axis,
						x = 3 + g.yAxis[yAxisIndex].scale(0) - (d<0?Math.abs(g.yAxis[yAxisIndex].scale(d) - g.yAxis[yAxisIndex].scale(0)):0) + Math.abs(g.yAxis[yAxisIndex].scale(d) - g.yAxis[yAxisIndex].scale(0)),
						
						bbox = this.getBBox()
						parentCoords = Gneiss.helper.transformCoordOf(d3.select(this.parentNode))
						console.log()
						if (x + bbox.width + parentCoords.x > g.width()) {
							//the label will fall off the edge and thus the chart needs more padding
							if(bbox.width + g.defaultPadding().right < (g.width()-g.padding.left)/g.series.length) {
								//add more padding if there is room for it
								g.padding.right = bbox.width + g.defaultPadding().right
								g.redraw()
							}
							
						}
						
						
						return x
					})
					.attr("y",function(d,i) {return g.xAxis.scale(i) + 5})
				
				//remove non bargrid stuff
				scatterSeries.remove()
				columnRects.exit().remove()
				lineSeriesDotGroups.remove()
				lineSeries.remove()
			}
			else {
				//Not a bargrid
				
				//add columns to chart
				columnGroups = g.seriesContainer.selectAll("g.seriesColumn")
					.data(sbt.column)
					.attr("fill",function(d,i){return d.color? d.color : g.colors[i+sbt.line.length]})
				
				//remove bargrid labels
				columnGroups.selectAll("text.barLabel").remove()
				
				columnGroups.enter()
					.append("g") 
						.attr("class","seriesColumn")
						.attr("fill",function(d,i){return d.color? d.color : g.colors[i+sbt.line.length]})
						.attr("transform",function(d,i){return "translate("+(i*columnGroupShift - (columnGroupShift * (sbt.column.length-1)/2))+",0)"})
					
				columnSeries.transition()
					.duration(500)
					.attr("transform",function(d,i){return "translate("+(i*columnGroupShift - (columnGroupShift * (sbt.column.length-1)/2))+",0)"})
			
				columnGroups.exit().remove()
			
				columnRects = columnGroups.selectAll("rect")
					.data(function(d,i){return d.data})
				
				columnRects.enter()
						.append("rect")
						.attr("width",columnWidth)
						.attr("height", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis[yAxisIndex].scale(d) - g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain())))})
						.attr("x",function(d,i) {return g.xAxis.scale(g.xAxisRef[0].data[i])  - columnWidth/2})
						.attr("y",function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return (g.yAxis[yAxisIndex].scale(d)-g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain()))) >= 0 ? g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain())) : g.yAxis[yAxisIndex].scale(d)})
			
				columnRects.transition()
					.duration(500)
					.attr("width",columnWidth)
					.attr("height", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis[yAxisIndex].scale(d) - g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain())))})
					.attr("x",g.xAxis.type =="date" ? 
							function(d,i) {return g.xAxis.scale(g.xAxisRef[0].data[i])  - columnWidth/2}:
							function(d,i) {return g.xAxis.scale(i) - columnWidth/2}
					)
					.attr("y",function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return (g.yAxis[yAxisIndex].scale(d)-g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain()))) >= 0 ? g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain())) : g.yAxis[yAxisIndex].scale(d)})
				
				columnRects.exit().remove()
			
				//add lines
				lineSeries = g.seriesContainer.selectAll("path")
					.data(sbt.line)
					.attr("stroke",function(d,i){return d.color? d.color : g.colors[i]});

				lineSeries.enter()
					.append("path")
						.attr("d",function(d,j) { yAxisIndex = d.axis; pathString = g.yAxis[d.axis].line(d.data).split("L0,0L").join("M0,0L"); return pathString;})
						.attr("class","seriesLine")
						.attr("stroke",function(d,i){return d.color? d.color : g.colors[i]})

				lineSeries.transition()
					.duration(500)
					.attr("d",function(d,j) { yAxisIndex = d.axis; pathString = g.yAxis[d.axis].line(d.data).split("L0,0L").join("M0,0M"); return pathString;})

				lineSeries.exit().remove()
			
			
				//Add dots to the appropriate line series
				lineSeriesDotGroups = g.seriesContainer.selectAll("g.lineSeriesDots")
					.data(sbt.line)
					.attr("fill",function(d,i){return d.color? d.color : g.colors[i]})
			
				lineSeriesDotGroups
					.enter()
					.append("g")
					.attr("class","lineSeriesDots")
					.attr("fill", function(d,i){return d.color? d.color : g.colors[i]})
				
				lineSeriesDotGroups.exit().remove()
			
				lineSeriesDots = lineSeriesDotGroups.filter(function(d){return d.data.length < g.lineDotsThreshold})
					.selectAll("circle")
					.data(function(d,i){return d.data})
					
				lineSeriesDotGroups.filter(function(d){return d.data.length >= g.lineDotsThreshold})
					.remove()
				
				
				lineSeriesDots.enter()
					.append("circle")
					.attr("r",4)
					.attr("transform",function(d,i){
						yAxisIndex = d3.select(this.parentNode).data()[0].axis;
							var y = d || d ===0 ? g.yAxis[yAxisIndex].scale(d) : -100;
							return "translate("+ g.xAxis.scale(g.xAxisRef[0].data[i]) + "," + y + ")";
						})
			
				lineSeriesDots.transition()
					.duration(500)
					.attr("transform",function(d,i){
						yAxisIndex = d3.select(this.parentNode).data()[0].axis;
							var y = d || d ===0 ? g.yAxis[yAxisIndex].scale(d) : -100;
							return "translate("+ g.xAxis.scale(g.xAxisRef[0].data[i]) + "," + y + ")";
						})
			
				lineSeriesDots.exit().remove()
								
				//add scatter
				scatterGroups = g.seriesContainer.selectAll("g.seriesScatter")
					.data(sbt.scatter)
					.attr("fill", function(d,i){return d.color? d.color : g.colors[i]})
				
				scatterGroups.enter()
					.append("g")
					.attr("class","seriesScatter")
					.attr("fill",function(d,i){return d.color? d.color : g.colors[i+sbt.line.length+sbt.column.length]})
				
				scatterGroups.exit().remove()
				
				scatterDots = scatterGroups
					.selectAll("circle")
					.data(function(d){return d.data})
					
				scatterDots.enter()
						.append("circle")
						.attr("r",4)
						.attr("transform",function(d,i){
							yAxisIndex = d3.select(this.parentNode).data()[0].axis;
							return "translate("+g.xAxis.scale(g.xAxisRef[0].data[i]) + "," + g.yAxis[yAxisIndex].scale(d) + ")"
							})
					
				scatterDots.transition()
						.duration(500)
						.attr("transform",function(d,i){
							yAxisIndex = d3.select(this.parentNode).data()[0].axis;
							return "translate("+g.xAxis.scale(g.xAxisRef[0].data[i]) + "," + g.yAxis[yAxisIndex].scale(d) + ")"
							})
			}
			
		}
		
		//arrange elements in proper order	
		
		//bring bars to front
		if(sbt.column.length > 0) {
			columnGroups.each(function(){this.parentNode.appendChild(this);})
			columnSeries.each(function(){this.parentNode.appendChild(this);})
		}
		
		
		//bring lines to front
		if(sbt.line.length > 0){
			lineSeries.each(function(){if(this.parentNode){this.parentNode.appendChild(this);}})
			//bring dots to front
			lineSeriesDotGroups.each(function(){if(this.parentNode){this.parentNode.appendChild(this);}})
		}
		
		//bring scatter to front
		if(sbt.scatter.length > 0) {
			scatterGroups.each(function(){this.parentNode.appendChild(this);})
			scatterDots.each(function(){this.parentNode.appendChild(this);})
		}
		
		return this;
	};
  
  this.drawLegend = function Gneiss$drawLegend() {
		var g = this;
		var legendItemY;
		
		//remove current legends
		g.legendItemContainer.selectAll("g.legendItem").remove()
		
		if(!g.isBargrid()) {
			//add legend to chart
			var legendGroups = g.legendItemContainer.selectAll("g")
				.data(g.series);

			var legItems = 	legendGroups.enter()
				.append("g")
				.attr("class","legendItem")
				.attr("transform",function(d,i) {
					if(g.yAxis.length == 1) {
						return "translate("+g.padding.left+","+(g.padding.top-25)+")"
					}
					else {
						return "translate("+g.padding.left+","+(g.padding.top-50)+")"
					}
				});

			legendGroups.exit().remove()

			var legLabels = legItems.append("text")
					.filter(function(){return g.series.length > 1})
					.attr("class","legendLabel")
					.attr("x",12)
					.attr("y",18)
					.attr("fill",function(d,i){return d.color? d.color : g.colors[i]})
					.text(function(d,i){return d.name});
			
			//if there is more than one line
			if(g.series.length > 1) {
				legItems.append("rect")
					.attr("width",10)
					.attr("height",10)
					.attr("x",0)
					.attr("y",8)
					.attr("fill", function(d,i){return d.color? d.color : g.colors[i]})

				legendGroups.filter(function(d){return d != g.series[0]})
					.transition()
					.duration(50)
					.delay(function(d,i){return i * 50 + 50})
					.attr("transform",function(d,i) {
						//label isn't for the first series
						var prev = d3.select(legendGroups[0][i]);
						var prevWidth = parseFloat(prev.node().getBoundingClientRect().width);
						var prevCoords = Gneiss.helper.transformCoordOf(prev);

						var cur = d3.select(this);
						var curWidth = parseFloat(cur.node().getBoundingClientRect().width);
						var curCoords = Gneiss.helper.transformCoordOf(cur);

						legendItemY = prevCoords.y;
						var x = prevCoords.x + prevWidth + 5;
						if(x + curWidth >  g.width()) {
							x = g.padding.left;
							legendItemY += 15;						
						}
						return "translate("+x+","+legendItemY+")";
				})
				//.filter(function(d,i){console.log(i,g.series.slice(0).pop()==d);return d == g.series.slice(0).pop()})
				//.each("end", function(d,i) {
				//	//the filter above makes sure this only hapens on the last one
				//	if (legendItemY > 0 && g.defaults.padding.top != legendItemY + 25) { //CHANGE
				//		g.defaults.padding.top = legendItemY + 25;
				//		g.all.redraw();
				//				
				//	};
				//})		
				//test if the chart needs more top margin because of a large number of legend items				
			} else {
				if(g.title == "") {
					g.titleLine.text(g.series[0].name)
				}
			}
		}
		
		return this;
	};
  
  this.updateMetaAndTitle = function Gneiss$updateMetaAndTitle() {
		var g = this;
		g.metaInfo.attr("transform", "translate(0," + ( g.height() - 4) + ")");
		return this;
	};
  
  this.splitSeriesByType = function Gneiss$splitSeriesByType(series) {
		/*
			Partition the data by the way it is supposed to be displayed
		*/
		var seriesByType = {
			"line": [],
			"column": [],
			"bargrid": [],
			"scatter": []
		};
		
		for (var i = 0; i < series.length; i++) {
			seriesByType[series[i].type].push(series[i]);
		}
		
		return seriesByType;
	};
  
  this.updateGraphPropertiesBasedOnSeriesType = function Gneiss$updateGraphPropertiesBasedOnSeriesType(graph, seriesByType) {
		/* 
		  Update graph properties based on the type of data series displayed 
		*/
		if(seriesByType.column.length > 0) {
			graph.xAxis.hasColumns = true;
		}
		else {
			graph.xAxis.hasColumns = false;
		}
		
		if(seriesByType.bargrid.length > 0) {
			graph.isBargrid(true);
		}
		else {
			graph.isBargrid(false);
		}
	};
  
  this.redraw = function Gneiss$redraw() {
		/*
			Redraw the chart
		*/
				
		//group the series by their type
		this.seriesByType(this.splitSeriesByType(this.series));
		this.updateGraphPropertiesBasedOnSeriesType(this, this.seriesByType());
		
		this.calculateColumnWidths();
		
		this.setPadding()
			.setYScales()
			.setXScales()
			.setYAxes()
			.setXAxis()
			.drawSeriesAndLegend()
			.updateMetaAndTitle();
		return this;
	};
  
  // Call build() when someone attempts to construct a new Gneiss object
  return this.build(config);
}