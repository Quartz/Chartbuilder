describe("Gneiss", function() {

  beforeEach(function() {
	  // Run test setup here
  });

  it("contains a default chart config", function() {
    expect(defaultGneissChartConfig).not.toEqual(undefined);
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
                       
      var actual = Gneiss.splitSeriesByType(series);
      
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
      var graph = { xAxis: {} };
      
      var seriesByType = { bargrid: ["bargrid"], column: ["column"] };
      Gneiss.updateGraphPropertiesBasedOnSeriesType(graph, seriesByType);
      
      expect(graph.xAxis.hasColumns).toEqual(true);
    });
    it("sets the 'hasColumns' property on the x-axis of a graph to false if a series of column data exists", function() {
      var graph = { xAxis: {} };
      
      var seriesByType = { bargrid: [], column: [] };
      Gneiss.updateGraphPropertiesBasedOnSeriesType(graph, seriesByType);
      
      expect(graph.xAxis.hasColumns).toEqual(false);
    });
    it("sets the 'isBargrid' property on a graph to true if a series of bar graph data exists", function() {
      var graph = { xAxis: {} };
      
      var seriesByType = { bargrid: ["bargrid"], column: ["column"] };
      Gneiss.updateGraphPropertiesBasedOnSeriesType(graph, seriesByType);
      
      expect(graph.isBargrid).toEqual(true);
    });
    it("sets the 'isBargrid' property on a graph to false if a series of bar graph data does not exists", function() {
      var graph = { xAxis: {} };      
      
      var seriesByType = { bargrid: [], column: [] };
      Gneiss.updateGraphPropertiesBasedOnSeriesType(graph, seriesByType);
      
      expect(graph.isBargrid).toEqual(false);
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
});