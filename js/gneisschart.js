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
	legend: true, // whether or not there should be a legend
	title: "", // the chart title 
	colors: ["#ff4cf4","#ffb3ff","#e69ce6","#cc87cc","#b373b3","#995f99","#804c80","#665266","#158eff","#99cdff","#9cc2e6","#87abcc","#7394b3","#5f7d99","#466780","#525c66"], 
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
	var chartElement;
	var titleElement;
	var footerElement;
	var sourceElement;
	var creditElement;
	
	var defaultPadding;
	var containerId;
	var seriesByType;
	var width;
	var height;
	var isBargrid;
	var title;
	var sourceLine;
	var creditLine;
	var legend;
	var colors;
	var xAxis;
	var yAxis;
	var series;
	var xAxisRef;
	
	var columnWidth;
	var columnGroupWidth;
	var columnGroupShift;
			
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
	
	this.footerElement = function Gneiss$footerElement(elem) {
		if (!arguments.length) {
			return footerElement;
		}
		footerElement = elem;
	};
	
	this.sourceElement = function Gneiss$sourceElement(elem) {
		if (!arguments.length) {
			return sourceElement;
		}
		sourceElement = elem;
	};
	
	this.creditElement = function Gneiss$creditElement(elem) {
		if (!arguments.length) {
			return creditElement;
		}
		creditElement = elem;
	};
	
	this.defaultPadding = function Gneiss$defaultPadding(p) {
		if (!arguments.length) {
			return defaultPadding;
		}
		defaultPadding = p;
	};
	
	this.padding = function Gneiss$padding(p) {
		if (!arguments.length) {
			return padding;
		}
		padding = p;
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
	
	this.title = function Gneiss$title(t) {
		if (!arguments.length) {
			return title;
		}
		title = t;
	};	
		
	this.titleElement = function Gneiss$titleElement(elem) {
		if (!arguments.length) {
			return titleElement;
		}
		titleElement = elem;
	};
	
	this.source = function Gneiss$sourceLineText(s) {
		if (!arguments.length) {
			return source;
		}
		source = s;
	};
	
	this.credit = function Gneiss$credit(c) {
		if (!arguments.length) {
			return credit;
		}
		credit = c;
	};
	
	this.legend = function Gneiss$legend(l) {
		if (!arguments.length) {
			return legend;
		}
		legend = l;
	};
	
	this.colors = function Gneiss$colors(c) {
		if (!arguments.length) {
			return colors;
		}
		colors = c;
	};
		
	this.chartElement = function Gneiss$chartElement(c) {
		if (!arguments.length) {
			return chartElement;
		}
		chartElement = c;
	};
		
	this.xAxis = function Gneiss$xAxis(x) {
		if (!arguments.length) {
			return xAxis;
		}
		xAxis = x;
	};
	
	this.xAxisRef = function Gneiss$xAxisRef(x) {
		if (!arguments.length) {
			return xAxisRef;
		}
		xAxisRef = x;
	};
		
	this.yAxis = function Gneiss$yAxis(y) {
		if (!arguments.length) {
			return yAxis;
		}
		yAxis = y;
	};
		
	this.series = function Gneiss$series(s) {
		if (!arguments.length) {
			return series;
		}
		series = s;
	};
	
	this.columnWidth = function Gneiss$columnWidth(w) {
		if (!arguments.length) {
			return columnWidth;
		}
		columnWidth = w;
	};
	
	this.columnGroupWidth = function Gneiss$columnGroupWidth(w) {
		if (!arguments.length) {
			return columnGroupWidth;
		}
		columnGroupWidth = w;
	};
	
	this.columnGroupShift = function Gneiss$columnGroupShift(w) {
		if (!arguments.length) {
			return columnGroupShift;
		}
		columnGroupShift = w;
	};
	
	this.build = function Gneiss$build(config) {
		/*
			Initializes the chart from a config object
		*/
		
		if(!config) {
			throw new Error("build() must be called with a chart configuration");
		}
		
		var g = this;
		 
		// Set container as a jQuery object wrapping the DOM element specified in the config
		if(!config.container) {
			throw new Error("build() must be called with a chart configuration with a 'container' property");
		}
		
		// Deep copy the config data to prevent side effects
		g.containerId(config.container.slice());
		g.containerElement($(g.containerId()));		
		g.title(config.title.slice());
		g.source(config.sourceline.slice());
		g.credit(config.creditline.slice());
		g.legend(config.legend === true ? true : false);
		g.colors($.extend(true, [], config.colors));
		g.xAxis($.extend(true, {}, config.xAxis));
		g.xAxisRef($.extend(true, [], config.xAxisRef));
		g.yAxis($.extend(true, [], config.yAxis));
		g.series($.extend(true, [], config.series));
		g.defaultPadding($.extend(true, {}, config.padding));
		g.padding($.extend(true, {}, config.padding));
		
		//append svg to container using svg
		g.chartElement(d3.select(g.containerId()).append("svg")
			.attr("id","chart")
			.attr("width","100%") //set width to 100%
			.attr("height","100%")); //set height to 100%
			
		g.width(g.containerElement().width()); //save the width in pixels
		g.height(g.containerElement().height()); //save the height in pixels
		
		//add rect, use as a background to prevent transparency
		g.chartElement().append("rect")
			.attr("id","ground")
			.attr("width", g.width())
			.attr("height", g.height());				
		
		//group the series by their type
		g.seriesByType(this.splitSeriesByType(g.series()));
		this.updateGraphPropertiesBasedOnSeriesType(g, g.seriesByType());
		
		g.titleElement(g.chartElement().append("text")
			.attr("y",18)
			.attr("x", g.padding().left)
			.attr("id","titleLine")
			.text(g.title()));
		
		this.calculateColumnWidths()
			.setYScales()
			.setXScales()
			.setYAxes(true)
			.setXAxis(true);
				
		this.drawSeriesAndLegend(true);
		
		g.footerElement(g.chartElement().append("g")
			.attr("id", "metaInfo")
			.attr("transform", "translate(0," + (g.height() - 4) + ")"));
		
		g.sourceElement(g.footerElement().append("text")
			.attr("text-anchor", "end")
			.attr("x", g.width() - g.padding().right)
			.attr("class", "metaText")
			.text(g.source()));
		
		g.creditElement(g.footerElement().append("text")
			.attr("x", g.padding().left)
			.attr("class", "metaText")
			.text(g.credit()));
      
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
      
		g.footerElement().attr("transform", "translate(0," + (g.height() - 4) + ")");
		
		return this;
	};
  
  this.setYScales = function Gneiss$setYScales() {
		/*
		* Calculate and store the left and right y-axis scale information
		*/
    
		var g = this;
		var y = g.yAxis();
		var p = g.padding();
        
		for (var i = series.length - 1; i >= 0; i--) {
			// Plot this series against the right y-axis if no axis has been defined yet
			if(series[i].axis === undefined) {
				series[i].axis = 0;
			}
			
			// This useLowestValueInAllSeries flag changes the independence
			// of the y-axii significantly.
			//
			// Setting it to true means that the extents for the right y-axis
			// use the smallest number in any series that will be graphed on either
			// axis, regardless of whether or not the series containing that value
			// is graphed against the right y-axis or not. 
			//
			// Setting it to false results in completely independent axii such that
			// the extents are determined only by the values in the series charted 
			// against the axis in question. The right y-axis extents will be
			// dependent only on series graphed against the right y-axis.
			var useLowestValueInAllSeries = false;
			
			if(y[i]) {
				y[i].domain = Gneiss.helper.multiextent(g.series(), function(a) {
					if(a.axis === i || (useLowestValueInAllSeries && i == 0)) {
						// This series is charted against this axis 
						// OR
						// This is the right y-axis and it should be rooted at
						// the lowest value in any series regardless of axis
						return a.data;
					}
					return [];
				});
			}
		}
					
		//set extremes in y axis objects and create scales
		for (var i = y.length - 1; i >= 0; i--) {
			if(!y[i].scale) {
				y[i].scale = d3.scale.linear();
			}
			y[i].scale.domain(y[i].domain);
		}
				
		if(g.isBargrid()) {
			var width = (g.width() / g.seriesByType().bargrid.length) - p.right;
			for (var i = y.length - 1; i >= 0; i--) {
				y[i].domain[0] = Math.min(y[i].domain[0], 0);
				y[i].scale.range([p.left, width]).nice();				
			}
		}
		else {
			for (var i = y.length - 1; i >= 0; i--) {
				y[i].scale.range([g.height() - p.bottom, p.top]).nice();
			}
		}
		
		return this;
	};
  
	this.setPadding = function Gneiss$setPadding() {
		/*
			calulates and stores the proper amount of extra padding beyond what the user specified (to account for axes, titles, legends, meta)
		*/
		var g = this;
		var padding_top = g.defaultPadding().top;
		var padding_bottom = g.defaultPadding().bottom;
		
		if(!g.legend()) {
			padding_top = 5;
		}
		padding_top += g.title() == "" || g.series().length == 1 ? 0 : 25;
		padding_top += (g.yAxis().length == 1 && !g.isBargrid()) ? 0 : 25;
		
		if(g.isBargrid()) {
			padding_top += -15;
			padding_bottom -= 15;
		}
		
		g.padding().top = padding_top;
		g.padding().bottom = padding_bottom;
		
		return this;
	};
  
  this.setXScales = function Gneiss$setXScales() {
		/*
		* Calculate and store the x-axis scale information
		*/
		
		var g = this;
		var x = g.xAxis();
		var data = g.xAxisRef()[0].data;
		
		// Calculate extremes of x-axis
		if(x.type == "date") {
			var dateExtent = d3.extent(data);
			
			// Create a linear scale with date keys between the input start and end dates
			x.scale = d3.time.scale().domain(dateExtent);
		}
		else {			
			// Create a ordinal scale with with row name keys
			x.scale = d3.scale.ordinal().domain(data);
		}
		
		// Set the range of the x-axis
		var rangeArray = [];
		var p = g.padding();
		if(g.isBargrid()) {
			rangeArray = [p.top, g.height() - p.bottom];
		}
		else if(x.hasColumns) {
			var halfColumnWidth = g.columnGroupWidth() / 2;
			rangeArray = [p.left + halfColumnWidth + ((g.yAxis().length == 1) ? 0 : halfColumnWidth),
                    g.width() - p.right - g.columnGroupWidth()]; 
		}
		else {
			rangeArray = [p.left, g.width() - p.right];
		}
		
		if(x.type == "date") {
			x.scale.range(rangeArray);
		}
		else {
			x.scale.rangePoints(rangeArray);
		}
		
		return this;		
	};
  
  this.setLineMakers = function Gneiss$setLineMakers(first) {
		var g = this;

		for (var i = g.yAxis().length - 1; i >= 0; i--){
			if(first || !g.yAxis()[i].line) {
						g.yAxis()[i].line = d3.svg.line();
						g.yAxis()[i].line.y(function(d,j){return d||d===0?g.yAxis()[yAxisIndex].scale(d):null})
						g.yAxis()[i].line.x(function(d,j){return d||d===0?g.xAxis().scale(g.xAxisRef()[0].data[j]):null})
			}
			else {
				for (var i = g.yAxis().length - 1; i >= 0; i--){
					g.yAxis()[i].line.y(function(d,j){return d||d===0?g.yAxis()[yAxisIndex].scale(d):null})
					g.yAxis()[i].line.x(function(d,j){return d||d===0?g.xAxis().scale(g.xAxisRef()[0].data[j]):null})
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
		if(g.yAxis().length == 1 ){
			d3.select("#leftAxis").remove()
		}

		for (var i = g.yAxis().length - 1; i >= 0; i--){
			curAxis = g.yAxis()[i];
			
			//create svg axis
			if(first || !g.yAxis()[i].axis) {	
				curAxis.axis = d3.svg.axis()
					.scale(g.yAxis()[i].scale)
					.orient(i==0?"right":"left")
					.tickSize(g.width() - g.padding().left - g.padding().right)
					//.ticks(g.yAxis()[0].ticks) // I'm not using built in ticks because it is too opinionated
					.tickValues(g.yAxis()[i].tickValues?curAxis.tickValues:Gneiss.helper.exactTicks(curAxis.scale.domain(),g.yAxis()[0].ticks))
					
				//append axis container

				axisGroup = g.chartElement().append("g")
					.attr("class","axis yAxis")
					.attr("id",i==0?"rightAxis":"leftAxis")
					.attr("transform",i==0?"translate("+g.padding().left+",0)":"translate("+( g.width()-g.padding().right)+",0)")
					.call(curAxis.axis)
			}
			else {
				curAxis.axis//.ticks(`)[0].ticks) // I'm not using built in ticks because it is too opinionated
					.tickValues(curAxis.tickValues?curAxis.tickValues:Gneiss.helper.exactTicks(curAxis.scale.domain(),g.yAxis()[0].ticks))
					
				axisGroup = g.chartElement().selectAll(i==0?"#rightAxis":"#leftAxis")
					.call(curAxis.axis)
				
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
					topAxisLabel.text(g.yAxis()[i].prefix.value + topAxisLabel.text() + g.yAxis()[i].suffix.value)
				}
				else {
					
				}
				
			}
			else if (curAxis.suffix.use == "top") {
				//only the suffix should be added (Because the prefix is already there)
				topAxisLabel.text(topAxisLabel.text() + g.yAxis()[i].suffix.value)
			}
			else if(curAxis.prefix.use == "top") {
				//only the prefix should be added (Because the suffix is already there)
				topAxisLabel.text(g.yAxis()[i].prefix.value + topAxisLabel.text())
			}
			
		};
		
		if(g.isBargrid()){
			d3.selectAll(".yAxis").style("display","none")
			g.titleElement().attr("y",g.padding().top - 36)
			
		}
		else {
			//isn't a bargrid
			d3.selectAll(".yAxis").style("display",null)
			
			if(g.yAxis().length==1) {
				//only has one axis
				try{
					if(!g.legend() || g.series().length == 1) {
						//no legend or only one seriesgit 
						g.titleElement().attr("y",g.topAxisItem.y - 4)
					}
					else {
						g.titleElement().attr("y",g.topAxisItem.y - 25)
					}
				}catch(e){} //fail silently
					
			}
			else {
				try{
					g.titleElement().attr("y",g.padding().top - 36)
				}catch(e){} //fail silently
			}
		}
		
		d3.selectAll(".yAxis").each(function(){this.parentNode.prependChild(this);})
		d3.selectAll("#ground").each(function(){this.parentNode.prependChild(this);})
		
		return this;
	};
  
	this.customYAxisFormat = function Gneiss$customYAxisFormat(axisGroup, i) {
		var g = this;
		
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
					.attr("fill",i==0?"#666666":g.yAxis()[i].color)
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
			g.xAxis().axis = d3.svg.axis()
				.scale(g.xAxis().scale)
				.orient(g.isBargrid() ? "left" : "bottom")
				.tickFormat(g.xAxis().formatter ? Gneiss.dateParsers[g.xAxis().formatter] : function(d) {return d})
				.ticks(g.xAxis().ticks)
				
			if(g.xAxis().type == "date") {
				
				switch(g.xAxis().formatter) {
				   // "mmddyyyy":
				   // "mmdd"
					case "yy":
						g.xAxis().axis.ticks(d3.time.years,1)
					break;
					
					case "yyyy":
						g.xAxis().axis.ticks(d3.time.years,1)
					break;
					
					case "MM":
						g.xAxis().axis.ticks(d3.time.months,1)
					break;
					
					case "M":
						g.xAxis().axis.ticks(d3.time.months,1)
					break;
				   // "hmm"

					case "YY":
						g.xAxis().axis.ticks(d3.time.years,1)
					break;
				}
			}
			
			g.chartElement().append("g")
				.attr("class",'axis')
				.attr("id","xAxis")
				.attr("transform",g.isBargrid() ? "translate(" + g.padding().left + ",0)" : "translate(0," + (g.height() - g.padding().bottom + 8) + ")")
				.call(g.xAxis().axis);			
		}
		else {
			g.xAxis().axis.scale(g.xAxis().scale)
				.tickFormat(g.xAxis().formatter ? Gneiss.dateParsers[g.xAxis().formatter] : function(d) { return d; })
				.ticks(g.isBargrid() ? g.series()[0].data.length : g.xAxis().ticks)
				.orient(g.isBargrid() ? "left" : "bottom")
			
			if(g.xAxis().type == "date") {
				var timeSpan = g.xAxis().scale.domain()[1]-g.xAxis().scale.domain()[0],
				months = timeSpan/2592000000,
				years = timeSpan/31536000000;
				
				if(years > 20) {
					yearGap = 5;
				}
				else {
					yearGap = 1;
				}
				switch(g.xAxis().formatter) {
				   // "mmddyyyy":
				   // "mmdd"
					case "yy":
						g.xAxis().axis.ticks(d3.time.years,yearGap)
					break;
					
					case "yyyy":
						g.xAxis().axis.ticks(d3.time.years,yearGap)
					break;
					
					case "MM":
						g.xAxis().axis.ticks(d3.time.months,1)
					break;
					
					case "M":
						g.xAxis().axis.ticks(d3.time.months,1)
					break;
				   // "hmm"

					case "YY":
						g.xAxis().axis.ticks(d3.time.years,1)
					break;
				}
			}
			
			g.chartElement().selectAll("#xAxis")
				.attr("transform",g.isBargrid() ? "translate(" + g.padding().left + ",0)" : "translate(0," + (g.height() - g.padding().bottom + 8) + ")")
				.call(g.xAxis().axis)
		}
		
		g.chartElement().selectAll("#xAxis text")
			.attr("text-anchor", g.xAxis().type == "date" ? (g.seriesByType().column.length>0 && g.seriesByType().line.length == 0 && g.seriesByType().scatter.length == 0 ? "middle":"start"): (g.isBargrid() ? "end":"middle"))
			//.attr("text-anchor", g.isBargrid ? "end":"middle")
			.each(function() {
				var pwidth = this.parentNode.getBoundingClientRect().width
				var attr = this.parentNode.getAttribute("transform")
				var attrx = Number(attr.split("(")[1].split(",")[0])
				var attry = Number(attr.split(")")[0].split(",")[1])
				if(!g.isBargrid()) {
					// fix labels to not fall off edge when not bargrid
					if (pwidth/2 + attrx >  g.width()) {
						this.setAttribute("x",Number(this.getAttribute("x"))-(pwidth + attrx -  g.width() + g.padding().right))
						this.setAttribute("text-anchor","start")
					}
					else if (attrx - pwidth/2 < 0) {
						this.setAttribute("text-anchor","start")
					}
					g.padding().left = g.defaultPadding().left
				}
				else {
					//adjust padding for bargrid
					if(g.padding().left - pwidth < g.defaultPadding().left) {
						g.padding().left = pwidth + g.defaultPadding().left;
						g.redraw() //CHANGE (maybe)
					}
					
				}
			});
      
		return this;
	};
  
  this.calculateColumnWidths = function Gneiss$calculateColumnWidths() {
		/*
		 * Calculate the proper width for columns in column charts
		*/
		
		var g = this;
		var x = g.xAxis();
		var data = g.xAxisRef()[0].data;
		var numColumnSeries = g.seriesByType().column.length;
		
		if(numColumnSeries === 0) {
			return this;
		}
		
		var numDataPoints = 0;
				
		// Calculate the number of data points based on x-axis extents
		if(x.type == "date") {
			var dateExtent = d3.extent(data);
					
			// Calculate smallest gap between two dates (in ms)
			var shortestPeriod = Infinity;
			for (var i = data.length - 2; i >= 0; i--) {
				shortestPeriod = Math.min(shortestPeriod, Math.abs(data[i] - data[i+1]));
			}
			
			numDataPoints = Math.abs(Math.floor((dateExtent[0] - dateExtent[1]) / shortestPeriod));
		}
		else {
			var series = g.series();
			for (var i = series.length - 1; i >= 0; i--) {
				numDataPoints = Math.max(numDataPoints, series[i].data.length);
			};
		}

		// Determine the proper column width
		var effectiveChartWidth = g.width() - g.padding().right - g.padding().left;
		var columnWidth = Math.floor((effectiveChartWidth / numDataPoints) / numColumnSeries);
		columnWidth -= 3; // Make columns slightly smaller for legibility
		
		// TODO: Both these checks *should* be unnecessary and thus safe to remove
		columnWidth = Math.max(columnWidth, 1);
		columnWidth = Math.min(columnWidth, effectiveChartWidth * 0.075)
		
		g.columnWidth(columnWidth);
		g.columnGroupWidth((columnWidth + 1) * numColumnSeries);
		g.columnGroupShift(columnWidth + 1);
		
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
		var colors = g.colors();
		
		var columnWidth = g.columnWidth();
		var columnGroupShift = g.columnGroupShift();
		
		var lineSeries;
		
		if(first) {
			
			//create a group to contain series
			g.seriesContainer = g.chartElement().append("g")
				.attr("id","seriesContainer");				
				
			lineSeries = g.seriesContainer.selectAll("path");
			columnSeries = g.seriesContainer.selectAll("g.seriesColumn");
			var columnGroups;
			var columnRects;
			var lineSeriesDots = g.seriesContainer.selectAll("g.lineSeriesDots");
			var scatterSeries = g.seriesContainer.selectAll("g.seriesScatter");			
				
			//create a group to contain the legend items
			g.legendItemContainer = g.chartElement().append("g")
				.attr("id","legendItemContainer");
				
				//add columns to chart
				columnGroups = columnSeries.data(sbt.column)
					.enter()
					.append("g") 
						.attr("class","seriesColumn seriesGroup")
						.attr("fill",function(d,i){return d.color? d.color : colors[i+sbt.line.length]})
						.attr("transform",function(d,i){return "translate("+(i*columnGroupShift - (columnGroupShift * (sbt.column.length-1)/2))+",0)"})
						
				columnGroups.selectAll("rect")
					.data(function(d,i){return d.data})
					.enter()
						.append("rect")
						.attr("width",columnWidth)
						.attr("height", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis()[yAxisIndex].scale(d)-g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis()[yAxisIndex].scale.domain())))})
						.attr("x", function(d,i) {
							return g.xAxis().scale(g.xAxisRef()[0].data[i])  - columnWidth/2
							})
						.attr("y",function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return (g.yAxis()[yAxisIndex].scale(d)-g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis()[yAxisIndex].scale.domain()))) >= 0 ? g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis()[yAxisIndex].scale.domain())) : g.yAxis()[yAxisIndex].scale(d)})
								
				
				//add lines to chart
				lineSeries.data(sbt.line)
					.enter()
					.append("path")
						.attr("d",function(d,j) { yAxisIndex = d.axis; pathString = g.yAxis()[d.axis].line(d.data).split("L0,0L").join("M");  return pathString.indexOf("NaN")==-1?pathString:"M0,0"})
						.attr("class","seriesLine seriesGroup")
						.attr("stroke",function(d,i){return d.color? d.color : colors[i]})
						.attr("stroke-width",3)
						.attr("stroke-linejoin","round")
						.attr("stroke-linecap","round")
						.attr("fill","none")
				
				lineSeriesDotGroups = lineSeriesDots.data(sbt.line)
					.enter()
					.append("g")
					.attr("class","lineSeriesDots seriesGroup")
					.attr("fill", function(d,i){return d.color? d.color : colors[i]})
				
				lineSeriesDotGroups
					.filter(function(d){return d.data.length < 15})
					.selectAll("circle")
					.data(function(d){ return d.data})
					.enter()
						.append("circle")
						.attr("r",4)
						.attr("transform",function(d,i){
							yAxisIndex = d3.select(this.parentNode).data()[0].axis; 
							return "translate("+(g.xAxis().type=="date" ?
								g.xAxis().scale(g.xAxisRef()[0].data[i]):
								g.xAxis().scale(i)) + "," + g.yAxis()[yAxisIndex].scale(d) + ")"
							})
							
				
				//add scatter to chart
				scatterGroups = scatterSeries.data(sbt.scatter)
					.enter()
					.append("g")
					.attr("class","seriesScatter seriesGroup")
					.attr("fill", function(d,i){return d.color? d.color : colors[i]})

				scatterDots = scatterGroups
					.selectAll("circle")
					.data(function(d){ return d.data})
				scatterDots.enter()
						.append("circle")
						.attr("r",4)
						.attr("stroke","#fff")
						.attr("stroke-width","1")
						.attr("transform",function(d,i){
							yAxisIndex = d3.select(this.parentNode).data()[0].axis; 
							return "translate("+(g.xAxis().type=="date" ?
								g.xAxis().scale(g.xAxisRef()[0].data[i]):
								g.xAxis().scale(i)) + "," + g.yAxis()[yAxisIndex].scale(d) + ")"
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
					.attr("fill",function(d,i){return d.color? d.color : colors[i+sbt.line.length]})
				
				var seriesColumns = columnGroups.enter()
					.append("g") 
						.attr("class","seriesColumn")
						.attr("fill",function(d,i){return d.color? d.color : colors[i+g.series().length]})
						.attr("transform",function(d,i){return "translate(0," + g.padding().top + ")"});
				
				var bargridLabel = columnGroups.selectAll("text.bargridLabel")
					.data(function(d,i){return [d]})
				
						
				bargridLabel.enter()
						.append("text")
						.attr("class","bargridLabel")
						.text(function(d,i){return d.name})
						.attr("x",g.yAxis()[0].scale(0))
						.attr("y",g.padding().top-18)
								
				bargridLabel.transition()
					.text(function(d,i){return d.name})
					.attr("x",g.yAxis()[0].scale(0))
					.attr("y",g.padding().top-18)
				
				bargridLabel.exit().remove()
				
				columnSeries.transition()
					.duration(500)
					.attr("transform",function(d,i){return "translate("+(i * ( g.width()-g.padding().left)/g.series().length)+",0)"})
					
				columnGroups.exit().remove()
				
				
				columnRects = columnGroups.selectAll("rect")
					.data(function(d,i){return d.data})
				
				columnRects.enter()
						.append("rect")
						.attr("height",20)
						.attr("width", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(0))})
						.attr("x", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return g.yAxis()[yAxisIndex].scale(0) - (d<0?Math.abs(g.yAxis()[yAxisIndex].scale(d)):0)})
						.attr("y",function(d,i) {return g.xAxis().scale(i) - 10})
				
				columnRects.transition()
					.duration(500)
					.attr("height",20)
					.attr("width", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(0))})
					.attr("x", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return g.yAxis()[yAxisIndex].scale(0) - (d<0?Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(0)):0)})
					.attr("y",function(d,i) {return g.xAxis().scale(i) - 10})
				
				//add label to each bar
				var barLabels = columnGroups.selectAll("text.barLabel")
					.data(function(d,i){return d.data})
					
				barLabels.enter()
					.append("text")
					.attr("class","barLabel")
					.text(function(d,i){return g.numberFormat(d)})
					.attr("x", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(0))})
					.attr("y",function(d,i) {return g.xAxis().scale(i) + 5})
					
				barLabels.transition()
					.text(function(d,i){var yAxisIndex = d3.select(this.parentNode).data()[0].axis; return (i==0?g.yAxis()[yAxisIndex].prefix.value:"") + g.numberFormat(d) + (i==0?g.yAxis()[yAxisIndex].suffix.value:"")})
					.attr("x", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return 3 + g.yAxis()[yAxisIndex].scale(0) - (d<0?Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(0)):0) + Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(0))})
					.attr("y",function(d,i) {return g.xAxis().scale(i) + 5})
				
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
					.attr("fill",function(d,i){return d.color? d.color : colors[i+sbt.line.length]})
				
				//remove bargrid labels
				columnGroups.selectAll("text.barLabel").remove()
				
				columnGroups.enter()
					.append("g") 
						.attr("class","seriesColumn")
						.attr("fill",function(d,i){return d.color? d.color : colors[i+sbt.line.length]})
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
						.attr("height", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis()[yAxisIndex].scale.domain())))})
						.attr("x",function(d,i) {return g.xAxis().scale(g.xAxisRef()[0].data[i])  - columnWidth/2})
						.attr("y",function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return (g.yAxis()[yAxisIndex].scale(d)-g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis()[yAxisIndex].scale.domain()))) >= 0 ? g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis()[yAxisIndex].scale.domain())) : g.yAxis()[yAxisIndex].scale(d)})
			
				columnRects.transition()
					.duration(500)
					.attr("width",columnWidth)
					.attr("height", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis()[yAxisIndex].scale.domain())))})
					.attr("x",g.xAxis().type =="date" ? 
							function(d,i) {return g.xAxis().scale(g.xAxisRef()[0].data[i])  - columnWidth/2}:
							function(d,i) {return g.xAxis().scale(i) - columnWidth/2}
					)
					.attr("y",function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return (g.yAxis()[yAxisIndex].scale(d)-g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis()[yAxisIndex].scale.domain()))) >= 0 ? g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis()[yAxisIndex].scale.domain())) : g.yAxis()[yAxisIndex].scale(d)})
				
				columnRects.exit().remove()
			
				//add lines
				lineSeries = g.seriesContainer.selectAll("path")
					.data(sbt.line)
					.attr("stroke",function(d,i){return d.color? d.color : colors[i]});

				lineSeries.enter()
					.append("path")
						.attr("d",function(d,j) { yAxisIndex = d.axis; pathString = g.yAxis()[d.axis].line(d.data).split("L0,0L").join("M0,0L"); return pathString;})
						.attr("class","seriesLine")
						.attr("stroke",function(d,i){return d.color? d.color : colors[i]})
						.attr("stroke-width",3)
						.attr("stroke-linejoin","round")
						.attr("stroke-linecap","round")
						.attr("fill","none");

				lineSeries.transition()
					.duration(500)
					.attr("d",function(d,j) { yAxisIndex = d.axis; pathString = g.yAxis()[d.axis].line(d.data).split("L0,0L").join("M0,0M"); return pathString;})

				lineSeries.exit().remove()
			
			
				//Add dots to the appropriate line series
				lineSeriesDotGroups = g.seriesContainer.selectAll("g.lineSeriesDots")
					.data(sbt.line)
					.attr("fill",function(d,i){return d.color? d.color : colors[i]})
			
				lineSeriesDotGroups
					.enter()
					.append("g")
					.attr("class","lineSeriesDots")
					.attr("fill", function(d,i){return d.color? d.color : colors[i]})
				
				lineSeriesDotGroups.exit().remove()
			
				lineSeriesDots = lineSeriesDotGroups.filter(function(d){return d.data.length < 15})
					.selectAll("circle")
					.data(function(d,i){return d.data})
					
				lineSeriesDotGroups.filter(function(d){return d.data.length > 15})
					.remove()
				
				
				lineSeriesDots.enter()
					.append("circle")
					.attr("r",4)
					.attr("transform",function(d,i){
						yAxisIndex = d3.select(this.parentNode).data()[0].axis;
							var y = d || d ===0 ? g.yAxis()[yAxisIndex].scale(d) : -100;
							return "translate("+ g.xAxis().scale(g.xAxisRef()[0].data[i]) + "," + y + ")";
						})
			
				lineSeriesDots.transition()
					.duration(500)
					.attr("transform",function(d,i){
						yAxisIndex = d3.select(this.parentNode).data()[0].axis;
							var y = d || d ===0 ? g.yAxis()[yAxisIndex].scale(d) : -100;
							return "translate("+ g.xAxis().scale(g.xAxisRef()[0].data[i]) + "," + y + ")";
						})
			
				lineSeriesDots.exit().remove()
								
				//add scatter
				scatterGroups = g.seriesContainer.selectAll("g.seriesScatter")
					.data(sbt.scatter)
					.attr("fill", function(d,i){return d.color? d.color : colors[i]})
				
				scatterGroups.enter()
					.append("g")
					.attr("class","seriesScatter")
					.attr("fill",function(d,i){return d.color? d.color : colors[i+sbt.line.length+sbt.column.length]})
				
				scatterGroups.exit().remove()
				
				scatterDots = scatterGroups
					.selectAll("circle")
					.data(function(d){return d.data})
					
				scatterDots.enter()
						.append("circle")
						.attr("r",4)
						.attr("stroke","#fff")
						.attr("stroke-width","1")
						.attr("transform",function(d,i){
							yAxisIndex = d3.select(this.parentNode).data()[0].axis;
							return "translate("+g.xAxis().scale(g.xAxisRef()[0].data[i]) + "," + g.yAxis()[yAxisIndex].scale(d) + ")"
							})
					
				scatterDots.transition()
						.duration(500)
						.attr("transform",function(d,i){
							yAxisIndex = d3.select(this.parentNode).data()[0].axis;
							return "translate("+g.xAxis().scale(g.xAxisRef()[0].data[i]) + "," + g.yAxis()[yAxisIndex].scale(d) + ")"
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
		
		var colors = g.colors();
		
		//remove current legends
		g.legendItemContainer.selectAll("g.legendItem").remove()
		
		if(!g.isBargrid()) {
			//add legend to chart
			var legendGroups = g.legendItemContainer.selectAll("g")
				.data(g.series());

			var legItems = 	legendGroups.enter()
				.append("g")
				.attr("class","legendItem")
				.attr("transform",function(d,i) {
					if(g.yAxis().length == 1) {
						return "translate("+g.padding().left+","+(g.padding().top-25)+")"
					}
					else {
						return "translate("+g.padding().left+","+(g.padding().top-50)+")"
					}
				});

			legendGroups.exit().remove()

			var legLabels = legItems.append("text")
					.filter(function(){return g.series().length > 1})
					.attr("class","legendLabel")
					.attr("x",12)
					.attr("y",18)
					.attr("fill",function(d,i){return d.color? d.color : colors[i]})
					.text(function(d,i){return d.name});
			
			//if there is more than one line
			if(g.series().length > 1) {
				legItems.append("rect")
					.attr("width",10)
					.attr("height",10)
					.attr("x",0)
					.attr("y",8)
					.attr("fill", function(d,i){return d.color? d.color : colors[i]})

				legendGroups.filter(function(d){return d != g.series()[0]})
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
							x = g.padding().left;
							legendItemY += 15;						
						}
						return "translate("+x+","+legendItemY+")";
				})
				//.filter(function(d,i){console.log(i,g.series().slice(0).pop()==d);return d == g.series().slice(0).pop()})
				//.each("end", function(d,i) {
				//	//the filter above makes sure this only hapens on the last one
				//	if (legendItemY > 0 && g.defaults.padding().top != legendItemY + 25) { //CHANGE
				//		g.defaults.padding().top = legendItemY + 25;
				//		g.all.redraw();
				//				
				//	};
				//})		
				//test if the chart needs more top margin because of a large number of legend items				
			} else {
				if(g.title() == "") {
					g.titleElement().text(g.series()[0].name)
				}
			}
		}
		
		return this;
	};
  
  this.updateMetaAndTitle = function Gneiss$updateMetaAndTitle() {
		var g = this;
		g.footerElement().attr("transform", "translate(0," + ( g.height() - 4) + ")");
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
			graph.xAxis().hasColumns = true;
		}
		else {
			graph.xAxis().hasColumns = false;
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
		this.seriesByType(this.splitSeriesByType(this.series()));
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