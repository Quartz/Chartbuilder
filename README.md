Chartbuilder :chart_with_upwards_trend:
============

Chartbuilder is a front-end charting application that facilitates easy creation of simple beautiful charts.

Chartbuilder is the user and export interface. [D4](https://github.com/heavysixer/d4) is the default charting framework.
Chartbuilder powers all chart creation on [Atlas](http://atlas.qz.com), a
charting platform developed by Quartz.

What's new in Chartbuilder 2.0
-------------------------
* The Chart Grid type. Use it to create small multiples of bars, lines, dots, or columns.
* The app has been rewritten in React.js, making it easier to add new chart types or use
third-party rendering libraries, like we are with D4.
* Chart edits are automatically saved to localStorage, and a chart can be
recovered by clicking the "load previous chart" button on loading the page.
* Data input now accepts csv formatted data as well as tsv formated data
* All UI elements belong to [Chartbuilder UI](https://github.com/Quartz/chartbuilder-ui),
a framework of flexible React components that you can use in other projects.

What Chartbuilder is not
-------------------------
+ A replacement for Excel
+ A replacement for Google Spreadsheet
+ A data analysis tool
+ A data transformation tool

What Chartbuilder is
--------------------
Chartbuilder is the final step in charting to create charts in a consistent predefined style. Paste data into it and export the code to draw a mobile friendly responsive chart or a static svg or png chart.


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


Getting started with Chartbuilder
---------------------------------
If you are not interested in customizing the styles of your charts use the hosted version: http://quartz.github.io/Chartbuilder

To work on the Chartbuilder code, first download the project and install
dependencies:

####Download via github
1. Make sure you have a recent version of [node.js](https://github.com/joyent/node/wiki/Installation) (0.12 or above) (or [io.js](https://iojs.org/en/index.html))
2. [Download source](https://github.com/Quartz/Chartbuilder/archive/master.zip) (and unzip or clone using git)
3. from the terminal navigate to the source folder (on a Mac: `cd ~/Downloads/Chartbuilder-master/`)
4. Install the dependencies automatically by running `npm install`
5. Start the included web server by running `npm run dev`
6. Point your browser to [http://localhost:3000/](http://localhost:3000/)
7. When you're done developing, [build and deploy](docs/deploying.md) your Chartbuilder!

####Making a chart with Charbuilder
* [How to make a line chart with time series data](tutorials/basic-chart.md)
* [How to make a bar chart with ranking data](tutorials/bar-chart-with-ranking-data.md)
* [How to make a column chart with ordinal data](tutorials/column-chart-ordinal-data.md)

####Customizing your Chartbuilder
* [Getting to know the Chartbuilder code](docs/01-introduction.md)
* [Customizing chartbuilder](docs/02-customizing-chartbuilder.md)
* [Test things out](docs/testing.md)
* When you're done developing, [build and deploy](docs/deploying.md) your Chartbuilder!
* Keep your customized version [in sync with the master](docs/git-workflow-forks.md)

### Documentation

* The [Chartbuilder API docs](http://quartz.github.io/Chartbuilder/api-docs/)
document most of the React components, classes, and utilities in the code base.

##### Documentation for Chartbuilder's dependencies:
* [D3](https://github.com/mbostock/d3/wiki)
* [D4](http://visible.io/docs.html)
* [React](https://facebook.github.io/react/docs/getting-started.html)

