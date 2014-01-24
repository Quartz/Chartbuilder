describe("Gneiss", function() {

  var containerId;
  var gneiss;
  
  beforeEach(function() {
	  containerId = Gneiss.defaultGneissChartConfig.container.slice(1);
    $('<div id="' + containerId + '" style="display:none"></div>').appendTo('body');
    
    gneiss = new Gneiss(Gneiss.defaultGneissChartConfig);
  });
  
  afterEach(function() {
    $("#" + containerId).remove();
		gneiss = null;
  });

  it("contains a default chart config", function() {
    expect(Gneiss.defaultGneissChartConfig).not.toEqual(undefined);
  });
  
  it("contains a set of date parsers", function() {
    expect(Gneiss.dateParsers).not.toEqual(undefined);
  });
    
  it("contains a set of helper functions", function() {
    expect(Gneiss.helper).not.toEqual(undefined);
  });
  
  describe("#dateParsers", function() {
    it("contains various date parsers", function() {
      expect(Gneiss.dateParsers["mmddyyyy"]).not.toEqual(undefined);
      expect(Gneiss.dateParsers["ddmmyyyy"]).not.toEqual(undefined);
      expect(Gneiss.dateParsers["mmdd"]).not.toEqual(undefined);
      expect(Gneiss.dateParsers["Mdd"]).not.toEqual(undefined);
      expect(Gneiss.dateParsers["ddM"]).not.toEqual(undefined);
      expect(Gneiss.dateParsers["mmyy"]).not.toEqual(undefined);
      expect(Gneiss.dateParsers["yy"]).not.toEqual(undefined);
      expect(Gneiss.dateParsers["yyyy"]).not.toEqual(undefined);
      expect(Gneiss.dateParsers["MM"]).not.toEqual(undefined);
      expect(Gneiss.dateParsers["M"]).not.toEqual(undefined);
      expect(Gneiss.dateParsers["hmm"]).not.toEqual(undefined);
    });
    
    it("correctly parses Date objects into 'mmddyyyy' format", function() {
      var parser = Gneiss.dateParsers["mmddyyyy"];
      expect(parser(new Date(2013, 0, 1))).toEqual("1/1/2013");
      expect(parser(new Date(2013, 4, 15))).toEqual("5/15/2013");
      expect(parser(new Date(2013, 7, 31))).toEqual("8/31/2013");
    });
    
    it("correctly parses Date objects into 'ddmmyyyy' format", function() {
      var parser = Gneiss.dateParsers["ddmmyyyy"];
      expect(parser(new Date(2013, 0, 1))).toEqual("1/1/2013");
      expect(parser(new Date(2013, 4, 15))).toEqual("15/5/2013");
      expect(parser(new Date(2013, 7, 31))).toEqual("31/8/2013");
    });
    
    it("correctly parses Date objects into 'mmdd' format", function() {
      var parser = Gneiss.dateParsers["mmdd"];
      expect(parser(new Date(2013, 0, 1))).toEqual("1/1");
      expect(parser(new Date(2013, 4, 15))).toEqual("5/15");
      expect(parser(new Date(2013, 7, 31))).toEqual("8/31");
    });
    
    it("correctly parses Date objects into 'Mdd' format", function() {
      var parser = Gneiss.dateParsers["Mdd"];
      expect(parser(new Date(2013, 0, 1))).toEqual("Jan. 1");
      
      // May should not be abbreviated
      expect(parser(new Date(2013, 4, 15))).toEqual("May 15");
      
      expect(parser(new Date(2013, 7, 17))).toEqual("Aug. 17");
    });
    
    it("correctly parses Date objects into 'ddM' format", function() {
      var parser = Gneiss.dateParsers["ddM"];
      expect(parser(new Date(2013, 0, 1))).toEqual("1 Jan.");
      
      // May should not be abbreviated
      expect(parser(new Date(2013, 4, 15))).toEqual("15 May");
      
      expect(parser(new Date(2013, 7, 31))).toEqual("31 Aug.");
    });
    
    it("correctly parses Date objects into 'mmyy' format", function() {
      var parser = Gneiss.dateParsers["mmyy"];
      expect(parser(new Date(2013, 0, 1))).toEqual("1/13");
      expect(parser(new Date(2013, 4, 15))).toEqual("5/13");
      expect(parser(new Date(2013, 7, 31))).toEqual("8/13");
    });
    
    it("correctly parses Date objects into 'yy' format", function() {
      var parser = Gneiss.dateParsers["yy"];
      expect(parser(new Date(2013, 0, 1))).toEqual("’13");
      expect(parser(new Date(2013, 4, 15))).toEqual("’13");
      expect(parser(new Date(2013, 7, 31))).toEqual("’13");
    });
    
    it("correctly parses Date objects into 'yyyy' format", function() {
      var parser = Gneiss.dateParsers["yyyy"];
      expect(parser(new Date(2013, 0, 1))).toEqual("2013");
      expect(parser(new Date(2013, 4, 15))).toEqual("2013");
      expect(parser(new Date(2013, 7, 31))).toEqual("2013");
    });
    
    it("correctly parses Date objects into 'MM' format", function() {
      var parser = Gneiss.dateParsers["MM"];
      
      // January should be displayed as the year
      expect(parser(new Date(2013, 0, 1))).toEqual("2013");
      
      // May should not be abbreviated
      expect(parser(new Date(2013, 4, 15))).toEqual("May");
      
      expect(parser(new Date(2013, 7, 31))).toEqual("August");
      
    });
    
    it("correctly parses Date objects into 'M' format", function() {
      var parser = Gneiss.dateParsers["M"];
      
      // January should be displayed as the year
      expect(parser(new Date(2013, 0, 1))).toEqual("’13");
      
      // May should not be abbreviated
      expect(parser(new Date(2013, 4, 15))).toEqual("May");
      
      expect(parser(new Date(2013, 7, 31))).toEqual("Aug.");
    });
    
    it("correctly parses Date objects into 'hmm' format", function() {
      var parser = Gneiss.dateParsers["hmm"];
      Date.setLocale('en');
      
      expect(parser(new Date(2013, 0, 1))).toEqual("12:00");
      expect(parser(new Date(2013, 7, 31, 1, 50, 30))).toEqual("1:50");
      expect(parser(new Date(2013, 7, 17, 11, 30))).toEqual("11:30");
      expect(parser(new Date(2013, 7, 17, 18, 45))).toEqual("6:45");
      
      Date.setLocale('en-GB');
      
      expect(parser(new Date(2013, 0, 1))).toEqual("0:00");
      expect(parser(new Date(2013, 7, 31, 1, 50, 30))).toEqual("1:50");
      expect(parser(new Date(2013, 7, 17, 11, 30))).toEqual("11:30");      
      expect(parser(new Date(2013, 7, 17, 18, 45))).toEqual("18:45");
      
      Date.setLocale('ko-KR');
      
      expect(parser(new Date(2013, 0, 1))).toEqual("0:00");
      expect(parser(new Date(2013, 7, 31, 1, 50, 30))).toEqual("1:50");
      expect(parser(new Date(2013, 7, 17, 11, 30))).toEqual("11:30");      
      expect(parser(new Date(2013, 7, 17, 18, 45))).toEqual("18:45");      
    });
  });
	
  describe("splitSeriesByType()", function() {
    it("returns an hash of display type to array of series data", function() {
      var lineSeries = {type: "line", data: [1,2,3]};
      var columnSeries = {type: "column", testProperty: "asdf"};
      
      var series = [ {type: "column"}, {type: "bargrid"}, lineSeries,
                     {type: "scatter"}, columnSeries, {type: "line"} ];
      
      var expected = { scatter: [{type: "scatter"}],
                       line: [lineSeries, {type: "line"}], 
                       bargrid: [{type: "bargrid"}],
                       column: [{type: "column"}, columnSeries] };
                       
      var actual = gneiss.splitSeriesByType(series);
      
      // Individual series must be in the correct order on a per-type basis
      expect(actual["line"]).toEqual([lineSeries, {type: "line"}]);
      expect(actual["column"]).toEqual([{type: "column"}, columnSeries]);
      expect(actual["bargrid"]).toEqual([{type: "bargrid"}]);
      expect(actual["scatter"]).toEqual([{type: "scatter"}]);
      
      expect(actual).toEqual(expected);
    });
  });
  
  describe("updateGraphPropertiesBasedOnSeriesType()", function() {
    it("sets the 'hasColumns' property on the x-axis of a graph to true if a series of column data exists", function() {
      var seriesByType = { bargrid: ["bargrid"], column: ["column"] };
      gneiss.updateGraphPropertiesBasedOnSeriesType(gneiss, seriesByType);
      
      expect(gneiss.xAxis().hasColumns).toEqual(true);
    });
    
    it("sets the 'hasColumns' property on the x-axis of a graph to false if a series of column data exists", function() {
      var graph = { xAxis: {} };
      
      var seriesByType = { bargrid: [], column: [] };
      gneiss.updateGraphPropertiesBasedOnSeriesType(gneiss, seriesByType);
      
      expect(gneiss.xAxis().hasColumns).toEqual(false);
    });
    
    it("sets the 'isBargrid' property on a graph to true if a series of bar data exists", function() {
      var graph = { xAxis: {} };
      
      var seriesByType = { bargrid: ["bargrid"], column: ["column"] };
      gneiss.updateGraphPropertiesBasedOnSeriesType(gneiss, seriesByType);
      
      expect(gneiss.isBargrid()).toEqual(true);
    });
    
    it("sets the 'isBargrid' property on a graph to false if a series of bar data does not exists", function() {
      var graph = { xAxis: {} };      
      
      var seriesByType = { bargrid: [], column: [] };
      gneiss.updateGraphPropertiesBasedOnSeriesType(gneiss, seriesByType);
      
      expect(gneiss.isBargrid()).toEqual(false);
    });
  });
  
  describe("#helper", function() {
    it("contains a function multiextent()", function() {      
      expect(Gneiss.helper.multiextent).not.toEqual(undefined);
    });
    
    describe("multiextent()", function() {
      it("returns the minimum and maximum values of arrays of one or more arrays", function() {
        var singleData = [[1, 2, 3, 4]];
        var multipleData = [[1, 2, 3, 4], [1, 2, 3, 4]];
        var multipleData2 = [[1, 3, 5, 7, 9], [-1, -3, -5, -7, -9]];
        expect(Gneiss.helper.multiextent(singleData)).toEqual([1, 4]);
        expect(Gneiss.helper.multiextent(multipleData)).toEqual([1, 4]);
        expect(Gneiss.helper.multiextent(multipleData2)).toEqual([-9, 9]);
      });
      
      it("returns the minimum and maximum values of arrays of one or more arrays using a specified mapping function", function() {
        var singleData = [[1, 2, 3, 4]];
        var multipleData = [[1, 2, 3, 4], [1, 2, 3, 4]];
        var multipleData2 = [[1, 3, 5, 7, 9], [-1, -3, -5, -7, -9]];
				
        var timesTwo = function(array) {
          for(var i = 0; i < array.length; i++) {
            array[i] *= 2;
          }
          return array;
        };        
        var square = function(array) {
          for(var i = 0; i < array.length; i++) {
            array[i] *= array[i];
          }
          return array;
        };        
        var negate = function(array) {
          for(var i = 0; i < array.length; i++) {
            array[i] *= -1;
          }
          return array;
        };
        
        expect(Gneiss.helper.multiextent(singleData, timesTwo)).toEqual([2, 8]);
        expect(Gneiss.helper.multiextent(multipleData, square)).toEqual([1, 16]);
        expect(Gneiss.helper.multiextent(multipleData2, negate)).toEqual([-9, 9]);
      });
    });
  });
  
  describe("setYScales()", function() {  
    it("sets the axis number for all series in a default chart", function() {
      var series = gneiss.series();
            
      gneiss.setYScales();
      
      expect(series[0].axis).toEqual(0);
      expect(series[1].axis).toEqual(0);
    });
    
    it("sets the axis number for all series for which it is currently undefined", function() {
      var series = gneiss.series();
      series[0].axis = undefined;
      series[1].axis = undefined;
            
      gneiss.setYScales();
      
      expect(series[0].axis).toEqual(0);
      expect(series[1].axis).toEqual(0);
    });
    
    it("ignores the axis number for all series for which it is currently set", function() {
      var series = gneiss.series();
      series[0].axis = 1;
      series[1].axis = 190;
            
      gneiss.setYScales();
      
      expect(series[0].axis).toEqual(1);
      expect(series[1].axis).toEqual(190);
    });
    
    it("sets the domain value for all y-axii in a default chart", function() {
      var y = gneiss.yAxis();
      y[0].domain = [null, null];
      
      gneiss.setYScales();
      
      expect(y[0].domain).toEqual([3.8, 23]);
    });
    
    it("sets the domain value for all y-axii in a bar chart", function() {
      var y = gneiss.yAxis();
      y[0].domain = [null, null];
      
      gneiss.isBargrid(true);
      gneiss.seriesByType({ bargrid: ["bar"] });
      
      gneiss.setYScales();
      
      expect(y[0].domain).toEqual([0, 23]);
    });
    
    it("creates scales for all y-axii in a default chart", function() {
      var y = gneiss.yAxis();
      y[0].scale = null;
      
      gneiss.setYScales();
      
      expect(y[0].scale).not.toEqual(null);
      expect(y[0].scale).not.toEqual(undefined);
    });
    
    it("creates scales for all y-axii in a bar chart", function() {
      var y = gneiss.yAxis();
      y[0].scale = null;
      
      gneiss.isBargrid(true);
      gneiss.seriesByType({ bargrid: ["bar"] });
      
      gneiss.setYScales();
      
      expect(y[0].scale).not.toEqual(null);
      expect(y[0].scale).not.toEqual(undefined);
    });
    
    it("sets domains for all y-axii scales in a default chart", function() {
      var y = gneiss.yAxis();
      y[0].scale = null;
      
      gneiss.setYScales();
           
      expect(y[0].scale.domain()).toEqual([3, 23]);
    });
    
    it("sets domains for all y-axii scales in a bar chart", function() {
      var y = gneiss.yAxis();
      y[0].scale = null;
      
      gneiss.isBargrid(true);
      gneiss.seriesByType({ bargrid: ["bar"] });
      
      gneiss.setYScales();
          
      expect(y[0].scale.domain()).toEqual([0, 23]);
    });
    
    it("sets ranges for all y-axii scales in a default chart", function() {
      var y = gneiss.yAxis();
      y[0].scale = null;
      
      gneiss.setYScales();
      
      expect(y[0].scale.range()).toEqual([661, 25]);
    });
    
    it("sets ranges for all y-axii scales in a bar chart", function() {
      var y = gneiss.yAxis();
      y[0].scale = null;
      
      gneiss.isBargrid(true);
      gneiss.seriesByType({ bargrid: ["bar"] });
      
      gneiss.setYScales();
      
      expect(y[0].scale.range()).toEqual([10, -10]);
    });
  });
 
  describe("resize()", function() {
    it("updates the width and height of the chart in response to container size changes", function() {      
      $("#" + containerId).width("100px").height("100px");
      gneiss.resize();
      expect(gneiss.width()).toEqual(100);
      expect(gneiss.height()).toEqual(100);    
      
      $("#" + containerId).width("1000px").height("5000px");
      gneiss.resize();
      expect(gneiss.width()).toEqual(1000);
      expect(gneiss.height()).toEqual(5000);     
    });
    
    it("sets a transform attribute on the metaInfo property", function() {      
      $("#" + containerId).width("100px").height("100px");
      gneiss.resize();
      expect(gneiss.footerElement().attr("transform")).toEqual("translate(0,96)");
           
      $("#" + containerId).width("1000px").height("5000px");
      gneiss.resize();
      expect(gneiss.footerElement().attr("transform")).toEqual("translate(0,4996)");
    });
  });
  
  describe("setPadding()", function() {
    it("updates the top padding correctly for default charts", function() {
      gneiss.defaultPadding({top: 10});
      gneiss.setPadding();
      expect(gneiss.padding().top).toEqual(10);
    });
    
    it("updates the top padding correctly for charts without legends", function() {
      gneiss.defaultPadding({top: 10});
      gneiss.legend(undefined);
      gneiss.setPadding();
      expect(gneiss.padding().top).toEqual(5);
    });
    
    it("updates the top padding correctly for charts with titles", function() {
      gneiss.defaultPadding({top: 10});
      gneiss.title("title");
      gneiss.setPadding();
      expect(gneiss.padding().top).toEqual(35);
    });
    
    it("updates the top padding correctly for bar charts", function() {
      gneiss.defaultPadding({top: 10});
      gneiss.isBargrid(true);
      gneiss.setPadding();
      expect(gneiss.padding().top).toEqual(20);
    });
    
    it("updates the bottom padding correctly for default charts", function() {
      gneiss.defaultPadding({bottom: 10});
      gneiss.setPadding();
      expect(gneiss.padding().bottom).toEqual(10);
    });
    
    it("updates the bottom padding correctly for bar charts", function() {
      gneiss.defaultPadding({bottom: 10});
      gneiss.isBargrid(true);
      gneiss.setPadding();
      expect(gneiss.padding().bottom).toEqual(-5);
    });
  });
});