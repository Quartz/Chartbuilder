### Getting started

Go to [http://quartz.github.io/Chartbuilder/](http://quartz.github.io/Chartbuilder/)

#### **Charting time Series Data (the basic stock chart)**

1. Find some time series data (may I suggest [this](https://docs.google.com/a/qz.com/spreadsheet/ccc?key=0AtrPfe-ScVhJdGg0a2hKZU1JaWZ4ZGMxY3NKbWozYUE#gid=0)) 

 1. if you need stock data, you’ll need to download that by using factset

 2. if you need economic data, the World Bank, IMF, OECD and St. Louis Fed have repositories.

 3. The first row of your data must be your column headers!

2. Make sure the first column is your dates, and the heading on the first column is "date"

3. Copy and paste into the box under "1. Input your data"

#### **Charting ordinal series data**

1. Find some ordinal series data (may I suggest [this](https://docs.google.com/a/qz.com/spreadsheet/ccc?key=0AtrPfe-ScVhJdDZrODFnM3Q1TTlfSHA2Z3lrSjJrUmc#gid=0))

 + The first row of your data must be your column headers!

2. Make sure the first column are your categories, and the heading on the first column *isn't* "date"

3. Copy and paste into the box under "1. Input your data"

#### **Finishing up**

*Adjust the Series Options*

1. Adjust the colors if necessary by clicking on the colored square in the list. 

2. Use the drop downs to select the chart type

3. The checkbox turns on dual axes (you probably shouldn’t use this)

*Adjust and input Chart Options*

1. A title is optional

 + Style point: most of the information that typically is in a chart title is better suited in other parts of the chart e.g. a line label or axis suffix, try using titles for editorial effect "The demise of Goldman" or clarity “Emerging market performance” for a chart with multiple emerging market countries represented

2. The credit is defaults to "Made with Chartbuilder" feel free delete or change.

3. Source is blank by default, you should add one.

*Adjust and input Right Axis Options*

1. Prefix: often a $, £, € or blank

2. Suffix: be descriptive! indicate magnitude and unit: %, per share, million per capita, trillion, growth

 + Style point: Try to reduce our data to smallest possible display number. For example if a data point is $5,200 million we divide the whole data set by 1000 to yield $5.2 billion on the chart

3. Max, min, and number of ticks are optional. They are set automatically if these fields are empty.

 + It’s helpful to finagle the number of ticks and the max and min to have axis values that are regular. 0, 9, 18, 27 is not as good as 0, 10, 20, 30

*Adjust the Bottom Axis Options*

1. Pick your prefered date format

	(the number selector doesn’t work)

**Export**

1. Click the "Create Image of Chart" button

2. Click "download image" of chart

