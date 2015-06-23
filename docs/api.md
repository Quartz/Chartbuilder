## `_applySettingsToData`

_applySettingsToData
Our d4 chart renderers expect any additional settings to be in the data
that is passed to it, so we merge them in (from a separate
`chartSettings` object). An optional `additional` parameter adds an
arbitray object to this

### Parameters

* `_chartProps` **``** Current data and series settings
* `additional` **``** Optional additional object to apply



Returns `object` Data with settings applied


## `_getPrevUndraggedNode`

XYLabels#_getPrevUndraggedNode
Recursively traverse through previous labels to find one that is undragged
This is used to calculate the default placement of a label (ie to the
right of the previous undragged node)

### Parameters

* `ix` **`number`** The index of this undragged node in an array of undragged nodes
* `undraggedLabels` **`Array<object>`** Position and size settings for all undraggedlabels





## `_handleDomainUpdate`

_handleDomainUpdate
Update the domain with a new custom maximum or mimimum. Like
`_handleScaleUpdate` this passes an updated scale object to the parent

### Parameters

* `k` **`string`** Key of the domain object. Must be `"max"` or `"min"`
* `v` **`number`** New domain value





## `_handlePropAndReparse`

_handlePropAndReparse
Initiate a flux action that updates a prop and then triggers a reparse

### Parameters

* `k` **``** `chartProp` key
* `v` **``** `chartProp` value





## `_handlePropUpdate`

_handlePropUpdate
Initiate a flux action that updates a prop, that doesn't require reparsing

### Parameters

* `k` **``** `chartProp` key
* `v` **``** `chartProp` value





## `_handleScaleUpdate`

_handleScaleUpdate
Apply new values to the `scale` object and pass it to the parent's callback

### Parameters

* `k` **`string`** New scale property's key
* `v` **`Any`** New scale proptery's value





## `_handleStateUpdate`

_handleStateUpdate
Update a key in the renderer component's state

### Parameters

* `k` **``** `this.state` key
* `v` **``** `this.state` value





## `_handleStateUpdate`

_handleStateUpdate
Update a key in the editor component's state

### Parameters

* `k` **``** `this.state` key
* `v` **``** `this.state` value





## `_onChange`

Function that is fired any time a change is made to a chart. By default it
fetches the latest chart state from the stores and updates the Chartbuilder
component with that state. If `autosave` is set to `true`, it will also
update `localStorage` with the new state.






## `breakpoints`

Configuration of breakpoints for Chartbuilder renderers.


| name | type | description |
| ---- | ---- | ----------- |
| `class_name` | `string` | Applied to the renderer at this break point |
| `min_size` | `number` | Minimum value (most likely width) at which to apply this breakpoint |
| `em_size` | `number` | Font size at this breakpoint. This is used to calculate relative positioning |




## `calculate_xy_dimensions`

