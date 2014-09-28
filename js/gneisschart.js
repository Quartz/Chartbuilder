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
Element.prototype.prependChild = function(child) {
	this.insertBefore(child, this.firstChild);
};

Date.setLocale('en');

//A default configuration
//Should change to more d3esque methods e.g. http://bost.ocks.org/mike/chart/
Gneiss.defaultGneissChartConfig = {
	container: "#chartContainer", //css id of target chart container
	editable: true, // reserved for enabling or dissabling on chart editing
	lineDotsThresholdSingle: 10, //line charts will have dots on points until a series has this number of points
	lineDotsThresholdTotal: 30, //line charts will have dots until all series together have this number of points
	lineDotRadius: 4, //the radius of dots used on line and scatter plots
	scatterDotRadius: 6, //the radius of dots used on line and scatter plots
	bargridLabelMargin: 4, //the horizontal space between a bargrid bar and it's label
	bargridAxisLabelMarginLeft: 20, //the horizontal minimum space between a bargrid label and a bar
	bargridBarThickness: 20, //thickness of the bars in a bargrid
	xAxisMargin: 8, //the vertical space between the plot area and the x axis
	footerMargin: 6, //the vertical space between the bottom of the bounding box and the meta information
	legendLabelSpacingX: 5, //the horizontal space between legend items
	legendLabelSpacingY: 4, //the vertical space between legend items
	columnGap: 1, //the horizontal space between two columns that have the same x-axis value
	columnGroupGap: 5, //the minimum horizontal space between two groups of columns a fixed amount or if less than 1 will be treated as a percentage
	axisBarGap: 5, //the horizontal space between a vertical axis and an adjacent bar
	maxColumnWidth: 7.5, // the maximum width of a column as a percent of the available chart width	primaryAxisPosition: "right", // the first axis will be rendered on this side, "right" or "left" only
	primaryAxisPosition: "right", // the first axis will be rendered on this side, "right" or "left" only
	allowAxisOverlap: false,
	legend: true, // whether or not there should be a legend
	title: "", // the chart title
	titlePlacement: "aligned", //fixed to stay at default padding, aligned to move with padding adjustemnts
	titleBottomMargin: 5, // the vertical space between the title and the next element (sometimes a legend, sometimes an axis)
	legendBottomMargin: 0, // the vertical space between the title and the chart area if there is a legend
	bargridLabelBottomMargin: 5, //the space between the bargrid series label and the top most bar
	bargridSeriesGap: 10, //the horizontal space betweet two bargrid series
	colors: ["BF0053","FF70B0","E15D98","C44B81","A63869","882551","6B133A","4D0022",
						"BF600A","FFC07E","E1A76A","C48D55","A67341","885A2D","6B4118","4D2704",
						"BFAA00","FFF270","E1D55D","C4B84B","A69C38","887F25","6B6213","4D4500",
						"00BFA5","70FFF7","5DE1D9","4BC4BC","38A69E","258880","136B63","004D45",
						"006DBF","70B8FF","5DA1E1","4B89C4","3871A6","255A88","13436B","002B4D",
						"9300BF","E770FF","CB5DE1","AE4BC4","9238A6","752588","59136B","3C004D"],
	customYAxisFormatter: function(axisGroup, i) { // a routine to be run over the y-axis to customize it
		var g = this;
		axisGroup.selectAll("g")
			.each(function(d, j) {
				//create an object to store axisItem info
				var axisItem = {};

				//store the position of the axisItem
				//(figure it out by parsing the transfrom attribute)
				axisItem.y = parseFloat(d3.select(this)
					.attr("transform")
					.split(")")[0]
					.split(",")[1]
				);
				//store the text element of the axisItem
				//align the text right position it on top of the line
				axisItem.text = d3.select(this).select("text")
					.attr("text-anchor", Gneiss.helper.axisSide(g.primaryAxisPosition(), i, "start", "end"))
					.attr("fill", Gneiss.helper.axisSide(g.primaryAxisPosition(), i, "#9c9c9c", g.yAxis()[i].color))
					.attr("x", 0) //CHANGE - MAGIC NUMBER (maybe?)
				.attr("y", -9);
			});
	},
	customXAxisFormatter: function(axisGroup) {
		var g = this;
		axisGroup.selectAll("text")
			.attr("text-anchor", function() {
				if (g.xAxis().type == "date") {
					return (g.seriesByType().column.length > 0 && g.seriesByType().line.length == 0 &&
						g.seriesByType().scatter.length == 0 ? "middle" : "start")
				} else {
					return "middle"
				}
			})
			.each(function() {
				var pwidth = this.parentNode.getBoundingClientRect().width
				var attr = this.parentNode.getAttribute("transform")
				var attrx = Number(attr.split("(")[1].split(",")[0])
				var attry = Number(attr.split(")")[0].split(",")[1])
				if (!g.isBargrid()) {
					// fix labels to not fall off edge when not bargrid
					if (pwidth + attrx > g.width()) {
						this.setAttribute("x", Number(this.getAttribute("x")) - (pwidth + attrx - g.width() + g.padding().right))
						this.setAttribute("text-anchor", "start")
					} else if (attrx - pwidth < 0) {
						this.setAttribute("text-anchor", "start")
					}
					g.padding().left = g.defaultPadding().left
				}
			});
	},
	customSetExtraPadding: function() {
		var g = this,
			padding_top = g.padding().top,
			padding_bottom = g.padding().bottom,
			padding_left = g.padding().left,
			padding_right = g.padding().right;
	},
	padding: { //the padding is the space from the margin to the chart area
		top: 5,
		bottom: 60,
		left: 10,
		right: 10
	},
	margin: { //the margin is the space between the edge of the image and the next closest item
		top: 0,
		bottom: 0,
		left: 5,
		right: 5
	},
	xAxis: {
		domain: [0, 100],
		prefix: "",
		suffix: "",
		type: "linear",
		formatter: null,
		mixed: true,
		ticks: 5
	},
	yAxis: [{
		domain: [null, null],
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
	}],
	series: [{
		name: "Apples",
		data: [5.5, 14, 6.1, 3.8],
		source: "Some Org",
		type: "line",
		axis: 0,
		color: null
	}, {
		name: "Oranges",
		data: [23, 10, 13, 7],
		source: "Some Org",
		type: "line",
		axis: 0,
		color: null
	}],
	xAxisRef: [{
		name: "names",
		data: ["juicyness", "color", "flavor", "travelability"]
	}],
	sourceline: "",
	creditline: "Made with Chartbuilder"
};

