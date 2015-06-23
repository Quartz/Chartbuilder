## Customizing Chartbuilder

You may want to alter some of Chartbuilder's basic style and settings for your organization.
That's what we'll cover here.

As noted in the [introduction to Chartbuilder's internals](01-introduction.md), we
made as many style options as possible configurable through CSS. Nearly all
other settings can be configured in one of two places in JavaScript:
1. The global config files in the `src/js/config` directory
2. The configuration file for each chart type, for example `xy-config.js` in `src/js/charts/cb-xy`.

### Colors and CSS

CSS will be able to cover most of the prominent aesthetic features of your
charts: the color palette, typography, size of lines and dots, and more. Let's
look at editing the colors.

Nearly all the colors used anywhere in Chartbuilder are defined in
`styl/colors.styl`. There's an array of colors defined there, `$chart-colors`.
Changing these values will update the color palette used for your charts,
including the interface. There's one thing to note, however: our JavaScript has
no way of knowing how many colors it ought to render, so you'll need to make
sure the `numColors` value in your chart config matches the number of colors
defined in `colors.styl`. The number of colors is set per chart type, in case
some types have different requirements.

The `colors.styl` file also contains variables for various other colors used in
Chartbuilder, so edit them at will. You can find typography definitions in
`type.styl`. The visual elements of the charts themselves are defined in
`chart-renderer.styl`.

### Chart properties

Each chart type has its own config file. Currently in Chartbuilder there are
such files for an XY chart (line, column, dots, or any combination of these) and
a Chart Grid (repeated small multiples). Each config file has the following
properties to keep in mind:

* `displayName`: Name used on the button for selecting this chart
* `parser`: A function that processes the input and parses it for use with the
	chart editor and renderer.
* `config`: Settings that are specific to this chart type, and are static,
	meaning they don't change over time. Settings that are set in "ems" will be
	calculated based on the rendered size of a chart's type.
* `defaultProps`: Where the default properties for your chart model are
	set.

### The chart model

A chart consists of `chartProps` and `metadata`. The former
tell the chart renderer how to draw the chart itself, while `metadata` relates to the
area around the chart, such as the title, credit, and source. By convention,
`chartProps` that are specific to a certain chart type start with an
underscore, like `chartProps._grid` in chart grid. Properties that are shared
across chart types will be carried over when changing types.

Here is further explanation of these properties (a sample is shown below):

`input`: An object containing the `raw` input as well as a status code
indicating whether there have been any parse errors.

`extraPadding`: Space around the chart area that may be dynamic. In
XY charts, for example, `extraPadding` changes based on the width of the
longest axis tick.

`scale`: Settings related to the chart's scales. The `primaryScale` should be
used for the main linear scale in order for settings to carry over from one
chart type to another. This isolates the primary scale from others, such as
dates or a secondary scale for a chart with multiple y axes.

`chartSettings`: Any additional configuration that should be changeable via a
chart editor. These are mostly used for properties specific to each column of a
dataset, such as the color or display type.

Some properties need to be calculated; the `config` file merely sets the
defaults. It is up to the chart parser to do any necessary calculations. For
example, [here is](misc/sample_chart_model.json) a model of an XY chart after it has
been parsed by `js/charts/cb-xy/parse-xy.js`.

