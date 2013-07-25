Chartbuilder / Gneisschart
==========================

Chartbuilder / Gneisschart is a D3.js based front end charting application that allows for easy creation of simple beautiful charts.

Chartbuilder is the user and export interface. Gneisschart is the charting framework.

What Chartbuilder is not
-------------------------
A replacement for Excel
A replacement for Google Spreadsheet
A data analysis tool
A data transformation tool

What Chartbuiler is
--------------------
Chartbuilder is the final step in charting. Paste data into it and export an svg or png chart.

How to use Chartbuilder
------------------------
###Getting started
1. Download source
2. from the terminal navigate to the source folder run python -m SimpleHTTPServer
3. Open Google Chrome, navigate to http://localhost:8000/

####Charting time Series Data
1. Find some time series data (may I suggest this)
2. Make sure the first column is your dates, and the heading on the first column is "date"
3. Copy and paste into chart builder

####Charting ordinal series data
1. Find some ordinal series data (may I suggest this)
2. Make sure the first column are your categories, and the heading on the first column _isn't_ "date"
3. Copy and paste into chartbuilder

####Finishing up
1. Set your units using the axis prefix and suffix field
2. Adjust your max and min (if you so choose)
3. Add a credit line and/or a source line
4. Click create chart
5. Select to download an svg or png

###Styling the chart
Chart styles are contained in css/gneisschart.css. The color palette is defined in config/default_config.js