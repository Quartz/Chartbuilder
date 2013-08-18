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
});