Gneiss.dateParsers = {
	"mmddyyyy": function(d) {
		return [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/");
	},
	"ddmmyyyy": function(d) {
		return [d.getDate(), d.getMonth() + 1, d.getFullYear()].join("/");
	},
	"mmdd": function(d) {
		return [d.getMonth() + 1, d.getDate()].join("/");
	},
	"Mdd": function(d) {
		var month = d.getMonth() + 1;
		if (month == 5) {
			return d.format('{Mon}') + " " + d.getDate();
		} else {
			return d.format('{Mon}.') + " " + d.getDate();
		}
	},
	"ddM": function(d) {
		var month = d.getMonth() + 1;
		if (month == 5) {
			return "" + d.getDate() + " " + d.format('{Mon}');
		} else {
			return "" + d.getDate() + " " + d.format('{Mon}.');
		}
	},
	"mmyy": function(d) {
		return [d.getMonth() + 1, String(d.getFullYear()).split("").splice(2, 2).join("")].join("/");
	},
	"yy": function(d) {
		return "’" + String(d.getFullYear()).split("").splice(2, 2).join("");
	},
	"yyyy": function(d) {
		return "" + d.getFullYear();
	},
	"MM": function(d) {
		var month = d.getMonth() + 1;
		if (month == 1) {
			return "" + d.getFullYear();
		} else {
			return d.format('{Month}');
		}
	},
	"M": function(d) {
		var month = d.getMonth() + 1;
		if (month == 1) {
			return "’" + String(d.getFullYear()).split("").splice(2, 2).join("");
		} else if (month == 5) {
			return d.format('{Mon}');
		} else {
			return d.format('{Mon}.');
		}
	},
	"hmm": function(d) {
		if (d.getHours() === 0 && d.getMinutes() === 0) {
			return Gneiss.dateParsers.Mdd(d);
		}

		if (Date.getLocale().code == 'en') {
			return d.format('{12hr}:{mm}{tt}');
		} else {
			return d.format('{24hr}:{mm}{tt}');
		}
	},
	"QJan": function(d) {
		var year = d.getFullYear();
		var month = d.getMonth() + 1;
		var day = d.getDate();
		if (day == 1) {
			if (month == 1) {
				return year;
			}

			if (month == 4 || month == 7 || month == 10) {
				return "Q" + (((month - 1) / 3) + 1);
			}

		}

		return "";
	},
	"QJul": function(d) {
		var year = d.getFullYear();
		var month = d.getMonth() + 1;
		var day = d.getDate();
		if (day == 1) {
			if (month == 7) {
				return year;
			}

			if (month == 1) {
				return "Q3";
			}

			if (month == 4) {
				return "Q4";
			}

			if (month == 10) {
				return "Q2";
			}

		}

		return "";

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
		if (d > 0 && domain[0] > 0) {
			return domain[0];
		} else if (d < 0 && domain[1] < 0) {
			return domain[1];
		}
		return 0;
	},
	exactTicks: function(domain, numticks) {
		numticks -= 1;
		var ticks = [];
		var delta = domain[1] - domain[0];
		for (var i = 0; i < numticks; i++) {
			ticks.push(domain[0] + (delta / numticks) * i);
		}
		ticks.push(domain[1]);

		if (domain[1] * domain[0] < 0) {
			//if the domain crosses zero, make sure there is a zero line
			var hasZero = false;
			for (var i = ticks.length - 1; i >= 0; i--) {
				//check if there is already a zero line
				if (ticks[i] == 0) {
					hasZero = true;
				}
			}
			if (!hasZero) {
				ticks.push(0);
			}
		}

		return ticks;
	},
	transformCoordOf: function(elem) {
		var separator = elem.attr("transform").indexOf(",") > -1 ? "," : " ";
		var trans = elem.attr("transform").split(separator);
		return {
			x: (trans[0] ? parseFloat(trans[0].split("(")[1]) : 0),
			y: (trans[1] ? parseFloat(trans[1].split(")")[0]) : 0)
		};
	},
	wrap: function(text, size) {
		//from http://bl.ocks.org/mbostock/7555321
		text.each(function() {
			var text = d3.select(this),
				words = text.text().split(/[\s]+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.2, // ems
				y = text.attr("y"),
				x = text.attr("x"),
				dy = parseFloat(text.attr("dy")) || 0,
				tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
			text.attr("dy", null)
			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > size) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", lineHeight + "em").text(word);
				}
			}
		});
	},
	axisSide: function(def, i, when_left, when_right) {
		if (def == "left") {
			return i === 0 ? when_left : when_right;
		} else if (def == "right") {
			return i === 0 ? when_right : when_left;
		}

		console.error("default axis is not defined properly");
	},
	willRenderLineDots: function(lineData, threshSingle, threshTotal) {
		if (!lineData.length) return false;

		var withinSingle = lineData.some(function(d) {
			return d.data.length < threshSingle;
		});

		// test whether length of all data is under total threshold
		var withinTotal = (lineData.map(function(d) {
				return d.data;
			})
			.reduce(function(a, b) {
				return a.concat(b)
			}).length < threshTotal)

		return (withinSingle && withinTotal)
	}
};

