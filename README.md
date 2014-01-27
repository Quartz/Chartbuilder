MPR-Chartbuilder
==========================

MPR-Chartbuilder is a customized fork of a charting tool hosted at https://github.com/Quartz/Chartbuilder. Changes include color palettes and fonts consistent with Minnesota Public Radio online style conventions.

What Chartbuilder is not
-------------------------
+ A replacement for Excel
+ A replacement for Google Spreadsheet
+ A data analysis tool
+ A data transformation tool

What Chartbuilder is
--------------------
Chartbuilder is the final step in charting. Paste data into it and export a png chart in a style that has been predefined.

How to use Chartbuilder
------------------------
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
5. Add a credit line and/or a source line
6. Click create chart
7. Download png file

FAQ/Troubleshooting
------------------------
#####Why does the chart in the preview pane exceed the pane's boundaries?
You are probably using Firefox or another browser that currently doesn't play nicely with Chartbuilder. Though Firefox will output a usable image, you can't see what you're building. Use Chrome.

#####When I paste my data it shows up in the Input box in a single line with no spaces.
A symptom of Internet Explorer. Charts still seem to render properly, but it's practically impossible to edit the data, so the Chrome browser is preferred.

#####Why do I get a "Warning: Data is Invalid" error when I paste my table?
Chartbuilder requires clean data to work properly.
+ Do not include '%' or '$' symbols in your tables
+ If the data looks clean, it may still contain hidden characters. Check the HTML table (Option 6) for things like '&nbsp' (a hidden space character).
+ Sometimes a second set of data pasted over your first will create a single line of information rather than a table. Reset the page and start over.

#####My chart looks fine in the preview pane, but the exported image is missing details like the title, legend, source credit, etc.
Hidden characters can prevent Chartbuilder from merging the layers that make up your chart on export. Check the HTML table (Option 6) for things like '&nbsp' (a hidden space character).

#####Chartbuilder's cramming all the years on the bottom axis so they're unreadable.
Make sure the label on the column with your years is 'Date', not 'Year' or anything else. Chartbuilder will recognize this as a date and space out the years listed on the axis.

#####The bottom axis shows a series of 'Jan. 1' instead of the years.
The date format can be changed via the dropdown box in Option 5.

#####I made a change that pushed the title, legend or other info off the chart. What can I do to fix it?
This hasn't been happening as often after some code improvements. But if it does, you may be able to backtrack through your changes to get the preview back to something usable. Sometimes it's easier to refresh the page and start from scratch.

#####I made changes to my chart that didn't show up in the downloaded image.
That can happen if you make a change after clicking the "Save Image of Chart" button but before clicking the "Download Image of Chart" link. You need to click the "Save..." button again to save your changes. (You may have to do it twice to make the "Download..." button appear again.) 

Examples of charts made with Chartbuilder
------------------------
####Line charts
<img src="http://tools.bilware.info/MPR-Chartbuilder/img/line1.png" />
<img src="http://tools.bilware.info/MPR-Chartbuilder/img/line2.jpeg" />

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

