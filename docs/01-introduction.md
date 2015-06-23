## Diving in to Chartbuilder

Here we're going to cover how Chartbuilder is implemented so that you can get
started customizing it, adding features, and finding you're way around. If you'd
just like to know how to use Chartbuilder, rather than getting into the
internals, head to the [tutorials](../tutorials/basic-chart.md).

### Overview

Chartbuilder is built on top of a few different technologies: Facebook's
[React](https://facebook.github.io/react/) framework handles the user interface
and [Flux](http://facebook.github.io/flux/)—a small dispatcher that Facebook
designed to work with React—handles data flow throughout the app.

React and Flux keep the UI and data in sync, but they are not largely
responsible for drawing the charts. For that we rely on
[d3](https://github.com/mbostock/d3/) and a lightly modified version of
[d4](https://github.com/heavysixer/d4) (the version of d4 we're using is at
[yanofsky/d4](https://github.com/yanofsky/d4)).

The CSS styles are written in [stylus](https://learnboost.github.io/stylus/),
which is not much different than normal CSS.

System dependencies:
* relatively recent versions of [node.js](https://github.com/joyent/node/wiki/Installation)/[io.js](https://github.com/iojs/io.js) and npm
* [phantomJS 2.0.0+](http://phantomjs.org/download.html), (optional, for automated tests)

Module dependencies:

* see the `dependencies` section of [package.json](../package.json).

That was a lot of technology soup. Later we will cover how these things
work together in Chartbuilder, and we've made it pretty easy to get everything
up and running, which we'll turn to now.

### Getting up and running

*Short version (for experienced developers):*

1. clone this repo
2. `npm install` -- install dependencies
3. `npm run dev` -- start a livereloading local server
4. point your browser to the url that shows up in the terminal, most likely `http://localhost:3000`
5. run tests with `npm test`
6. when you're ready to create a release, run `npm run build` (will
	 automatically run tests)

*Long version (for the uninitiated):*

To run a local version of Chartbuilder, you'll need to first get a version of this
git repository, either by cloning it using git or downloading the source [as a zip](#)
and unzipping it. With those files on your computer, you will use your terminal to
navigate to wherever you cloned or unzipped these files to.

Once there, you can run `npm install` to automatically install all of
Chartbuilder's dependencies. (To do this, you'll need to have [node.js installed](https://github.com/joyent/node/wiki/Installation)).
With those in place, you run the command `npm run dev` in the same directory.
You will see several messages about various tasks that are running to build the
project. You'll see something like this:

This tells you that you can open a browser and point it to
`http://localhost:3000` to view your version of Chartbuilder. Using [browser sync](http://www.browsersync.io/),
this server will recompile the project, and refresh all connected browsers whenever
you make a change.

Once you've made your changes, you can create a standalone version of
Chartbuilder by running `npm run build`. This will compile all CSS and
JavaScript into the `build` directory, which you can then move to a static
server anywhere on the internet.

### Chartbuilder's structure

Before we dive in with customization and adding features (coming soon), we'll do a
quick run through how Chartbuilder is organized. The `src` directory contains
files that you want to edit.

#### JavaScript

The JavaScript is organized into these directories:

```
├── src/js
│   ├── actions
│   ├── charts
│   ├── components
│   ├── config
│   ├── dispatcher
│   ├── index.js
│   ├── stores
│   └── util
```

The `actions`, `stores`, and `dispatcher` directories are all related to Flux.
The `actions` send messages from the interface to the `dispatcher`, which then
sends them to the `stores`. The stores contain the data for the state of a
chart, and there are three. One for chart properties (like data and
settings) one for metadata (like title and size), and a third for the current
"session" (like the thousands separator for the current user's locale).

The `components` directory contains React components, all of which are named with
the `.jsx` file extension. The two main types of components in there are
`renderers` and `editors`. The editors are responsible for a given chart type's
editing interface; the renderer is responsible for preparing the actual drawing
of a chart.

In `charts` there is d3 code for drawing charts, as well as chart-specific
configuration and settings. The `config` directory contains project-wide
configuration that is not specific to one chart type.

All UI elements, like buttons, input fields, and colorpickers are separate React
components that exist in their own project, [Chartbuilder UI](https://github.com/Quartz/chartbuilder-ui). This should
make it easy to create new editor interfaces.

#### CSS

As much as possible, we have put the configuration of Chartbuilder's visual
display in CSS. We use stylus, which is essentially CSS with no brackets and
meaningful whitespace. These styles live in the `src/styl` directory.

### [Next: Customizing chartbuilder](02-customizing-chartbuilder.md)