see [ChartConfig#calculateDimensions](#chartconfig/calculatedimensions)






## `calculateDimensions`

Func that returns an object of `{width: N, height: N}` that will determine
dimensions of a chart

### Parameters

* `width` **`number`** Width of container or area that will contain the chart
* `model` **`object`** The `chartProps` and `metadata` of the current chart
* `chartConfig` **`object`** Parsed chart configuration
* `enableResponsive` **`boolean`** Should we make dimensions relative to container or use preset sizes
* `extraHeight` **`number`** Additional height we need to account for, eg from wrapped text at the footer



Returns `Object` dimensions - Dimensions returned by calculation
Returns `number` dimensions.width
Returns `number` dimension.height


## `cb_bar_grid`

Chartbuilder's bar grid constructor. It is a slightly modified version of d4's row chart




Returns `object` bar_grid


## `cb_charts`

Object that exposes Chartbulider's d4 chart constructors






## `cb_d4_mixins`








## `cb_xy`

Chartbuilder's XY chart constructor. It is capable of rendering line, column, and
dot (scatter) charts, and any combination of those, as well as dual axes.




Returns `object` xy


## `chart_grid_config`

### Configuration of a Chart grid






## `chart_grid_defaultProps`








## `chart_sizes`

Default dimensions for non-responsive chart sizes.






## `chart_style`

Global style config that is not specific to any one chart type


| name | type | description |
| ---- | ---- | ----------- |
| `overtick_top` | `Nem or number` |  |
| `overtick_bottom` | `Nem or number` |  |
| `numColors` | `number` |  |
| `xOvertick` | `Nem or number` | Font size at this breakpoint. This is used to |
| `creditMargin` | `Nem or number` | Distance btwn credit and the logo/text beside it |




## `Chartbuilder`

### Chartbuilder parent component


| name | type | description |
| ---- | ---- | ----------- |
| `autosave` | `boolean` | Save to localStorage after every change |
| `showMobilePreview` | `boolean` | Show mobile preview underneath default chart |
| `onStateChange` | `function` | Callback when state is changed |
| `additionalComponents` | `Object` | Optional additional React components |

### Examples

```js
var React = require("react");
var Chartbuilder = require("./components/Chartbuilder.jsx");
var container = document.querySelector(".chartbuilder-container");

React.render(
  <Chartbuilder
    autosave={true}
    showMobilePreview={true}
  />,
container );
```



## `Chartbuilder#getStateFromStores`

Function to query Flux stores for all data. Runs whenever the stores are
updated, usually by the Editor but occassionally by Renderers that allow
direct editing of the chart, eg draggable legend labels in `XYRenderer.jsx`




Returns `Object` Chartbuilder state


## `ChartbuilderDispatcher`

Flux dispatcher handles incoming payloads and sends them to flux stores.
Usually data come from the UI, but can also come from localStorage or a
server






## `ChartConfig`

### Chart config
Set up a configuration object for a given chart type


| name | type | description |
| ---- | ---- | ----------- |
| `settings` | `object` |  |
| `settings.displayName` | `string` | How this type's name should be displayed in the interface |
| `settings.parser` | `function` | Func to parse input for this chart type |
| `settings.calculateDimensions` | `function` | Func to calculate dimensions of this chart type |
| `settings.display` | `object` | Static display config for this chart type, such as positioning and spacing |
| `settings.defaultProps` | `object` | Defaults for dynamic properties that will be used to draw the chart |




## `ChartEditorMixin`

### Functions common to chart editors






## `ChartExport`

### Buttons that allow the user to export a chart to an image or Svg.






## `ChartFooter`

Render a footer with the chart credit and source






## `ChartGrid_chartSettings`

Series-specific settings drawn for each column in data


| name | type | description |
| ---- | ---- | ----------- |
| `name` | `string` | Series (column) name |
| `chartSettings` | `Array<object>` | Current settings for data series |
| `universalSettings` | `boolean` | Whether `universalSettings` is currently enabled |
| `numColors` | `number` | Total number of possible colors |




## `ChartGrid_gridSettings`

Settings that control the grid layout and type


| name | type | description |
| ---- | ---- | ----------- |
| `grid` | `object` | Set grid type and number of rows and columns |
| `numSeries` | `number` | Number of columns, used to decide how many rows/columns are possible |




## `ChartGrid_universalToggle`

Button to toggle universal setting that applies series settings to all series


| name | type | description |
| ---- | ---- | ----------- |
| `text` | `string` | Text of universal toggle button |
| `chartSettings` | `Array<object>` | Current settings for data series |
| `universalSettings` | `boolean` | Whether `universalSettings` is currently enabled |
| `onClick` | `function` | Callback on toggle button click |




## `ChartGrid_xScaleSettings`

### Chart grid xScale settings parent component


| name | type | description |
| ---- | ---- | ----------- |
| `scale` | `object` | `chartProps.scale` object of the current chart. See this component's PropTypes |
| `onUpdate` | `function` | Pass the updated scale back to the parent |
| `className` | `string` | CSS class to apply to this component |
| `stepNumber` | `string` | Number to display in Editor interface |

### Examples

```js
<ChartGrid_xScaleSettings
 scale={chartProps.scale}
 onUpdate={this._handlePropAndReparse.bind(null, "scale")}
 className="scale-options"
 key="xScale"
 stepNumber="4"
/>
```



## `ChartGridBars`

### Component that renders bar (row) charts in a chart grid


| name | type | description |
| ---- | ---- | ----------- |
| `editable` | `boolean` | Allow the rendered component to interacted with and edited |
| `displayConfig` | `object` | Parsed visual display configuration for chart grid |
| `chartProps` | `object` | Properties used to draw this chart |




## `chartGridDimensions`

see [ChartConfig#calculateDimensions](#chartconfig/calculatedimensions)






## `ChartGridEditor`

### Editor interface for a Chart grid


| name | type | description |
| ---- | ---- | ----------- |
| `chartProps` | `object` | Properties used to draw this chart |
| `numSteps` | `number` | Allow the rendered component to interacted with and edited |




## `ChartGridRenderer`

### Component that renders bar (row) charts in a chart grid


| name | type | description |
| ---- | ---- | ----------- |
| `editable` | `boolean` | Allow the rendered component to interacted with and edited |
| `displayConfig` | `object` | Parsed visual display configuration for chart grid |
| `chartProps` | `object` | Properties used to draw this chart |




## `ChartGridXY`

### Component that renders xy charts in a chart grid


| name | type | description |
| ---- | ---- | ----------- |
| `editable` | `boolean` | Allow the rendered component to interacted with and edited |
| `styleConfig` | `object` | Parsed global style config |
| `displayConfig` | `object` | Parsed visual display configuration for chart grid |
| `chartProps` | `object` | Properties used to draw this chart |




## `ChartMetadata`

Edit a chart's metadata


| name | type | description |
| ---- | ---- | ----------- |
| `metadata` | `object` | Current metadata |
| `stepNumber` | `string` | Step in the editing process |
| `additionalComponents` | `undefined` | Additional React components. Anything passed here will be given a callback that updates the `metadata` field. This is useful for adding custom input fields not provided. |




## `ChartMetadataStore`

### ChartMetadataStore.js
Flux store for chart metadata such as title, source, size, etc.






## `ChartPropertiesStore`

### ChartProptiesStore.js
Flux store for chart properties such as data, settings, scale






## `chartProps`




| name | type | description |
| ---- | ---- | ----------- |
| `scale` | `object` | Default settings for date and primary scales |
| `data` | `array` |  |
| `input` | `object` |  |
| `chartSettings` | `Array<object>` | Default settings for a given series (column) of data |
| `extraPadding` | `object` | Additional padding. This is a dynamic value and is mostly changed within the component itself |
| `_annotations` | `object` | Additional informative graphical elements |
| `_annotations.labels` | `object` | If labels are dragged, their position settings are saved here |
| `_annotations.labels.values` | `Array<object>` | Array of settings for dragged labels |
| `mobile` | `object` | Mobile-specific override settings |




## `chartProps`




| name | type | description |
| ---- | ---- | ----------- |
| `scale` | `object` | Default settings for date and primary scales |
| `input` | `object` |  |
| `chartSettings` | `array` | Default settings for a given series (column) of data |
| `extraPadding` | `object` | Additional padding. This is a dynamic value and is mostly changed within the component itself |
| `_grid` | `object` | Grid settings |
| `_grid.rows` | `number` | Number of rows in the grid |
| `_grid.cols` | `number` | Number of columns in the grid |
| `_grid.type` | `string` | Grid type `(bars|lines|dots|columns)` |
| `mobile` | `object` | Mobile-specific override settings |




## `ChartRendererMixin`

### Functions common to chart renderers






## `ChartServerActions`

### ChartServerActions
Send data from some external API, usually localStorage in our case






## `ChartTypeSelctor`

Select a new chart type, copying shared settings over to the new type.






## `ChartViewActions`

### ChartViewActions
Send data from React views to Flux dispatcher, and on to the stores






## `clear`

clear
Set metadata to empty






## `clear`

clear
Set chartProps to empty






## `combine_margin_pading`

combine_margin_pading

### Parameters

* `m` **``** 
* `p` **``** 



Returns `object` 


## `compute_scale_domain`

compute_scale_domain

### Parameters

* `scaleObj` **``** Current scale before generating new domain
* `data` **`Array<number>`** All values in the current scale
* `opts` **`object`** Whether to return nice values or force a minimum of 0 or below



Returns `object` { domain: [min, max], custom: <boolean> }


## `concealer_label`

Render a label with a rect background to conceal what is underneath the text






## `config`

Global config not specific to a chart type






## `DataInput`

### Text area component and error messaging for data input






## `DateScaleMixin`

### Mixin for renderers that require construction of a date scale






## `DateScaleSettings`

### Date scale settings for a chart editor


| name | type | description |
| ---- | ---- | ----------- |
| `scale` | `object` | Scale settings, which include date scale settings |
| `onUpdate` | `function` | Callback to send selected date options back to parent |
| `stepNumber` | `string` | Step in the editing process |




## `default_input`

Tabular data that is loaded in when Chartbuilder loads initially






## `display`

display


| name | type | description |
| ---- | ---- | ----------- |
| `afterTitle` | `Nem or number` | Distance btwn top of title and top of legend or chart |
| `afterLegend` | `Nem or number` | Distance btwn top of legend and top of chart |
| `blockerRectOffset` | `Nem or number` | Distance btwn text of axis and its background blocker |
| `paddingBerBar` | `Nem or number` | Space btwn two bars in a bar grid |
| `barHeight` | `Nem or number` | Height of an individual bar in a bar grid |
| `afterXYBottom` | `Nem or number` | Vert distance btwn two chart grids that are stacked |
| `afterXYRight` | `Nem or number` | Horiz distance btwn two chart grids that are next to each other |
| `columnExtraPadding` | `Nem or number` | Extra padding given if a chart grid XY has columns |
| `bottomPaddingWithoutFooter` | `Nem or number` | Bottom padding if footer is not drawn |
| `bottomPaddingWithoutFooter` | `Nem or number` | Bottom padding if footer is not drawn |
| `xy` | `object` | Copy of `xy_config.display`, used in XY chart grids |
| `margin` | `object` | Distances btwn outer chart elements and container |
| `padding` | `object` | Distances btwn inner chart elements and container |




## `display`

display


| name | type | description |
| ---- | ---- | ----------- |
| `labelRectSize` | `Nem or number` | Size of the legend label rectangle |
| `labelXMargin` | `Nem or number` | Horiz distance btwn labels |
| `labelTextMargin` | `Nem or number` | Horiz distance btwn label rect and text |
| `labelRowHeight` | `Nem or number` | Vert distance btwn rows of labels items with colors the appropriate indexed CSS class |
| `afterTitle` | `Nem or number` | Distance btwn top of title and top of legend or chart |
| `afterLegend` | `Nem or number` | Distance btwn top of legend and top of chart |
| `blockerRectOffset` | `Nem or number` | Distance btwn text of axis and its background blocker |
| `columnPaddingCoefficient` | `Nem or number` | Distance relative to width that column charts should be from edge of the chart |
| `minPaddingOuter` | `Nem or number` | Minimum distance between the outside of a chart and a graphical element |
| `bottomPaddingWithoutFooter` | `Nem or number` | Bottom padding if footer is not drawn |
| `aspectRatio` | `object` |  |
| `aspectRatio.wide` | `number or fraction` |  |
| `aspectRatio.longSpot` | `number or fraction` |  |
| `aspectRatio.smallSpot` | `number or fraction` |  |
| `margin` | `object` | Distances btwn outer chart elements and container |
| `padding` | `object` | Distances btwn inner chart elements and container |




## `editors`








## `exact_ticks`

Generate an exact number of ticks given a domain

### Parameters

* `domain` **`Array<number>`** min/max of the current scale
* `numticks` **`number`** desired number of ticks



Returns  Array of ticks


## `generateDateScale`

generateDateScale
Create a date scale given data, scale, and dimensions settings

### Parameters

* `props` **``** 



Returns `object` `{ dateTicks: ...,  domain: ..., dateFormatter: ...}`


## `get`

get

### Parameters

* `k` **``** 



Returns `any` Return value at key `k`


## `get`

get




Returns `any` Return value at key `k`


## `get`

get

### Parameters

* `k` **``** 



Returns `any` Return value at key `k`


## `getAll`

getAll




Returns `object` Return all chartProps


## `getAll`

getAll




Returns `object` Return all metadata


## `getAll`

getAll




Returns `object` Return all session data


## `GridChart`

### Component that renders a single grid chart. One of these is rendered for each series in a chart grid


| name | type | description |
| ---- | ---- | ----------- |
| `styleConfig` | `object` | Allow the rendered component to interacted with and edited |
| `displayConfig` | `object` | Parsed visual display configuration for chart grid |
| `chartProps` | `object` | Properties used to draw this chart |
| `rendererFunc` | `function` | Function that we will pass to grid to draw the actual chart |
| `grid` | `object` | Settings for grid type, and number of columns/rows |




## `handleServerAction`

Incoming server action. Normally a localStorage object
See `./actions/ChartServerActions.js`

### Parameters

* `action` **`Object`** { eventName: "string", <data>: <value>}





## `handleViewAction`

Incoming view action. Normally comes from a React component.
See `./actions/ChartPropertiesActions.js`

### Parameters

* `action` **`Object`** { eventName: "string", <data>: <value>}





## `helper`

Helper functions!






## `HiddenSvgAxis`

Given a set of formatted text, render hidden axis ticks and find the largest
width among them, sending that number back to the parent






## `HiddenSvgBarLabels`

Given a scale, render hidden bar grid labels to find which is furthest right.
This allows us to increase the padding of these charts to account for the
extra width






## `LocalStorageTimer`

Button that persists for `TIMER_DURATION` and allows user to re-load the
chart currently saved in `localStorage`. On click, it updates the
`SessionStore`.






## `merge_or_apply`

Given a defaults object and a source object, copy the value from the source
if it contains the same key, otherwise return the default. Skip keys that
only exist in the source object.

### Parameters

* `defaults` **`object`** Default schema
* `source` **`object`** Source object to copy properties from



Returns `object` Result has identical keys to defaults


## `metadata`




| name | type | description |
| ---- | ---- | ----------- |
| `chartType` | `string` |  |
| `size` | `string` |  |




## `metadata`




| name | type | description |
| ---- | ---- | ----------- |
| `chartType` | `string` |  |
| `size` | `string` |  |




## `parseChartgrid`

see [ChartConfig#parser](#chartconfig/parser)






## `parser`

Func that parses input and settings to return newly parsed `chartProps`

### Parameters

* `config` **`object`** The parsed configuration for this chart type
* `_chartProps` **`object`** Previous `chartProps`
* `callback` **`function`** Function to pass new `chartProps` to upon parse completion
* `parseOpts` **`object`** Additional parse options



Returns `Object` chartProps - Updated `chartProps`


## `parseXY`

see [ChartConfig#parser](#chartconfig/parser)






## `precision`

precision

### Parameters

* `a` **``** 



Returns  


## `receiveModel`

Update the whole chart model

### Parameters

* `model` **`Object`** 
* `model.chartProps` **`object`** 
* `model.metadata` **`object`** 





## `renderers`








## `RendererWrapper`

### RendererWrapper
Wrapper component that determines which type of chart to render, wrapping it
in Svg and telling it to draw.






## `round_to_precision`

round_to_precision
Round a number to N decimal places

### Parameters

* `num` **`number`** Number to be rounded
* `precision` **`number`** Desired precision
* `supress_thou_sep` **`boolean`** 



Returns `number` Rounded number


## `ScaleReset`

### Button to delete a scale, resetting it to default settings


| name | type | description |
| ---- | ---- | ----------- |
| `scale` | `object` | Current chart's scale object |
| `scaleId` | `string` | Identifier for the scale we want to delete |
| `onUpdate` | `function` | Callback to send reset scale back to parent |




## `series_label`

Render a tick (line) for charts that don't have labels. Used in bar grid






## `series_label`

Render a label to identify a series by its name. Used in chart grids






## `SessionStore`

### SessionStore
Flux store for the current session, ie session data that persits regardless
interaction. Includes locale-aware settings and are unrelated to the actual
rendering of the chart.






## `SvgRectLabel`

Render labels that are either automatically placed into a legend, or can be
dragged manually by the user






## `SvgText`

An Svg <text> element with experimental text wrapping support






## `transform_coords`

transform_coords

### Parameters

* `transformString` **``** 



Returns  


## `updateAllChartProps`

Update all chart props

### Parameters

* `Object` **``** `chartProps`





## `updateAndReparse`

Update a single chart prop and reparse the input

### Parameters

* `key` **`string`** The key used to identify this property
* `newProp` **`object`** The property's value





## `updateChartProp`

Update a single chart prop

### Parameters

* `key` **`string`** The key used to identify this property
* `newProp` **`object`** The property's value





## `updateInput`

Update a data input and reparse it

### Parameters

* `key` **`string`** The key used to identify this property
* `newInput` **`object`** The property's value





## `updateMetadata`

Update metadata

### Parameters

* `newMetadata` **`object`** The property's value





## `XY_chartSettings`

Series-specific settings for each column in data


| name | type | description |
| ---- | ---- | ----------- |
| `allowSecondaryAxis` | `boolean` | Should a secondary axis be allowed |
| `chartSettings` | `Array<object>` | Current settings for data series |
| `onUpdate` | `function` | Callback that handles new series settings |
| `onUpdateReparse` | `function` | Callback that handles new series settings, but which need to be sent back to `parse-xy` |
| `numColors` | `number` | Total number of possible colors |




## `xy_config`

### Configuration of an XY chart






## `xy_defaultProps`








## `XY_resetLabels`

When labels are dragged, this component appears and allows you to reset them


| name | type | description |
| ---- | ---- | ----------- |
| `annotations` | `object` | Current `chartProps._annotations` |
| `onUpdate` | `function` | Callback that passes a reset version of `chartProps._annotation` |




## `XY_yScaleSettings`

Y scale settings for XY charts. Used in both XY and chart grid, and most
likely for future charts as well






## `XYChart`

### Component that renders the XY chart area (not annotations)
See `React.PropTypes` declaration:



### Examples

```js
propTypes: {
  chartProps: PropTypes.object.isRequired,
  hasTitle: PropTypes.bool.isRequired,
  displayConfig: PropTypes.object.isRequired,
  styleConfig: PropTypes.object.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  dimensions: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number
  }).isRequired,
  scale: PropTypes.object.isRequired,
  chartAreaDimensions: PropTypes.object,
  metadata: PropTypes.object,
  labelYMax: PropTypes.number,
  maxTickWidth: PropTypes.object,
  axisTicks: PropTypes.array
},
```



## `XYEditor`

### Editor interface for a XY chart


| name | type | description |
| ---- | ---- | ----------- |
| `chartProps` | `object` | Properties used to draw this chart |
| `numSteps` | `number` | Allow the rendered component to interacted with and edited |




## `XYLabels`

### Component that renders the legend labels for an XY chart
See `React.PropTypes` declaration for properties:



### Examples

```js
propTypes: {
  chartProps: PropTypes.object.isRequired,
  hasTitle: PropTypes.bool.isRequired,
  displayConfig: PropTypes.object.isRequired,
  styleConfig: PropTypes.object.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  dimensions: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number
  }).isRequired,
  scale: PropTypes.object.isRequired,
  chartAreaDimensions: PropTypes.object,
  metadata: PropTypes.object,
  labelYMax: PropTypes.number,
  updateLabelYMax: PropTypes.func,
  maxTickWidth: PropTypes.object,
  axisTicks: PropTypes.array
},
```



## `XYRenderer`

### Component that renders XY (line, column, dot) charts


| name | type | description |
| ---- | ---- | ----------- |
| `editable` | `boolean` | Allow the rendered component to interacted with and edited |
| `displayConfig` | `object` | Parsed visual display configuration for chart grid |
| `chartProps` | `object` | Properties used to draw this chart |
| `metadata` | `object` | Title, data source, etc |




