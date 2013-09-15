describe("ChartBuilder", function() {

  beforeEach(function() {
  });
  
  afterEach(function() {
  });

  it("contains a makeDataObj function", function() {
    expect(ChartBuilder.makeDataObj).not.toEqual(undefined);
  });
	
	it("contains a getNewData function", function() {
    expect(ChartBuilder.getNewData).not.toEqual(undefined);
  });

  describe("getNewData()", function() {
    it("returns null if the input matrix has fewer than two columns", function() {
      expect(ChartBuilder.getNewData(undefined)).toEqual(null);
      expect(ChartBuilder.getNewData(null)).toEqual(null);            
      expect(ChartBuilder.getNewData("")).toEqual(null);
      expect(ChartBuilder.getNewData("column1")).toEqual(null);
      expect(ChartBuilder.getNewData("column1\nvalue1")).toEqual(null);
      expect(ChartBuilder.getNewData("column1\nvalue1\nvalue2")).toEqual(null);
    });

    it("returns null if the input matrix has fewer than two rows of data (in addition to headers)", function() {
      expect(ChartBuilder.getNewData("column1\tcolumn2\nrow1value1\trow1value2\n")).toEqual(null);
    });

    it("returns null if the input matrix has rows with more columns than the number of headers", function() {
      expect(ChartBuilder.getNewData("column1\tcolumn2\nrow1value1\trow1value2\nrow2vaue1\trow2value2\trow2value3")).toEqual(null);
      expect(ChartBuilder.getNewData("column1\tcolumn2\nrow1value1\t\trow1value2\nrow2vaue1\trow2value2\t")).toEqual(null);
    });

    it("returns null if the input matrix has rows with fewer columns than the number of headers", function() {
      expect(ChartBuilder.getNewData("column1\tcolumn2\nrow1value1\trow1value2\nrow2vaue1")).toEqual(null);
    });

    it("returns a matrix of parsed values given valid tab-delimited input", function() {
      expect(ChartBuilder.getNewData("column1\tcolumn2\nrow1value1\trow1value2\nrow2vaue1\trow2value2")).toEqual(
        [['column1', 'column2'], ['row1value1', 'row1value2'], ['row2vaue1', 'row2value2']]);
    });

    it("trims both leading and trailing whitespace on rows", function() {
      expect(ChartBuilder.getNewData("\t column1\tcolumn2       \nrow1value1\trow1value2\t\t\n     row2vaue1\trow2value2 \t")).toEqual(
        [['column1', 'column2'], ['row1value1', 'row1value2'], ['row2vaue1', 'row2value2']]);
    });

    it("trims both leading and trailing spaces on values", function() {
      expect(ChartBuilder.getNewData("column1  \t    column2\n    row1value1   \trow1value2\n  row2vaue1  \trow2value2")).toEqual(
        [['column1', 'column2'], ['row1value1', 'row1value2'], ['row2vaue1', 'row2value2']]);
    });

    it("preserves spaces within values", function() {
      expect(ChartBuilder.getNewData("column1\tcolumn header with spaces\nAug 23, 2013\trow1value2\nrow2vaue1\trow2 value2")).toEqual(
        [['column1', 'column header with spaces'], ['Aug 23, 2013', 'row1value2'], ['row2vaue1', 'row2 value2']]);
    });
       
    it("preserves empty/missing values", function() {
      expect(ChartBuilder.getNewData("column1\t\tcolumn3\nrow1value1\t\trow1value3\nrow2vaue1\trow2value2\trow2value3")).toEqual(
        [['column1', '', 'column3'], ['row1value1', '', 'row1value3'], ['row2vaue1', 'row2value2', 'row2value3']]);
    });
     
    it("ignores empty rows and extra carriage returns", function() {
       expect(ChartBuilder.getNewData("column1\tcolumn2\n\n\nrow1value1\trow1value2\n\nrow2vaue1\trow2value2\n\n\n")).toEqual(
        [['column1', 'column2'], ['row1value1', 'row1value2'], ['row2vaue1', 'row2value2']]);
    });

    it("correctly parses sample financial data", function() {
      var msftStockPrices= 
        "Date	Open	High	Low	Close\n" +
        "8/29/13	33.35	33.60	33	33.02\n" +
        "8/28/13	33.39	33.6	33	33.02\n" +
        "8/27/13	33.515	34.1	33.15	33.26\n" +
        "8/26/13	34.4	34.67	34.03	34.15\n" +
        "8/23/13	35.17	35.2	34	34.75\n" +
        "8/22/13	32.185	32.49	32.1	32.39\n" +
        "8/21/13	31.61	32.01	31.54	31.61";
				
      expect(ChartBuilder.getNewData(msftStockPrices)).toEqual(
        [["Date","Open","High","Low","Close"],
        ["8/29/13","33.35","33.60","33","33.02"],
        ["8/28/13","33.39","33.6","33","33.02"],
        ["8/27/13","33.515","34.1","33.15","33.26"],
        ["8/26/13","34.4","34.67","34.03","34.15"],
        ["8/23/13","35.17","35.2","34","34.75"],
        ["8/22/13","32.185","32.49","32.1","32.39"],
        ["8/21/13","31.61","32.01","31.54","31.61"]]);
		});
	});
});