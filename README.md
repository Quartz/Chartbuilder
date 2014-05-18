Chartbuilder / Gneisschart
==========================

Chartbuilder / Gneisschart is a D3.js based front-end charting application that facilitates easy creation of simple beautiful charts.

Chartbuilder is the user and export interface. Gneisschart is the charting framework.

What Chartbuilder is not
-------------------------
+ A replacement for Excel
+ A replacement for Google Spreadsheet
+ A data analysis tool
+ A data transformation tool

What Chartbuilder is
--------------------
Chartbuilder is the final step in charting. Paste data into it and export an svg or png chart in a style that has been predefined.

Who is using Chartbuilder
--------------------
Other than Quartz, customized Chartbuilder created charts have been seen in many publications: 
+ [NPR](http://www.npr.org/blogs/parallels/2013/10/24/240493422/in-most-every-european-country-bikes-are-outselling-cars)
+ [The Wall Street Journal](http://blogs.wsj.com/korearealtime/2014/03/07/for-korean-kids-mobile-chat-rules/)
+ [CNBC](http://www.cnbc.com/id/101009116)
+ [The New Yorker](http://www.newyorker.com/online/blogs/currency/2013/12/2013-the-year-in-charts.html)
+ [The Press-Enterprise](http://blog.pe.com/political-empire/2013/07/31/ppic-poll-global-warming-a-concern-for-inland-voters/)
+ [New Hampshire Public Radio](http://nhpr.org/post/water-cleanup-commences-beede-story-shows-superfund-laws-flaws)
+ [CFO Magazine](http://ww2.cfo.com/the-economy/2013/11/retail-sales-growth-stalls/)
+ [Australian Broadcasting Corporation](http://www.abc.net.au/news/2013-10-11/nobel-prize3a-why-2001-was-the-best-year-to-win/5016010)
+ [Digiday](http://digiday.com/publishers/5-charts-tell-state-digital-publishing/)

How to use Chartbuilder
------------------------
###Getting started
If you are not interested in customizing the styles of your charts use the hosted version: http://quartz.github.io/Chartbuilder/

Alternatively: 
####Download via github
1. [Download source](https://github.com/Quartz/Chartbuilder/archive/master.zip) (and unzip)
2. from the terminal navigate to the source folder (on a Mac: `cd ~/Downloads/Chartbuilder-master/`) 
3. Start a webserver run `python -m SimpleHTTPServer`
4. Open Google Chrome, Apple Safari, or Opera and navigate to [http://localhost:8000/](http://localhost:8000/)

#### Install using bower
1. from the terminal `bower install chartbuilder`
2. copy the chartbuilder files to the top directory by running `cp -r bower_components/chartbuilder/* .`
3. compile webfontloader `cd bower_components/webfontloader/; rake compile;`
4. start a webserver `cd ../../; python -m SimpleHTTPServer;`
5. Open Google Chrome, Apple Safari, or Opera and navigate to [http://localhost:8000/](http://localhost:8000/)


####Charting time Series Data
1. Find some time series data (may I suggest [this](https://docs.google.com/a/qz.com/spreadsheet/ccc?key=0AtrPfe-ScVhJdGg0a2hKZU1JaWZ4ZGMxY3NKbWozYUE#gid=0))
2. Make sure the first column is your dates, and the heading on the first column is "date"
3. Copy and paste into chart builder

####Charting ordinal series data
1. Find some ordinal series data (may I suggest [this](https://docs.google.com/a/qz.com/spreadsheet/ccc?key=0AtrPfe-ScVhJdDZrODFnM3Q1TTlfSHA2Z3lrSjJrUmc#gid=0))
2. Make sure the first column are your categories, and the heading on the first column _isn't_ "date"
3. Copy and paste into chartbuilder

####Finishing up
_steps 2-4 are optional_

1. Pick your series types
2. Set a title
3. Set your units using the axis prefix and suffix field
4. Adjust your max and min (if you so choose)
4. Add a credit line and/or a source line
6. Click create chart
7. Select to download an svg or png

###Examples of charts made with Chartbuilder
####Line charts
<img src="http://quartz.github.io/Chartbuilder/images/line1.jpeg" />
<img src="http://quartz.github.io/Chartbuilder/images/line2.jpeg" />

####Column charts
<img src="http://quartz.github.io/Chartbuilder/images/column1.jpeg" />
<img src="http://quartz.github.io/Chartbuilder/images/column2.jpeg" />
<img src="http://quartz.github.io/Chartbuilder/images/column3.jpeg" />

####Bar grids
<img src="http://quartz.github.io/Chartbuilder/images/bargrid1.jpeg" />
<img src="http://quartz.github.io/Chartbuilder/images/bargrid2.jpeg" />


####Mixed
<img src="http://quartz.github.io/Chartbuilder/images/mixed1.jpeg" />
<img src="http://quartz.github.io/Chartbuilder/images/mixed2.jpeg?cache=0" />

Deploying Chartbuilder
------------------------
ChartBuilder is meant to be deployed by an organization and then customized for the design consistency of that organization so that the reporters or other people in that organization can make charts.

###Deploying
ChartBuild is an HTML/CSS/JS application.  You can easy copy, fork, and install the files wherever.  It can be easily put up on Github Pages.

###Configuration
Once you deploy it, configuring is either through CSS overrides, custom HTML, or Javascript configuration.

####Chart configuration
Chart configuration is handled by passing a configuration object through to `ChartBuilder.start()`.

    ChartBuilder.start({
      colors: ["#ff4cf4","#ffb3ff","#e69ce6","#cc87cc","#b373b3","#995f99"],
      creditline: 'NewsPost Inc.'
    });

You can see all the configuration options in the [Gneisschart.js library](https://github.com/Quartz/Chartbuilder/blob/master/js/gneisschart.js).

###Getting started

Why Chartbuilder / Gneisschart
-----------------
+ You're a writer, blogger, reporter who hates the way screenshotted research reports and excel charts look in your stories
+ You're a graphic designer or graphics editor spending too much time making simple charts in the same style
+ You're a developer at an organization looking to add consistency to employee generated charts

Chartbuilder was created to speed workflow in a newsroom and give reporters more responsibility over their content. It allows someone to create simple graphics quickly within a pre-specified style guide without needing specialized design software.

The output formats are can be used anywhere images and svgs are accepted. There's no need for CMS integration or complex back end systems. 

There are fewer excuses to use screenshots from analyst reports or charts in Excel.

More about that here http://yanofsky.info/demos/chartbuilder/slides/

Gneisschart was created to assist in the above as well as establish the starting point for a touch focused responsive charting library.

###Styling the chart
Chart styles are contained in `css/gneisschart.css`. The color palette is defined in the configuration object