function Gneiss(config) {
	var containerElement;
	var chartElement;
	var titleElement;
	var footerElement;
	var sourceElement;
	var creditElement;
	var seriesContainer;


	var defaultPadding;
	var padding
	var defaultMargin;
	var margin
	var containerId;
	var seriesByType;
	var width;
	var height;
	var isBargrid;
	var hasColumns = false;
	var hasLines = true;
	var hasScatter = false;
	var title;
	var sourceLine;
	var creditLine;
	var legend;
	var colors;
	var xAxis;
	var yAxis;
	var series;
	var xAxisRef;

	var lineDotsThresholdSingle;
	var lineDotsThresholdTotal;
	var lineDotRadius;
	var scatterDotRadius;
	var bargridLabelMargin;
	var bargridAxisLabelMarginLeft;
	var bargridBarThickness;
	var xAxisMargin;
	var footerMargin;
	var primaryAxisPosition;
	var legendLabelSpacingX;
	var legendLabelSpacingY;
	var columnGap;
	var maxColumnWidth;
	var titleBottomMargin;
	var legendBottomMargin;
	var bargridLabelBottomMargin;
	var bargridSeriesGap;
	var axisBarGap;
	var allowAxisOverlap;


	var columnWidth;
	var columnGroupWidth;
	var columnGroupShift;
	var columnGroupGap;

	var customYAxisFormatter;
	var customXAxisFormatter;
	var customSetExtraPadding;

	var titlePlacement;

	var redrawCount = 0;

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

	this.seriesContainer = function Gneiss$seriesContainer(elem) {
		if (!arguments.length) {
			return seriesContainer;
		}
		seriesContainer = elem;
	};

	this.legendItemContainer = function Gneiss$legendItemContainer(elem) {
		if (!arguments.length) {
			return legendItemContainer;
		}
		legendItemContainer = elem;
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

	this.defaultMargin = function Gneiss$defaultMargin(m) {
		if (!arguments.length) {
			return defaultMargin;
		}
		defaultMargin = m;
	};

	this.margin = function Gneiss$margin(p) {
		if (!arguments.length) {
			return margin;
		}
		margin = p;
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

	this.seriesByType = function Gneiss$seriesByType() {
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
			//if there is no shift the shift is zero
			return columnGroupShift ? columnGroupShift : 0;
		}
		columnGroupShift = w;
	};

	this.lineDotsThresholdSingle = function Gneiss$lineDotsThresholdSingle(n) {
		if (!arguments.length) {
			return lineDotsThresholdSingle;
		}
		lineDotsThresholdSingle = n;
	};

	this.lineDotsThresholdTotal = function Gneiss$lineDotsThresholdTotal(n) {
		if (!arguments.length) {
			return lineDotsThresholdTotal;
		}
		lineDotsThresholdTotal = n;
	};

	this.lineDotRadius = function Gneiss$lineDotRadius(n) {
		if (!arguments.length) {
			return lineDotRadius;
		}
		lineDotRadius = n;
	};

	this.scatterDotRadius = function Gneiss$scatterDotRadius(n) {
		if (!arguments.length) {
			return scatterDotRadius;
		}
		scatterDotRadius = n;
	};

	this.bargridLabelMargin = function Gneiss$bargridLabelMargin(n) {
		if (!arguments.length) {
			return bargridLabelMargin;
		}
		bargridLabelMargin = n;
	};

	this.bargridAxisLabelMarginLeft = function Gneiss$bargridAxisLabelMarginLeft(n) {
		if (!arguments.length) {
			return bargridAxisLabelMarginLeft;
		}
		bargridAxisLabelMarginLeft = n;
	};

	this.bargridBarThickness = function Gneiss$bargridBarThickness(n) {
		if (!arguments.length) {
			return bargridBarThickness;
		}
		bargridBarThickness = n;
	};

	this.bargridSeriesGap = function Gneiss$bargridSeriesGap(n) {
		if(!arguments.length) {
			return bargridSeriesGap
		}
		bargridSeriesGap = n;

	}

	this.xAxisMargin = function Gneiss$xAxisMargin(n) {
		if (!arguments.length) {
			return xAxisMargin;
		}
		xAxisMargin = n;
	};

	this.footerMargin = function Gneiss$footerMargin(n) {
		if (!arguments.length) {
			return footerMargin;
		}
		footerMargin = n;
	};

	this.primaryAxisPosition = function Gneiss$primaryAxisPosition(n) {
		if (!arguments.length) {
			return primaryAxisPosition;
		}
		primaryAxisPosition = n;
	};

	this.legendLabelSpacingX = function Gneiss$legendLabelSpacingX(n) {
		if (!arguments.length) {
			return legendLabelSpacingX;
		}
		legendLabelSpacingX = n;
	};

	this.legendLabelSpacingY = function Gneiss$legendLabelSpacingY(n) {
		if (!arguments.length) {
			return legendLabelSpacingY;
		}
		legendLabelSpacingY = n;
	};

	this.columnGap = function Gneiss$columnGap(n) {
		if (!arguments.length) {
			return columnGap;
		}
		columnGap = n;
	};

	this.maxColumnWidth = function Gneiss$maxColumnWidth(n) {
		if (!arguments.length) {
			return maxColumnWidth;
		}
		maxColumnWidth = n;
	};

	this.titleBottomMargin = function Gneiss$titleBottomMargin(n) {
		if (!arguments.length) {
			return titleBottomMargin;
		}

		titleBottomMargin = n;
	};

	this.legendBottomMargin = function Gneiss$legendBottomMargin(n) {
		if (!arguments.length) {
			return legendBottomMargin
		}

		legendBottomMargin = n;
	}

	this.bargridLabelBottomMargin = function Gneiss$bargridLabelBottomMargin(n) {
		if (!arguments.length) {
			return bargridLabelBottomMargin;
		}

		bargridLabelBottomMargin = n;
	};

	this.axisBarGap = function Gneiss$axisBarGap(n) {
		if (!arguments.length) {
			return axisBarGap;
		}

		axisBarGap = n;
	};

	this.allowAxisOverlap = function Gneiss$allowAxisOverlap(b) {
		if (!arguments.length) {
			return allowAxisOverlap;
		}

		allowAxisOverlap = b;
	};

	this.hasColumns = function Gneiss$hasColumns(b) {
		if (!arguments.length) {
			return hasColumns;
		}

		hasColumns = b;
	};

	this.hasLines = function Gneiss$hasLines(b) {
		if (!arguments.length) {
			return hasLines;
		}

		hasLines = b;
	};

	this.hasScatter = function Gneiss$hasScatter(b) {
		if (!arguments.length) {
			return hasScatter;
		}

		hasScatter = b;
	};

	this.columnGroupGap = function Gneiss$columnGroupGap(n) {
		if (!arguments.length) {
			return columnGroupGap
		}

		columnGroupGap = n;
	}

	this.customYAxisFormatter = function Gneiss$customYAxisFormatter(f) {

		if (!arguments.length) {
			return customYAxisFormatter;
		}

		customYAxisFormatter = f;

		var g = this;

	};

	this.customXAxisFormatter = function Gneiss$customXAxisFormatter(f) {

		if (!arguments.length) {
			return customXAxisFormatter;
		}

		customXAxisFormatter = f;

		var g = this;

	};

	this.titlePlacement = function Gneiss$titlePlacement(s) {

		if (!arguments.length) {
			return titlePlacement;
		}

		titlePlacement = s;
	};

	this.customSetExtraPadding = function Gneiss$customSetExtraPadding(f) {

		if (!arguments.length) {
			return customSetExtraPadding;
		}

		customSetExtraPadding = f;

	};

	this.redrawCount = function Gneiss$redrawCount(n) {
		if (!arguments.length) {
			return redrawCount
		}

		redrawCount = n;

	}

	this.build = function Gneiss$build(config) {
		/*
			Initializes the chart from a config object
		*/

		if (!config) {
			throw new Error("build() must be called with a chart configuration");
		}

		var g = this;

		// Set container as a jQuery object wrapping the DOM element specified in the config
		if (!config.container) {
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
		g.defaultMargin($.extend(true, {}, config.margin));
		g.margin($.extend(true, {}, config.margin));
		g.lineDotsThresholdSingle(config.lineDotsThresholdSingle * 1);
		g.lineDotsThresholdTotal(config.lineDotsThresholdTotal * 1);
		g.lineDotRadius(config.lineDotRadius * 1);
		g.scatterDotRadius(config.scatterDotRadius * 1);
		g.bargridLabelMargin(config.bargridLabelMargin * 1);
		g.bargridAxisLabelMarginLeft(config.bargridAxisLabelMarginLeft * 1);
		g.bargridBarThickness(config.bargridBarThickness * 1);
		g.xAxisMargin(config.xAxisMargin * 1);
		g.footerMargin(config.footerMargin * 1);
		g.primaryAxisPosition(config.primaryAxisPosition.slice());
		g.legendLabelSpacingX(config.legendLabelSpacingX * 1);
		g.legendLabelSpacingY(config.legendLabelSpacingY * 1);
		g.columnGap(config.columnGap * 1);
		g.maxColumnWidth(config.maxColumnWidth * 1);
		g.titleBottomMargin(config.titleBottomMargin * 1);
		g.legendBottomMargin(config.legendBottomMargin * 1);
		g.bargridLabelBottomMargin(config.bargridLabelBottomMargin * 1);
		g.bargridSeriesGap(config.bargridSeriesGap *1);
		g.axisBarGap(config.axisBarGap * 1);
		g.allowAxisOverlap(config.allowAxisOverlap);
		g.columnGroupGap(config.columnGroupGap * 1);
		g.customYAxisFormatter(config.customYAxisFormatter);
		g.customXAxisFormatter(config.customXAxisFormatter);
		g.titlePlacement(config.titlePlacement.slice());
		g.customSetExtraPadding(config.customSetExtraPadding);


		//append svg to container using svg
		g.chartElement(d3.select(g.containerId()).append("svg")
			.attr("id", "chart")
			.attr("width", "100%") //set width to 100%
			.attr("height", "100%")); //set height to 100%

		g.width(g.containerElement().width()); //save the width in pixels
		g.height(g.containerElement().height()); //save the height in pixels

		//add rect, use as a background to prevent transparency
		g.chartElement().append("rect")
			.attr("id", "ground")
			.attr("width", g.width())
			.attr("height", g.height());

		//add a rect to allow for styling of the chart area
		g.chartElement().append("rect")
			.attr("id", "plotArea")
			.attr("width", g.width())
			.attr("height", g.height());

		//group the series by their type
		this.updateGraphPropertiesBasedOnSeriesType.call(g);

		g.seriesContainer(g.chartElement().append("g")
			.attr("id", "seriesContainer"));

		//create a group to contain the legend items
		g.legendItemContainer(g.chartElement().append("g")
			.attr("id", "legendItemContainer"));

		g.titleElement(g.chartElement().append("text")
			.attr("y", g.margin().top)
			.attr("dy", "1em")
			.attr("x", g.titlePlacement() == "aligned" ? g.padding().left + g.margin().left : g.margin().left)
			.attr("id", "titleLine")
			.text(g.title()));

		g.footerElement(g.chartElement().append("g")
			.attr("id", "metaInfo")
			.attr("transform", "translate(0," + (g.height() - g.margin().bottom) + ")"));

		g.sourceElement(g.footerElement().append("text")
			.attr("text-anchor", "end")
			.attr("x", g.width() - g.padding().right - g.margin().right)
			.attr("class", "metaText")
			.text(g.source()));

		g.creditElement(g.footerElement().append("text")
			.attr("x", g.titlePlacement() == "aligned" ? g.padding().left + g.margin().left : g.margin().left)
			.attr("class", "metaText")
			.text(g.credit()));

		g.updateMetaAndTitle();

		this.calculateColumnWidths()
			.setYScales()
			.setXScales()
			.setYAxes(true)
			.setXAxis(true);

		this.drawSeriesAndLegend(true);

		return this;
	};

	this.numberFormat = d3.format(",");

	this.resize = function Gneiss$resize() {
		/*
			Adjusts the size dependent stored variables
		*/
		var g = this;

		// Save the width and height in pixels
		g.width(g.containerElement().width());
		g.height(g.containerElement().height());

		//g.updateMetaAndTitle();

		return this;
	};

	this.setYScales = function Gneiss$setYScales() {
		/*
		 * Calculate and store the left and right y-axis scale information
		 */

		var g = this;
		var y = g.yAxis();
		var p = g.padding();
		var m = g.margin();
		var series = g.series()
		var calculatedDomain

		for (var i = series.length - 1; i >= 0; i--) {
			// Plot this series against the right y-axis if no axis has been defined yet
			if (series[i].axis === undefined) {
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

			if (y[i]) {
				calculatedDomain = Gneiss.helper.multiextent(g.series(), function(a) {
					if (a.axis === i || (useLowestValueInAllSeries && i == 0)) {
						// This series is charted against this axis
						// OR
						// This is the right y-axis and it should be rooted at
						// the lowest value in any series regardless of axis
						return a.data;
					}
					return [];
				})

				for (var j = y[i].domain.length - 1; j >= 0; j--) {
					if (y[i].domain[j] === null) {
						// only use the calculated domain limit if one isn't specified
						y[i].domain[j] = calculatedDomain[j];
					}
				}

				if (g.isBargrid()) {
					y[i].domain[0] = Math.min(y[i].domain[0], 0);
				}
			}
		}

		//set extremes in y axis objects and create scales
		for (var i = y.length - 1; i >= 0; i--) {
			if (!y[i].scale) {
				y[i].scale = d3.scale.linear();
			}
			y[i].scale.domain(y[i].domain);
		}

		if (g.isBargrid()) {
			var width = (g.width() - p.left - m.left -p.right - m.right) / g.seriesByType().bargrid.length;
			for (var i = y.length - 1; i >= 0; i--) {
				y[i].scale.range([0, width - g.bargridSeriesGap()])
			}
		} else {
			for (var i = y.length - 1; i >= 0; i--) {
				y[i].scale.range([g.height() - p.bottom - m.bottom, p.top + m.top]).nice();
			}
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
			padding_right = g.defaultPadding().right;

		//Add the height of the title line to the padding, if the title line has a height
		//Add the height of the axis label if there is no title
		title_height = g.titleElement()[0][0].getBoundingClientRect().height;
		axis_label_height = d3.selectAll(".yAxis text")[0][0].getBoundingClientRect().height

		//adjust for how much of the label is above the axis line
		axis_label_height -= axis_label_height * parseFloat(d3.selectAll(".yAxis text")[0][0].getAttribute("dy"));

		//if there is a title add the height of it and its margin to the padding
		padding_top += title_height > 0 ? title_height + g.titleBottomMargin() : 0 //axis_label_height + g.titleBottomMargin();

		if (g.isBargrid()) {
			//bargrid specific padding adjustments
			try {
				//if this is a bargrid add padding to account for the series label
				var bargridLabel_rect = d3.selectAll(".bargridLabel")[0][0].getBoundingClientRect();
			} catch (e) { /* A race condition that doesn't matter was met, setPadding will be called again and everything will be okay*/
				//the bargridLabels haven't been created yet...which is bad...and needs to be fixed
				bargridLabel_rect = {
					height: 26.2
				}

			}
			padding_top += bargridLabel_rect.height + g.bargridLabelBottomMargin();


			//make sure all the labels are still on the chart
			var longestItem = {
				elem: {}, //the element
				over_by: 0, //how far off the edge it is
				right: 0
			}

			d3.selectAll("g.barLabelGroup").each(function(d, i) {
				var label_rect = this.getBoundingClientRect();
				var over_by = 0
				var under_by = 0
				var right = label_rect.width + Gneiss.helper.transformCoordOf(d3.select(this)).x

				//if (label_rect.right > g.width() - g.margin().right) {
				//the label will fall off the edge and thus the chart needs more padding

				if (right > longestItem.right) {
					over_by = right - g.width() - g.margin().right;
					longestItem.elem = this;
					longestItem.over_by = over_by
					longestItem.right = right
					longestItem.rect = label_rect

				}

				//}

			});


			if(longestItem.right > 0) {
				padding_right = longestItem.rect.width * g.seriesByType().bargrid.length
			}
			


			d3.selectAll("#xAxis text").call(function(axis_text) {
				var widest_label_width = 0;

				//find the longest label
				axis_text.each(function(d, i) {
					var label_width = this.getBoundingClientRect().width;
					widest_label_width = Math.max(widest_label_width, label_width);
				});

				//calculate how much padding there should be
				var new_padding = widest_label_width + g.bargridAxisLabelMarginLeft();

				if (new_padding != g.padding().left) {
					//if there is less padding than there should be change the padding and redraw
					padding_left = new_padding;
				}
			})


		} else {
			//other chart type padding adjustments
			try {
				//if `there's a legend and there is more than one series and there's not a title add the height of the legend and the legend margin
				var legendItem_rect = d3.selectAll("g#legendItemContainer")[0][0].getBoundingClientRect();

			} catch (e) {
				/* this happens when switching from a bargrid back to a standard chart*/
				//the legend hasn't been created yet...whcih is is bad and need to be fixed
				legendItem_rect = {
					height: 22
				}

			}

			padding_top += (g.legend() && g.series().length > 1) ? legendItem_rect.height + g.legendBottomMargin() : 0;

			//if there is more than one axis or the default axis is on the left and it isn't a bar grid
			//add enough space for the top axis label
			padding_top += (g.yAxis().length > 1 || g.primaryAxisPosition() == "left") ? axis_label_height : 0;


		}

		//add the height of the source line if there is a sourceline and it's more than one line
		padding_bottom += g.sourceElement().text() != "" && g.sourceElement().attr("dy") != 0 ? g.footerElement()[0][0].getBoundingClientRect().height - g.creditElement()[0][0].getBoundingClientRect().height : 0;

		g.padding().top = padding_top;
		g.padding().bottom = padding_bottom;
		g.padding().right = padding_right;
		g.padding().left = padding_left;


		g.customSetExtraPadding().call(g)

		return this;
	};

	this.setXScales = function Gneiss$setXScales() {
		/*
		 * Calculate and store the x-axis scale information
		 */

		var g = this;
		var x = g.xAxis();
		var data = g.xAxisRef()[0].data;
		var p = g.padding();
		var m = g.margin();

		// Calculate extremes of x-axis
		if (x.type == "date") {
			var dateExtent = d3.extent(data);

			// Create a linear scale with date keys between the input start and end dates
			x.scale = d3.time.scale().domain(dateExtent);
		} else {
			// Create a ordinal scale with with row name keys
			x.scale = d3.scale.ordinal().domain(data);
		}

		// Set the range of the x-axis
		var rangeArray = [];
		var left;
		var right;
		var o = {
			"left": 0,
			"right": 0
		}

		if (g.isBargrid()) {
			rangeArray = [p.top + m.top, g.height() - p.bottom - m.bottom];
		} else if (!g.allowAxisOverlap() || g.hasColumns()) {
			try {
				if (g.yAxis().length == 1) {
					//if there is only one yAxis
					if (g.primaryAxisPosition() == "left") {
						//if the primary axis is on the left

						//start the range at the width of the second highest axis item on the left axis
						o.left = m.left + p.left + d3.selectAll("#leftAxis.yAxis g:not(.topAxisItem) text")[0].pop().getBoundingClientRect().width

						//end the range at the right padding
						o.right = g.width() - p.right - m.right


					} else {
						//if the primary axis on the right

						//start the range at left padding
						o.left = p.left

						o.right = g.width() - p.right - d3.selectAll("#rightAxis.yAxis g:not(.topAxisItem) text")[0].pop().getBoundingClientRect().width
					}
				} else {
					//if there are multiple yAxes
					//start the range at the width of the second highest axis item on the left axis
					o.left = p.left + m.left + d3.selectAll("#leftAxis.yAxis g:not(.topAxisItem) text")[0].pop().getBoundingClientRect().width

					//end the range at the right padding
					o.right = g.width() - p.right - m.right - d3.selectAll("#rightAxis.yAxis g:not(.topAxisItem) text")[0].pop().getBoundingClientRect().width

				}

				if (g.hasColumns()) {
					var halfColumnWidth = g.columnGroupWidth() / 2;
					o.left += halfColumnWidth + g.axisBarGap()
					o.right -= (halfColumnWidth + g.axisBarGap())

					if (g.series()[0].data.length < 4) {
						o.left += g.width() / (g.series().length / 2) / 8
						o.right -= g.width() / (g.series().length / 2) / 8
					}
				}

				rangeArray = [o.left, o.right];
			} catch (e) {
				//the this happens when the axis hasn't been created yet
				rangeArray = [p.left + m.left, g.width() - p.right - m.right];
			}

		} else {
			rangeArray = [p.left + m.left, g.width() - p.right - m.right];
		}

		if (x.type == "date") {
			x.scale.range(rangeArray);
		} else {
			//defaults to ordinal
			x.scale.rangePoints(rangeArray);
		}

		return this;
	};

	this.setLineMakers = function Gneiss$setLineMakers(first) {
		var g = this;

		for (var i = g.yAxis().length - 1; i >= 0; i--) {
			if (first || !g.yAxis()[i].line) {
				g.yAxis()[i].line = d3.svg.line();
			}

			g.yAxis()[i].line.y(function(d, j) {
				return g.yAxis()[yAxisIndex].scale(d)
			});
			g.yAxis()[i].line.x(function(d, j) {
				return g.xAxis().scale(g.xAxisRef()[0].data[j])
			});
			//if the data point is not a number create a break in the line
			g.yAxis()[i].line.defined(function(d, j) {
				return !isNaN(d) && d != null
			})

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
		if (g.yAxis().length == 1) {
			d3.select(g.primaryAxisPosition() == "right" ? "#leftAxis" : "#rightAxis").remove();
		}

		for (var i = g.yAxis().length - 1; i >= 0; i--) {
			curAxis = g.yAxis()[i];
			//create svg axis
			if (first || !g.yAxis()[i].axis) {
				curAxis.axis = d3.svg.axis()
					.scale(g.yAxis()[i].scale)
					.orient(Gneiss.helper.axisSide(g.primaryAxisPosition(), i, "right", "left"))
					.tickSize(g.width() - g.margin().left - g.margin().right - (g.yAxis().length > 1 ? 0 : g.padding().right))
				//.ticks(g.yAxis()[0].ticks) // I'm not using built in ticks because it is too opinionated
				.tickValues(g.yAxis()[i].tickValues ? curAxis.tickValues : Gneiss.helper.exactTicks(curAxis.scale.domain(), g.yAxis()[0].ticks))

				//append axis container

				axisGroup = g.chartElement().append("g")
					.attr("class", "axis yAxis")
					.attr("id", Gneiss.helper.axisSide(g.primaryAxisPosition(), i, "leftAxis", "rightAxis"))
					.attr("transform", "translate(" + Gneiss.helper.axisSide(g.primaryAxisPosition(), i, g.margin().left, g.width() - g.margin().right) + ",0)")
					.call(curAxis.axis);
			} else {
				curAxis.axis //.ticks(`)[0].ticks) // I'm not using built in ticks because it is too opinionated
				.tickValues(curAxis.tickValues ? curAxis.tickValues : Gneiss.helper.exactTicks(curAxis.scale.domain(), g.yAxis()[0].ticks))
					.scale(g.yAxis()[i].scale)
					.orient(Gneiss.helper.axisSide(g.primaryAxisPosition(), i, "right", "left"))
					.tickSize(g.width() - g.margin().left - g.margin().right - (g.yAxis().length > 1 ? 0 : g.padding().right));


				axisGroup = g.chartElement().selectAll(Gneiss.helper.axisSide(g.primaryAxisPosition(), i, "#leftAxis", "#rightAxis"))
					.attr("transform", "translate(" + Gneiss.helper.axisSide(g.primaryAxisPosition(), i, g.margin().left, g.width() - g.margin().right) + ",0)")
					.call(curAxis.axis);

			}

			//adjust label position and add prefix and suffix
			var topAxisLabel, minY = Infinity;

			axisGroup
				.selectAll("g")
				.each(function(d, j) {
					//create an object to store axisItem info
					var axisItem = {
						"item": d3.select(this).classed("topAxisItem", false)
					};

					//store the position of the topAxisItem
					//(figure it out by parsing the transfrom attribute)
					axisItem.y = parseFloat(axisItem.item
						.attr("transform")
						.split(")")[0]
						.split(",")[1]
					);

					//store the text element of the axisItem
					axisItem.text = d3.select(this).select("text");

					//store the line element of the axisItem
					axisItem.line = d3.select(this).select("line")


					//apply the prefix as appropriate
					switch (curAxis.prefix.use) {
						case "all":
							//if the prefix is supposed to be on every axisItem label, put it there
							axisItem.text.text(curAxis.prefix.value + axisItem.text.text());
							break;

						case "positive":
							//if the prefix is supposed to be on positive values and it's positive, put it there
							if (parseFloat(axisItem.text.text()) > 0) {
								axisItem.text.text(curAxis.prefix.value + axisItem.text.text());
							}
							break;

						case "negative":
							//if the prefix is supposed to be on negative values and it's negative, put it there
							if (parseFloat(axisItem.text.text()) < 0) {
								axisItem.text.text(curAxis.prefix.value + axisItem.text.text());
							}
							break;

						case "top":
							//do nothing
							break;
					}

					//apply the suffix as appropriate
					switch (curAxis.suffix.use) {
						case "all":
							//if the suffix is supposed to be on every axisItem label, put it there
							axisItem.text.text(axisItem.text.text() + curAxis.suffix.value);
							break;

						case "positive":
							//if the suffix is supposed to be on positive values and it's positive, put it there
							if (parseFloat(axisItem.text.text()) > 0) {
								axisItem.text.text(axisItem.text.text() + curAxis.suffix.value);
							}
							break;

						case "negative":
							//if the suffix is supposed to be on negative values and it's negative, put it there
							if (parseFloat(axisItem.text.text()) < 0) {
								axisItem.text.text(axisItem.text.text() + curAxis.suffix.value);
							}
							break;

						case "top":
							//do nothing
							break;
					}

					//find the top most axisItem
					//store its text element
					if (axisItem.y < minY) {
						topAxisLabel = axisItem.text;
						g.topAxisItem = axisItem;
						minY = axisItem.y;
					}


					if (parseFloat(axisItem.text.text()) == 0) {
						if (d == 0) {
							//if the axisItem represents the zero line
							//change it's class and make sure there's no decimal
							d3.select(this).classed("zero", true);
							axisItem.text.text("0");
						} else {
							// A non-zero value was rounded into a zero
							// hide the whole group
							d3.select(this).style("display", "none");
						}

					}
				});

			//class the top label as top
			g.topAxisItem.item.classed("topAxisItem", true);


			//add the prefix and suffix to the top most label as appropriate
			if (curAxis.suffix.use == "top" && curAxis.prefix.use == "top") {
				//both preifx and suffix should be added to the top most label
				if (topAxisLabel) {
					topAxisLabel.text(g.yAxis()[i].prefix.value + topAxisLabel.text() + g.yAxis()[i].suffix.value);
				} else {

				}

			} else if (curAxis.suffix.use == "top") {
				//only the suffix should be added (Because the prefix is already there)
				topAxisLabel.text(topAxisLabel.text() + g.yAxis()[i].suffix.value);
			} else if (curAxis.prefix.use == "top") {
				//only the prefix should be added (Because the suffix is already there)
				topAxisLabel.text(g.yAxis()[i].prefix.value + topAxisLabel.text());
			}

			g.customYAxisFormatter().call(g, axisGroup, i);

		}

		try {
			//the title will always be the same distance from the top, and will always be the top most element
			g.titleElement().attr("y", g.margin().top);
		} catch (e) { /* There isn't a title element and I dont care to let you know */ }

		if (g.isBargrid()) {
			//if it's a bargrid turn off the yAxis
			d3.selectAll(".yAxis").style("display", "none");
		} else {
			//isn't a bargrid so set the yAxis back to the default display prop
			d3.selectAll(".yAxis").style("display", null);
		}

		//reagrange these elements in this stack order from top to bottom
		d3.selectAll(Gneiss.helper.axisSide(g.primaryAxisPosition(), 1, "#leftAxis", "#rightAxis")).each(function() {
			this.parentNode.prependChild(this);
		}); //the secondary axis
		d3.selectAll(Gneiss.helper.axisSide(g.primaryAxisPosition(), 0, "#leftAxis", "#rightAxis")).each(function() {
			this.parentNode.prependChild(this);
		}); //the primary axis
		d3.selectAll("#xAxis").each(function() {
			this.parentNode.prependChild(this);
		});
		d3.selectAll("#plotArea").each(function() {
			this.parentNode.prependChild(this);
		});
		d3.selectAll("#ground").each(function() {
			this.parentNode.prependChild(this);
		});


		return this;
	};


	this.setXAxis = function Gneiss$setXAxis(first) {
		var g = this;

		if (first) {
			/*
			 *
			 * X-Axis Drawing Section
			 *
			 */
			g.xAxis().axis = d3.svg.axis()
				.scale(g.xAxis().scale)
				.orient(g.isBargrid() ? "left" : "bottom")
				.tickFormat(g.xAxis().formatter ? Gneiss.dateParsers[g.xAxis().formatter] : function(d) {
					return d;
				})
				.ticks(g.xAxis().ticks);

			if (g.xAxis().type == "date") {
				if (g.xAxis().ticks === null || !isNaN(g.xAxis().ticks)) {
					//auto suggest the propper tick gap
					var timeSpan = g.xAxis().scale.domain()[1] - g.xAxis().scale.domain()[0],
						months = timeSpan / 2592000000,
						years = timeSpan / 31536000000,
						days = timeSpan / 86400000;

					if (years > 30) {
						yearGap = 10;
					}
					if (years > 15) {
						yearGap = 5;
					} else {
						yearGap = 1;
					}

					if (days > 2) {
						hourGap = 6;
					} else if (days > 1) {
						hourGap = 4;
					} else {
						hourGap = 1;
					}

					switch (g.xAxis().formatter) {
						case "yy":
							g.xAxis().axis.ticks(d3.time.years, yearGap);
							break;

						case "yyyy":
							g.xAxis().axis.ticks(d3.time.years, yearGap);
							break;

						case "MM":
							g.xAxis().axis.ticks(d3.time.months, 1);
							break;

						case "M":
							g.xAxis().axis.ticks(d3.time.months, 1);
							break;

						case "YY":
							g.xAxis().axis.ticks(d3.time.years, 1);
							break;

						case "QJan":
							g.xAxis().axis.ticks(d3.time.months, 3);
							break;

						case "QJul":
							g.xAxis().axis.ticks(d3.time.months, 3);
							break;

						case "hmm":
							g.xAxis().axis.ticks(d3.time.hour, hourGap)
							break
					}
				} else if (g.xAxis().ticks instanceof Array) {
					//use the specified tick gap
					var gap,
						gapString = g.xAxis().ticks[1],
						num = parseInt(g.xAxis().ticks[0]);

					if ((/hour/i).text(gapString)) {
						gap = d3.time.hour
					}
					if ((/day/i).test(gapString)) {
						gap = d3.time.hour;
					} else if ((/week/i).test(gapString)) {
						gap = d3.time.day;
					} else if ((/month/i).test(gapString)) {
						gap = d3.time.months;
					} else if ((/year/i).test(gapString)) {
						gap = d3.time.years;
					}
					g.xAxis().axis.ticks(gap, num);
				} else {
					throw new Error("xAxis.ticks set to invalid date format");
				}
			}

			g.chartElement().append("g")
				.attr("class", 'axis')
				.attr("id", "xAxis")
				.attr("transform", g.isBargrid() ? "translate(" + g.padding().left + ",0)" : "translate(0," + (g.height() - g.padding().bottom + g.xAxisMargin()) + ")")
				.call(g.xAxis().axis);
		} else {
			//not first
			g.xAxis().axis.scale(g.xAxis().scale)
				.tickFormat(g.xAxis().formatter ? Gneiss.dateParsers[g.xAxis().formatter] : function(d) {
					return d;
				})
				.ticks(g.isBargrid() ? g.series()[0].data.length : g.xAxis().ticks)
				.orient(g.isBargrid() ? "left" : "bottom");


			if (g.xAxis().type == "date") {
				if (g.xAxis().ticks === null || !isNaN(g.xAxis().ticks)) {
					//auto suggest the propper tick gap
					var timeSpan = g.xAxis().scale.domain()[1] - g.xAxis().scale.domain()[0],
						months = timeSpan / 2592000000,
						years = timeSpan / 31536000000,
						days = timeSpan / 86400000,
						hours = timeSpan / 3600000,
						minutes = timeSpan / 60000;

					if (years > 30) {
						yearGap = 10;
					}
					if (years > 15) {
						yearGap = 5;
					} else {
						yearGap = 1;
					}


					if (days > 2) {
						hourGap = 6;
					} else if (days >= 1) {
						hourGap = 4;
					} else if (hours > 7) {
						hourGap = 4;
					} else if (hours > 1) {
						hourGap = 1;
					}


					switch (g.xAxis().formatter) {
						case "yy":
							g.xAxis().axis.ticks(d3.time.years, yearGap);
							break;

						case "yyyy":
							g.xAxis().axis.ticks(d3.time.years, yearGap);
							break;

						case "MM":
							g.xAxis().axis.ticks(d3.time.months, 1);
							break;

						case "M":
							g.xAxis().axis.ticks(d3.time.months, 1);
							break;

						case "YY":
							g.xAxis().axis.ticks(d3.time.years, 1);
							break;

						case "QJan":
							g.xAxis().axis.ticks(d3.time.months, 3);
							break;

						case "QJul":
							g.xAxis().axis.ticks(d3.time.months, 3);
							break;

						case "hmm":
							g.xAxis().axis.ticks(d3.time.hours, hourGap);
							break
					}
				} else if (g.xAxis().ticks instanceof Array) {
					var gap;
					var gapString = g.xAxis().ticks[1];
					var num = parseInt(g.xAxis().ticks[0], 10);

					if ((/hour/i).test(gapString)) {
						gap = d3.time.hours;
					} else if ((/day/i).test(gapString)) {
						gap = d3.time.days;
					} else if ((/week/i).test(gapString)) {
						gap = d3.time.weeks;
					} else if ((/month/i).test(gapString)) {
						gap = d3.time.months;
					} else if ((/year/i).test(gapString)) {
						gap = d3.time.years;
					}
					g.xAxis().axis.ticks(gap, num);
				} else {
					throw new Error("xAxis.ticks set to invalid date format");
				}
			}

			g.chartElement().selectAll("#xAxis").attr("transform", function() {
				if (g.isBargrid()) {
					return "translate(" + (g.padding().left + g.margin().left) + ",0)"
				} else {
					return "translate(0," + (g.height() - g.padding().bottom + g.xAxisMargin()) + ")"
				}
			})
				.call(g.xAxis().axis);
		}

		var axisGroup = g.chartElement().selectAll("#xAxis");

		g.customXAxisFormatter().call(g, axisGroup)



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

		if (numColumnSeries === 0) {
			return this;
		}

		var numDataPoints = 0;

		// Calculate the number of data points based on x-axis extents
		if (x.type == "date") {
			var dateExtent = d3.extent(data);

			// Calculate smallest gap between two dates (in ms)
			var shortestPeriod = Infinity;
			for (var i = data.length - 2; i >= 0; i--) {
				shortestPeriod = Math.min(shortestPeriod, Math.abs(data[i] - data[i + 1]));
			}

			numDataPoints = Math.abs(Math.floor((dateExtent[0] - dateExtent[1]) / shortestPeriod));
		} else {
			var series = g.series();
			for (var i = series.length - 1; i >= 0; i--) {
				numDataPoints = Math.max(numDataPoints, series[i].data.length);
			};
		}

		// Determine the proper column width
		var effectiveChartWidth = g.width() - g.padding().right - g.padding().left - g.margin().left - g.margin().right - g.axisBarGap();

		var columnWidth = Math.floor(((effectiveChartWidth / numDataPoints) / numColumnSeries) - g.columnGroupGap());
		columnWidth = columnWidth - g.columnGap()
		// Make sure the columns are at least a pixel wide
		columnWidth = Math.max(columnWidth, 1);

		// Make sure columns are not wider than the specified portion of the available width
		columnWidth = Math.min(columnWidth, effectiveChartWidth * g.maxColumnWidth() / 100);

		var columnGroupWidth = (columnWidth * numColumnSeries) + (g.columnGap() * (numColumnSeries - 1));

		//calculate the space between groups
		var defaultGroupGap = (effectiveChartWidth - (columnGroupWidth * numDataPoints)) / numColumnSeries

		//if the groups of bars are closer together than the bars of the same group or the column group gap set make the bars skinnier
		if (defaultGroupGap < g.columnGroupGap()) {
			columnWidth = Math.round(columnWidth - (((g.columnGroupGap() / 2) - defaultGroupGap) / numColumnSeries))
		}

		g.columnWidth(columnWidth);
		g.columnGroupWidth((columnWidth + g.columnGap()) * numColumnSeries);
		g.columnGroupShift(columnWidth + g.columnGap());

		return this;
	};

	this.drawSeriesAndLegend = function Gneiss$drawSeriesAndLegend(first) {
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

		var lineGroups;

		if (first) {

			//create a group to contain series

			lineGroups = g.seriesContainer().selectAll('.seriesLineGroup')
			lineSeries = g.seriesContainer().selectAll("path");
			columnSeries = g.seriesContainer().selectAll("g.seriesColumn");
			var columnGroups;
			var columnRects;
			var scatterSeries = g.seriesContainer().selectAll("g.seriesScatter");


			//add columns to chart
			columnGroups = columnSeries.data(sbt.column)
				.enter()
				.append("g")
				.attr("class", "seriesColumn seriesGroup")

			columnGroups.selectAll("rect")
				.data(function(d, i) {
					return d.data
				})
				.enter()
				.append("rect")


			//add scatter to chart
			scatterGroups = scatterSeries.data(sbt.scatter)
				.enter()
				.append("g")
				.attr("class", "seriesScatter seriesGroup")

			scatterDots = scatterGroups
				.selectAll("circle")
				.data(function(d) {
					return d.data
				})
			scatterDots.enter()
				.append("circle")

		}

		//update items

		lineSeries = g.seriesContainer().selectAll("path");
		lineGroups = g.seriesContainer().selectAll('.seriesLineGroup')
		columnSeries = g.seriesContainer().selectAll("g.seriesColumn")
		scatterSeries = g.seriesContainer().selectAll("g.seriesScatter")
		lineSeriesDotGroups = g.seriesContainer().selectAll("g.lineSeriesDots")
		var columnGroups
		var columnRects

		if (g.isBargrid()) {
			//add bars to chart
			columnGroups = g.seriesContainer().selectAll("g.seriesColumn")
				.data(sbt.bargrid)
				.attr("fill", function(d, i) {
					return d.color ? d.color : colors[i + sbt.line.length]
				})

			var seriesColumns = columnGroups.enter()
				.append("g")
				.attr("class", "seriesColumn")
				.attr("fill", function(d, i) {
					return d.color ? d.color : colors[i + g.series().length]
				})
				.attr("transform", function(d, i) {
					return "translate(0," + g.padding().top + ")"
				});

			var bargridLabel = columnGroups.selectAll("text.bargridLabel")
				.data(function(d, i) {
					return [d]
				})
				.text(function(d, i) {
					return d.name
				})
				.attr("dy", "1em")

			bargridLabel.enter()
				.append("text")
				.text(function(d, i) {
					return d.name
				})
				.attr("class", "bargridLabel")

			bargridLabel.transition()
				.attr("x", g.yAxis()[0].scale(0))
				.attr("y", function(d) {
					var y = g.margin().top

					//if there is a title bumb the series labels down
					y += g.titleElement().text().length > 0 ? g.titleElement()[0][0].getBoundingClientRect().height + g.titleBottomMargin() : 0;

					return y
				})
				.text(function(d, i) {
					return d.name
				}) //update the text in case it changed without new data

			bargridLabel.exit().remove()

			columnSeries.transition()
				.duration(500)
				.attr("transform", function(d, i) {
					return "translate(" + (i * (g.width() - g.padding().left - g.margin().left - g.padding().right - g.margin().right) / g.series().length + g.padding().left + g.margin().left + (i*g.padding().right/g.seriesByType().bargrid.length)) + ",0)"
				})

			columnGroups.exit().remove()

			columnRects = columnGroups.selectAll(".columnRect")
				.data(function(d, i) {
					return d.data
				})

			columnRects.exit().remove();

			columnRects
				.enter()
				.append("rect")
				.attr('class', 'columnRect')
				.attr("height", g.bargridBarThickness())
				.attr("width", function(d, i) {
					yAxisIndex = d3.select(this.parentNode).data()[0].axis;
					return Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(0))
				})
				.attr("x", function(d, i) {
					yAxisIndex = d3.select(this.parentNode).data()[0].axis;
					return g.yAxis()[yAxisIndex].scale(0) - (d < 0 ? Math.abs(g.yAxis()[yAxisIndex].scale(d)) : 0)
				})
				.attr("y", function(d, i) {
					return g.xAxis().scale(g.xAxisRef()[0].data[i]) - g.bargridBarThickness() / 2
				})

			columnRects.transition()
				.duration(500)
				.attr("height", g.bargridBarThickness())
				.attr("width", function(d, i) {
					yAxisIndex = d3.select(this.parentNode).data()[0].axis;
					return Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(0))
				})
				.attr("x", function(d, i) {
					yAxisIndex = d3.select(this.parentNode).data()[0].axis;
					return g.yAxis()[yAxisIndex].scale(0) - (d < 0 ? Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(0)) : 0)
				})
				.attr("y", function(d, i) {
					return g.xAxis().scale(g.xAxisRef()[0].data[i]) - g.bargridBarThickness() / 2
				})

			//add label to each bar
			//this is a group that will contain text and a concealer rect
			var barLabels = columnGroups.selectAll("g.barLabelGroup")
				.data(function(d, i) {
					return d.data
				});

			var barLabelsEnter = barLabels.enter().append("g")
				.attr("class", "barLabelGroup")

			barLabels.exit().remove()

			barLabels.selectAll(".concealer").remove()
			//if it's the top label add the prefix and suffix
			barLabelsEnter.append('text')
				.attr('class', 'barLabel')

			barLabels.append('rect')
				.attr('class', 'concealer')

			//update the text in each label
			barLabels.select("text")
				.text(function(d, i) {
					var yAxisIndex = d3.select(this.parentNode.parentNode).data()[0].axis;
					var output = g.numberFormat(d);
					if ((i == 0 && g.yAxis()[yAxisIndex].prefix.use == "top") || g.yAxis()[yAxisIndex].prefix.use == "all") {
						output = g.yAxis()[yAxisIndex].prefix.value + output;
					} else if (g.yAxis()[yAxisIndex].prefix.use == "positive" && d > 0) {
						output = g.yAxis()[yAxisIndex].prefix.value + output;
					} else if (g.yAxis()[yAxisIndex].prefix.use == "top" && i == 0) {
						output = g.yAxis()[yAxisIndex].prefix.value + output;
					}

					if ((i == 0 && g.yAxis()[yAxisIndex].suffix.use == "top") || g.yAxis()[yAxisIndex].suffix.use == "all") {
						output += g.yAxis()[yAxisIndex].suffix.value;
					} else if (g.yAxis()[yAxisIndex].suffix.use == "positive" && d > 0) {
						output += g.yAxis()[yAxisIndex].suffix.value;
					} else if (g.yAxis()[yAxisIndex].suffix.use == "top" && i == 0) {
						output += g.yAxis()[yAxisIndex].suffix.value;
					}
					return output;
				}).each(function() {
					this.parentNode.prependChild(this);
				});

			// update dimensions of the concealer rects
			barLabels.selectAll(".concealer").each(function() {
				var parentG = d3.select(this.parentNode)
				var text_bounds = parentG.select('text').node().getBoundingClientRect()
				this.setAttribute('width', text_bounds.width + (g.bargridLabelMargin() * 2));
				this.setAttribute('height', text_bounds.height);
				this.setAttribute('x', -g.bargridLabelMargin());
				this.setAttribute('y', -text_bounds.height + 5);
				this.parentNode.prependChild(this);
			});

			//reset the padding to the default before mucking with it in the label postitioning
			barLabels
				.attr("transform", function(d, i) {
					var transX, transY;
					var yAxisIndex = d3.select(this.parentNode).data()[0].axis;
					var x = g.bargridLabelMargin() + g.yAxis()[yAxisIndex].scale(0) - (d < 0 ? Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(0)) : 0) + Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(0));

					transX = x;
					transY = g.xAxis().scale(g.xAxisRef()[0].data[i]) + d3.select(this)[0][0].getBoundingClientRect().height / 4;
					return 'translate(' + [transX, transY] + ')'
				})


			//remove non bargrid stuff
			scatterSeries.remove()
			columnRects.exit().remove()
			lineSeriesDotGroups.remove()
			lineGroups.remove()
		} else {
			//Not a bargrid

			//add columns to chart
			columnGroups = g.seriesContainer().selectAll("g.seriesColumn")
				.data(sbt.column)
				.attr("fill", function(d, i) {
					return d.color ? d.color : colors[i + sbt.line.length]
				})

			//remove bar labels
			columnGroups.selectAll("text.barLabel").remove()

			//remove bargrid labels
			columnGroups.selectAll("text.bargridLabel").remove()

			columnGroups.enter()
				.append("g")
				.attr("class", "seriesColumn")
				.attr("fill", function(d, i) {
					return d.color ? d.color : colors[i + sbt.line.length]
				})
				.attr("transform", function(d, i) {
					return "translate(" + (i * columnGroupShift - (columnGroupShift * (sbt.column.length - 1) / 2)) + ",0)"
				})

			columnSeries.transition()
				.duration(500)
				.attr("transform", function(d, i) {
					return "translate(" + (i * columnGroupShift - (columnGroupShift * (sbt.column.length - 1) / 2)) + ",0)"
				})

			columnGroups.exit().remove()

			columnRects = columnGroups.selectAll("rect")
				.data(function(d, i) {
					return d.data
				})

			columnRects.enter()
				.append("rect")

			columnRects.transition()
				.duration(500)
				.attr("width", columnWidth)
				.attr("height", function(d, i) {
					yAxisIndex = d3.select(this.parentNode).data()[0].axis;
					return Math.abs(g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d, g.yAxis()[yAxisIndex].scale.domain())))
				})
				.attr("x", g.xAxis().type == "date" ?
					function(d, i) {
						return g.xAxis().scale(g.xAxisRef()[0].data[i]) - columnWidth / 2
					} :
					function(d, i) {
						return g.xAxis().scale(i) - columnWidth / 2
					}
			)
				.attr("y", function(d, i) {
					yAxisIndex = d3.select(this.parentNode).data()[0].axis;
					return (g.yAxis()[yAxisIndex].scale(d) - g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d, g.yAxis()[yAxisIndex].scale.domain()))) >= 0 ? g.yAxis()[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d, g.yAxis()[yAxisIndex].scale.domain())) : g.yAxis()[yAxisIndex].scale(d)
				})

			columnRects.exit().remove()

			// Add line series
			var lineGroups = g.seriesContainer().selectAll('.seriesLineGroup')
				.data(sbt.line)

			var lineGroupsEnter = lineGroups.enter().append('g')
				.attr('class', 'seriesLineGroup')

			lineGroups.transition().duration(500)
				.attr("stroke", function(d, i) {
					return d.color || colors[i]
				})
				.attr("fill", function(d, i) {
					return d.color || colors[i]
				})

			var lineSeries = lineGroups.append('path')
				.attr("class", "seriesLinePath")

			lineGroups.select('path').transition().duration(500)
				.attr("d", function(d, j) {
					yAxisIndex = d.axis;
					pathString = g.yAxis()[d.axis].line(d.data);
					return pathString;
				})

			// Check whether we've met the conditions to add dots
			if (Gneiss.helper.willRenderLineDots(sbt.line, g.lineDotsThresholdSingle(), g.lineDotsThresholdTotal())) {
				// We've met the conditions to add dots, so add them
				var seriesDots = lineGroups.selectAll('circle')
					.data(function(d) {
						return d.data;
					})

				seriesDots.enter().append('circle')
					.attr('class', 'seriesLineDot')
					.attr("r", g.lineDotRadius())

				seriesDots.transition().duration(500)
					.attr('cx', function(d, i) {
						return g.xAxis().scale(g.xAxisRef()[0].data[i]);
					})
					.attr('cy', function(d) {
						yAxisIndex = d3.select(this.parentNode).datum().axis;
						return (y = d || d === 0) ? g.yAxis()[yAxisIndex].scale(d) : -100;
					})
					.attr('stroke', function(d, i) {
						var parentData = d3.select(this.parentNode).datum();
						return parentData.color || colors[i]
					})

				// Remove old dot data
				seriesDots.exit().remove()
			} else {
				lineGroups.selectAll('circle').remove()
			}

			// Remove old line data
			lineGroups.exit().remove()

			//add scatter
			scatterGroups = g.seriesContainer().selectAll("g.seriesScatter")
				.data(sbt.scatter)

			scatterGroups.enter()
				.append("g")
				.attr("class", "seriesScatter")

			scatterGroups.transition()
				.attr("fill", function(d, i) {
					return d.color ? d.color : colors[i + sbt.line.length + sbt.column.length]
				})
				.attr("stroke", function(d, i) {
					return d.color ? d.color : colors[i + sbt.line.length + sbt.column.length]
				})

			scatterGroups.exit().remove()

			scatterDots = scatterGroups
				.selectAll("circle")
				.data(function(d) {
					return d.data
				})

			scatterDots.enter()
				.append("circle")
				.attr("r", g.scatterDotRadius())
				.attr("transform", function(d, i) {
					yAxisIndex = d3.select(this.parentNode).data()[0].axis;
					return "translate(" + g.xAxis().scale(g.xAxisRef()[0].data[i]) + "," + g.yAxis()[yAxisIndex].scale(d) + ")"
				})

			scatterDots.transition()
				.duration(500)
				.attr("transform", function(d, i) {
					yAxisIndex = d3.select(this.parentNode).data()[0].axis;
					return "translate(" + g.xAxis().scale(g.xAxisRef()[0].data[i]) + "," + g.yAxis()[yAxisIndex].scale(d) + ")"
				})
		}

		//arrange elements in proper order

		//bring bars to front
		if (sbt.column.length > 0) {
			columnGroups.each(function() {
				if (this.parentNode) {
					this.parentNode.appendChild(this);
				}
			})
			columnSeries.each(function() {
				if (this.parentNode) {
					this.parentNode.appendChild(this);
				}
			})
		}

		//bring scatter to front
		if (sbt.scatter.length > 0) {
			scatterGroups.each(function() {
				this.parentNode.appendChild(this);
			})
			scatterDots.each(function() {
				this.parentNode.appendChild(this);
			})
		}

		//bring lines to front
		if (sbt.line.length > 0) {
			lineGroups.each(function() {
				if (this.parentNode) {
					this.parentNode.appendChild(this);
				}
			})
		}


		return this;
	};

	this.drawLegend = function Gneiss$drawLegend() {
		var g = this;
		var legendItemY;

		var colors = g.colors();

		//remove current legends
		g.legendItemContainer().selectAll("g.legendItem").remove()

		if (!g.isBargrid()) {
			//add legend to chart
			var legendGroups = g.legendItemContainer().selectAll("g")
				.data(g.series());

			var titleElement_rect = g.titleElement()[0][0].getBoundingClientRect();
			var legendItems_y = g.margin().top + titleElement_rect.height + (titleElement_rect.height != 0 ? g.titleBottomMargin() : 0)

			var legItems = legendGroups.enter()
				.append("g")
				.attr("class", "legendItem")
				.attr("transform", "translate(" + (g.titlePlacement() == "aligned" ? g.padding().left : g.margin().left) + "," + legendItems_y + ")");

			legendGroups.exit().remove()

			var legLabels = legItems.append("text")
				.filter(function() {
					return g.series().length > 1
				})
				.attr("class", "legendLabel")
				.attr("x", 13)
				.attr('dy', "1em")
				.attr("fill", function(d, i) {
					return d.color ? d.color : colors[i]
				})
				.text(function(d, i) {
					return d.name
				});

			//if there is more than one line
			if (g.series().length > 1) {
				legItems.append("rect")
					.attr("width", 10)
					.attr("height", 10)
					.attr("x", 0)
					.attr("y", "0.3em")
					.attr("fill", function(d, i) {
						return d.color ? d.color : colors[i]
					})
					.attr("rx", 1)
					.attr("ry", 1)

				legendGroups.filter(function(d) {
					return d != g.series()[0]
				})
					.attr("transform", function(d, i) {
						//label isn't for the first series
						var prev = d3.select(legendGroups[0][i]);
						var prevWidth = parseFloat(prev.node().getBoundingClientRect().width);
						var prevCoords = Gneiss.helper.transformCoordOf(prev);

						var cur = d3.select(this);
						var curBoundingRect = cur.node().getBoundingClientRect();
						var curWidth = parseFloat(curBoundingRect.width);
						var curCoords = Gneiss.helper.transformCoordOf(cur);
						var curHeight = parseFloat(curBoundingRect.height)

						legendItemY = prevCoords.y;
						var x = prevCoords.x + prevWidth + g.legendLabelSpacingX();
						if (x + curWidth > g.width()) {
							x = g.titlePlacement() == "aligned" ? g.padding().left : g.margin().left;
							legendItemY += curHeight + g.legendLabelSpacingY();
						}
						return "translate(" + x + "," + legendItemY + ")";
					})
			} else {
				//not bargrid
			}
		}

		return this;
	};

	this.updateMetaAndTitle = function Gneiss$updateMetaAndTitle() {
		/*
			Position the source and title elements appropriately
		*/

		var g = this;

		var creditBBox;

		//the default values for the source element
		var sourceElementX = g.width() - g.defaultPadding().right;;
		var sourceElementDY = 0;
		var sourceElementTA = "end"

		//the default values for the credit element
		var creditElementX = g.titlePlacement() == "aligned" ? g.padding().left : g.margin().left;

		//place the footer elements in the right place

		//test if the text elements are overlapping
		creditBBox = g.creditElement()[0][0].getBoundingClientRect()

		var isOverlapping = sourceElementX - g.sourceElement()[0][0].getBoundingClientRect().width < creditBBox.width + creditBBox.left + 15

		if (isOverlapping) {
			//if they're overlapping stack the elements and align left
			sourceElementDY = "1.4em";
			sourceElementX = g.titlePlacement() == "aligned" ? g.padding().left : g.margin().left;
			sourceElementTA = "start"
		}

		//update the source element with the propper values
		g.sourceElement()
			.attr("x", sourceElementX)
			.attr("dy", sourceElementDY)
			.attr("text-anchor", sourceElementTA)
			.text(g.source())
			.call(Gneiss.helper.wrap, g.width() - g.defaultPadding().left - g.defaultPadding().right);

		g.creditElement().text(g.credit())
			.attr("x", creditElementX);

		g.footerElement().attr("transform", "translate(0," + (g.height() - g.margin().bottom - (g.footerElement()[0][0].getBoundingClientRect().height - g.creditElement()[0][0].getBoundingClientRect().height)) + ")");


		return this;
	};

	this.updateGraphPropertiesBasedOnSeriesType = function Gneiss$updateGraphPropertiesBasedOnSeriesType() {
		var g = this,
			seriesByType = g.seriesByType();
		/*
		  Update graph properties based on the type of data series displayed
		*/
		g.hasColumns(seriesByType.column.length > 0);
		g.isBargrid(seriesByType.bargrid.length > 0);
		g.hasLines(seriesByType.line.length > 0);
		g.hasScatter(seriesByType.scatter.length > 0);
	};

	this.updateGroundRects = function Gneiss$updateGroundRects() {
		var g = this;
		// Insert a background rectangle to prevent transparency
		d3.select("rect#ground")
			.attr("width", g.width())
			.attr("height", g.height());

		//insert a background rectagle to style the plot area
		d3.select("rect#plotArea")
			.attr("transform", "translate(" + (g.padding().left + g.margin().left) + "," + (g.padding().top + g.margin().top) + ")")
			.attr("width", g.width() - g.padding().left - g.padding().right - g.margin().left - g.margin().right)
			.attr("height", g.height() - g.padding().top - g.padding().bottom - g.margin().top - g.margin().bottom);

		return g;
	}

	this.redraw = function Gneiss$redraw() {

		var g = this;
		/*
			Redraw the chart
		*/

		if (g.redrawCount() > 5) {
			throw new Error("Exceeded recursive redraw limit")
			return;
		}

		g.redrawCount(g.redrawCount() + 1);

		var wasBargrid = g.isBargrid();

		//group the series by their type
		g.updateGraphPropertiesBasedOnSeriesType.call(g);

		if (!wasBargrid && g.isBargrid()) {
			g.resize();
		}

		g.calculateColumnWidths()

		g.drawSeriesAndLegend()
			.setPadding()
			.setYScales()
			.setXScales()
			.setYAxes()
			.setXAxis()
			.drawSeriesAndLegend(false,true)
			.updateGroundRects()
			.updateMetaAndTitle();

		g.redrawCount(0)

		return g;
	};

	// Call build() when someone attempts to construct a new Gneiss object
	return this.build(config);
}