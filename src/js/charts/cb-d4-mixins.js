var SessionStore = require("../stores/SessionStore");
var separators = SessionStore.get("separators");

/**
 * @name cb_d4_mixins
 */
mixins = {
	/**
	 * Render a label with a rect background to conceal what is underneath the text
	 * @name concealer_label
	 * @memberof cb_d4_mixins
	 * @static
	 */
	"concealer_label": {
		"name": "concealer_label",
		"feature": d4.feature('concealer-label', function(name) {

			// FIXME: We should not need to sniff this out.
			var dataInColumns = function(d) {
				if (d4.isDefined(d.y0)) {
					return true;
				}
				return d4.isContinuousScale(this.y);
			};

			var anchorText = function(d) {
				return dataInColumns.bind(this)(d) ? 'middle' : 'start';
			};

			var useDiscretePosition = function(dimension, d) {
				var axis = this[dimension];
				return axis(d[axis.$key]) + (axis.rangeBand() / 2);
			};

			var useContinuousPosition = function(dimension, d) {
				var axis = this[dimension];
				var offset = Math.abs(axis(d.y0) - axis(d.y0 + d.y)) / 2;

				// FIXME: Remove this hardcoding.
				var padding = 10;
				var val;
				if (dimension === 'x') {
					offset *= -1;
					padding *= -1;
				}
				if (d4.isDefined(d.y0)) {
					val = d.y0 + d.y;
					return (val <= 0 ? axis(d.y0) : axis(val)) + offset;
				} else {
					return (d[axis.$key] <= 0 ? axis(0) : axis(d[axis.$key])) - padding;
				}
			};

			return {
				accessors: {
					classes: 'concealer-label',

					key: d4.functor(d4.defaultKey),

					stagger: true,

					textAnchor: function(d) {
						return anchorText.bind(this)(d);
					},

					y: function(d) {
						return this.y(d[this.y.$key]) + 17 / 2;
					},
					x: function(d) {
						return this.x(d[this.x.$key]) + 6;
					},
					text: function(d,i) {
						return d;
					},
					dy: function(d) {
						return "1em";
					},
					format: function(d,i) {
						return d;
					}

				},

				render: function(scope, data, selection) {
					var afterBar = 6;
					var afterLabel = 6;

					var group = d4.appendOnce(selection, 'g.' + name);

					var labelGroups = group.selectAll('g')
						.data(data, d4.functor(scope.accessors.key).bind(this));

					labelGroups.enter().append('g')
						.attr('class', function(d, i) {
							return 'series' + i + ' ' + this.x.$key;
						}.bind(this));

					labelGroups.exit().remove();

					var text_group = labelGroups.selectAll('g.text-group')
						.data(function(d) {
							return d.values;
						}.bind(this));

					genter = text_group.enter().append("g")
						.attr("class", "text-group concealer-label")
						.attr("data-index", function(d,i)  {return i; });

					genter.append('rect');
					genter.append('text');

					var text = text_group.selectAll("text");
					var rect = text_group.selectAll("rect");

					var x_func = d4.functor(scope.accessors.x).bind(this);
					var y_func = d4.functor(scope.accessors.y).bind(this);
					var dy_func = d4.functor(scope.accessors.dy).bind(this);
					var text_func = d4.functor(scope.accessors.text).bind(this);
					var format_func = d4.functor(scope.accessors.format).bind(this);

					text_group
						.attr('transform', function(d,i){
							return "translate(" +[x_func(d,i), y_func(d,i)] + ")";
						});

					text
						.text(function(d,i){
							index = parseFloat(this.parentNode.getAttribute("data-index"));
							return format_func(text_func(d,index),index);
						})
						.attr('text-anchor', d4.functor(scope.accessors.textAnchor).bind(this))
						.attr('dy', d4.functor(scope.accessors.dy).bind(this));

					text_group.each(function(){
						var client_rect = this.getElementsByTagName("text")[0].getBoundingClientRect();
						d3.select(this.getElementsByTagName("rect")[0])
							.attr("width",client_rect.width + afterBar + afterLabel)
							.attr("height",client_rect.height)
							.attr("x", -afterBar)
							.attr("y",function(d,i){
								return (parseFloat(dy_func(d,i)) - 1) + "em";
							});
					});

					if (d4.functor(scope.accessors.stagger).bind(this)()) {

						// FIXME: This should be moved into a helper injected using DI.
						if (d4.isContinuousScale(this.y)) {
							group.selectAll('text').call(d4.helpers.staggerTextVertically, -1);
						} else {
							group.selectAll('text').call(d4.helpers.staggerTextHorizontally, 1);
						}
					}

					labelGroups.exit().remove();
					text_group.exit().remove();
					return text;
				}
			};
		})
	},
	/**
	 * Render a label to identify a series by its name. Used in chart grids
	 * @name series_label
	 * @memberof cb_d4_mixins
	 * @static
	 */
	"series_label": {
		"name": "series-label",
		"feature": d4.feature("label", function(name) {
			return {
				accessors: {
					x: function(d) {
						return this.x(0);
					}
				},
				render: function(scope, data, selection) {
					var text = d4.appendOnce(selection, "text.label")
						.data(data);

					text.text(function(d) { return d.label || d.name; })
						.attr('y',this.padding.top)
						.attr('x',d4.functor(scope.accessors.x).bind(this));
				}
			};
		})
	},
	/**
	 * Render a tick (line) for charts that don't have labels. Used in bar grid
	 * @name series_label
	 * @memberof cb_d4_mixins
	 * @static
	 */
	"no_label_tick": {
		"name": "no-label-tick",
		"feature": d4.feature("line", function(line) {
			return {
				accessors: {
					x1: 0,
					y: function(d) {
						return this.y(d[this.y.$key]) + (this.y.rangeBand() / 2);
					},
					x2: function(d) {
						return this.width;
					}
				},
				render: function(scope, data, selection) {
					var lineGroup = d4.appendOnce(selection, "g.tick.no-label-tick");

					var lines = lineGroup.selectAll('.no-label-tick')
						.data(data[0].values);

					lines.enter().append('line')
						.attr('class', 'no-label-tick')
						.attr('x1', d4.functor(scope.accessors.x1).bind(this))
						.attr('x2', d4.functor(scope.accessors.x2).bind(this))
						.attr('y2', d4.functor(scope.accessors.y).bind(this))
						.attr('y1', d4.functor(scope.accessors.y).bind(this));
				}
			};
		})
	},
	"x_axis_label": {
		"name": "x-axis-label",
		"feature": d4.feature("x-axis-label", function(name) {
			return {
				accessors: {
					classes: 'x-axis-label',

					key: d4.functor(d4.defaultKey),

					stagger: true,

					y: function(d) {
						return typeof d.ypos === 'undefined' ? 0 : d.ypos;
					},
					x: function(d) {
						return typeof d.xpos !== 'undefined' ?  d.xpos :
						typeof d.xval !== 'undefined' ? this.x(d.xval) :
						this.x(0);
					},
					text: function(d,i) {
						return d.text;
					},
					dy: function(d) {
						return typeof d.dy !== 'undefined' ? d.dy : "1em";
					},
					format: function(d,i) {
						return d;
					}

				},
				render: function(scope, data, selection) {
					var text = d4.appendOnce(selection, "text.xAxislabel")
						.data(data);

					text.text(d4.functor(scope.accessors.text).bind(this))
						.attr('y',d4.functor(scope.accessors.y).bind(this))
						.attr('x',d4.functor(scope.accessors.x).bind(this))
						.attr('dy',d4.functor(scope.accessors.dy).bind(this));
				}
			}
		})
	}
};



module.exports = mixins;
