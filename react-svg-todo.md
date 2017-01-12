To-do list specific to the `react-svg` branch, where we are switching rendering
from d4 to react.

- [ ] Overall
	- [X] Comment new stuff
	- [ ] General cleanup
	- [X] Delete d4 stuff
	- [X] export working?
	- [ ] default to XY chart
	- [X] weird things happen when i make one chart, then paste in data for another without refreshing
- [x] XY chart
	- [x] Render types and combinations of types
	- [x] Number axis
	- [x] Axes with formatting and prefix/suffix
	- [X] Make sure line groups are on top of _all_ axis groups
	- [X] Paste of data doesn't update
	- [X] If there's only one series collapse the space needed for the legend
	- [\] If there's only one seires make changes to the series name change the title
		- also a good idea, but not currently in CB and more of an editor-side issue
			so i will delay this one
- [X] Chart grid bars
	- [X] Render bars
	- [X] Render y axis
	- [X] Spacing
	- [\] Multi-series chart grids with Names axis should default to bars
		- NS: this is current chartbuilder behavior, we currently don't discriminate
		btwn a paste and small data edit so we respect the user's type decision, so
		if they say "line" then paste in new data it will go with line. would have
		to change how to detect new data and parse it
- [X] Chart grid XY
	- [X] Render lines/dots/cols
	- [X] Render y axis
	- [X] Render x axis
	- [X] Handle case of dates in bar chart grid
	- [X] Sizing/spacing/style
	- [\] better handling of a single series
		- TODO later

