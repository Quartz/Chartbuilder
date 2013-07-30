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
Chartbuilder is the final step in charting. Paste data into it and export an svg or png chart.

How to use Chartbuilder
------------------------
###Getting started
1. [Download source](https://github.com/Quartz/Chartbuilder/archive/master.zip) (and unzip)
3. from the terminal navigate to the source folder (on a Mac: `cd ~/Downloads/Chartbuilder-master/`) 
4. run `python -m SimpleHTTPServer`
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
<img src="http://farm8.staticflickr.com/7367/9366053771_e78bd09a06_b.jpg" />
<img src="http://farm8.staticflickr.com/7407/9366142529_afd5a411ba_b.jpg" />

####Column charts
<img src="http://farm4.staticflickr.com/3674/9368655154_eeb1afcf0f_b.jpg" />
<img src="http://farm4.staticflickr.com/3686/9368719962_44ee2cbe4b_b.jpg" />
<img src="http://farm4.staticflickr.com/3668/9368863110_b0bb66d5c0_b.jpg" />

####Bar grids
<img src="http://farm3.staticflickr.com/2885/9365987309_388ef2e7e7_b.jpg" />
<img src="http://farm6.staticflickr.com/5541/9368820052_ded4d077c1_b.jpg" />


####Mixed
<img src="http://farm4.staticflickr.com/3799/9368896286_97e8450c4b_b.jpg" />
<img src="http://farm8.staticflickr.com/7330/9366163173_496ee2946f_b.jpg" />

Why Chartbuilder / Gneisschart
-----------------
+ You're a writer, blogger, reporter who hates the way screenshotted and excel charts look in your stories
+ You're a graphic designer or graphics editor spending too much time making simple charts in the same style
+ You're a developer at an organization looking to add consitency to employee generated charts

Chartbuilder was created to speed workflow in a newsroom and give reporters more responsibility over their content. It allows someone to create simple graphics quickly within a pre-specified style guide without needing specialized design software.

The output formats are can be used anywhere images and svgs are accepted. There's no need for CMS integration or complex back end systems. 

There are fewer excuses to use screenshots from analyst reports or charts in Excel.

More about that here http://yanofsky.info/demos/chartbuilder/slides/

Gneisschart was created to assist in the above as well as establish the starting point for a touch focused responsive charting library.

###Styling the chart
Chart styles are contained in `css/gneisschart.css`. The color palette is defined in `config/default_config.js`
