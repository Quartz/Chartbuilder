/*
 * Svg rect + text for legends
 * The rect is removed on drag
 */

var React = require("react");
var ReactDOM = require("react-dom");
var PureRenderMixin = require("react-addons-pure-render-mixin");
var isEqual = require("lodash/isEqual");
var assign = require("lodash/assign");
var PropTypes = React.PropTypes;
var d3 = require("d3");

/**
 * Render labels that are either automatically placed into a legend, or can be
 * dragged manually by the user
 * @instance
 * @memberof RendererWrapper
 */
var SvgRectLabel = React.createClass({

	propTypes: {
		text: PropTypes.string,
		settings: PropTypes.shape({
			dragged: PropTypes.bool,
			name: PropTypes.string,
			width: PropTypes.number,
			x: PropTypes.number,
			y: PropTypes.number,
			val_x: PropTypes.date,
			val_y: PropTypes.number
		}).isRequired,
		editable: PropTypes.bool.isRequired,
		dimensions: PropTypes.shape({
			width: PropTypes.number,
			height: PropTypes.number
		}).isRequired,
		prevNode: PropTypes.object,
		margin: PropTypes.object,
		scale: PropTypes.shape({
			x: PropTypes.object,
			y: PropTypes.object
		}),
		onPositionUpdate: PropTypes.func.isRequired
	},

	getDefaultProps: function() {
		return {
			settings: {
				x: 0,
				y: 0,
				val_x: null,
				val_y: null,
				dragged: false,
			}
		};
	},

	getInitialState: function() {
		return assign({
			dragging: false,
			origin: { x: 0, y: 0 },
			values: { x: 0, y: 0 }
		}, this._computeNewState(this.props));
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		var newProps = (!isEqual(this.props, nextProps));
		var newDrag = (this.state.dragging !== nextState.dragging);
		var hasValCoords = (nextProps.settings.val_x && nextProps.settings.val_y);

		return (newProps || newDrag || nextState.dragging || hasValCoords);
	},

	componentWillReceiveProps: function(nextProps) {
		var newState = this._computeNewState(nextProps);
		this.setState(newState);
	},

	_computeNewState: function(props) {
		var yScale = d3.scale.linear()
			.domain(props.scale.y.domain)
			.range(props.scale.y.range);

		var xScale = d3.scale.linear()
			.domain(props.scale.x.domain)
			.range(props.scale.x.range);

		var proportionalComputedPos = this._fromPropotionalPostion(props.settings, props);

		var valueComputedPos = this._fromValuePosition({
			x: props.settings.val_x,
			y: props.settings.val_y
		}, xScale, yScale);

		var elementPos = {
			x: valueComputedPos.x || proportionalComputedPos.x,
			y: valueComputedPos.y || proportionalComputedPos.y
		};

		return {
			proportionalComputed: proportionalComputedPos,
			valueComputed: valueComputedPos,
			element: elementPos,
			yScale: yScale,
			xScale: xScale
		}
	},

	_getSVGParent: function(el) {
		// we need the parent SVG to compute mouse position
		if (el.parentNode.tagName == "svg") {
			return el.parentNode;
		} else {
			return this._getSVGParent(el.parentNode);
		}
	},

	_getSVGMousePosition: function(e) {
		// get SVG mouse position accounting for the location of SVG
		// see https://stackoverflow.com/questions/10298658/mouse-position-inside-autoscaled-svg
		// and https://github.com/mbostock/d3/blob/master/src/event/mouse.js
		var svg = this.state.parentSVG;
		var rect = svg.getBoundingClientRect();
		var pos = {
			x: e.clientX - rect.left - svg.clientLeft,
			y: e.clientY - rect.top - svg.clientTop
		};
		return pos;
	},

	_onMouseDown: function(e) {
		// only respect left mouse button
		if (e.button !== 0) { return; }
		var mousePos = this._getSVGMousePosition(e);
		this._updatePosition({
			name: this.props.text,
			x: this.props.settings.x,
			y: this.props.settings.y,
			val_y: this.props.settings.val_y,
			val_x: this.props.settings.val_x,
			dragged: true
		});

		this.props.enableDrag(); // set dragged = true in parent app

		this.setState({
			dragging: true,
			origin: {
				x: mousePos.x,
				y:  mousePos.y
			},
			element: {
				x: this.state.proportionalComputed.x,
				y: this.state.proportionalComputed.y
			},
			values: {
				x: this.props.settings.val_x,
				y: this.props.settings.val_y
			},
			valueComputed : this._toValuePosition({x: this.props.settings.val_x, y:this.props.settings.val_y})
		});

		e.stopPropagation();
		e.preventDefault();
	},

	_onMouseMove: function(e) {
		if (!this.state.dragging) {
			return;
		}

		var mousePos = this._getSVGMousePosition(e);
		var deltaX = (mousePos.x - this.state.origin.x);
		var deltaY = (mousePos.y - this.state.origin.y);

		this.setState({
			dragging: true,
			element: {
				x: (this.state.valueComputed.x || this.state.proportionalComputed.x) + deltaX,
				y: (this.state.valueComputed.y || this.state.proportionalComputed.y) + deltaY
			},
			values: this._toValuePosition({
				x: this.state.valueComputed.x + deltaX,
				y: this.state.valueComputed.y + deltaY
			})
		});

		e.stopPropagation();
		e.preventDefault();
	},

	_onMouseUp: function(e) {
		this.setState({ dragging: false });
		this._refreshPosition();

		e.stopPropagation();
		e.preventDefault();
	},

	_refreshPosition: function(){
		if(this.props.settings.dragged) {
			var pos = this._toProportionalPosition(this.state.element);
			var vals = this._toValuePosition(this.state.element);
			this._updatePosition({
				name: this.props.text,
				x: pos.x,
				y: pos.y,
				val_y: vals.y,
				val_x: vals.x,
				dragged: true
			});
		}

	},

	_updatePosition: function(posObj) {
		this.props.onPositionUpdate(this.props.index, posObj);
	},

	_toProportionalPosition: function(pos,props){
		if (!props) {
			props = this.props;
		}
		return {
			x: pos.x / props.dimensions.width,
			y: pos.y / props.dimensions.height,
		};
	},

	_fromPropotionalPostion: function(pos,props){
		if (!props) {
			props = this.props;
		}
		return {
			x: pos.x * props.dimensions.width,
			y: pos.y * props.dimensions.height,
		};
	},

	_fromValuePosition: function(vals,xScale,yScale) {
		if(!xScale) {
			xScale = this.state.xScale;
		}

		if(!yScale) {
			yScale = this.state.yScale;
		}

		return {
			x: vals.x ? xScale(vals.x)-this.props.offset.x : 0,
			y: vals.y ? yScale(vals.y)-this.props.offset.y : 0
		};
	},

	_toValuePosition: function(pos,xScale,yScale) {
		if(!xScale) {
			xScale = this.state.xScale;
		}

		if(!yScale) {
			yScale = this.state.yScale;
		}


		return {
			x: pos.x !== 0 ? xScale.invert(pos.x+this.props.offset.x):null,
			y: pos.y !== 0 ? yScale.invert(pos.y+this.props.offset.y):null
		};
	},

	_setLegendPosition: function(nextProps, node) {
		// Update label positions
		var nodeBBox = node.getBBox();
		var prevNode = nextProps.prevNode;
		var x;
		var y;

		// only place label if it hasn't been dragged
		// compute based on previous node position, but only if it exists
		// and if current label is unchanged
		if (prevNode) {
			y = prevNode.y;
			x = ((prevNode.x * this.props.dimensions.width) +
					 prevNode.width + nextProps.labelConfig.xMargin);

			// If no `this.props.prevNode`, this is the first time the label is aware
			// of prevNode's values meaning it has mounted overlapped with it. We can
			// place based on `nextProps.prevNode`.
			if (!this.props.prevNode) {
				this._updatePosition({
					name: nextProps.text,
					x: x / nextProps.dimensions.width,
					y: y,
					val_y: null,
					val_x: null,
					dragged: nextProps.settings.dragged,
					width: nodeBBox.width
				});
				return;
			}

			// we have to create a new label row
			var isNewRow = (x + nodeBBox.width + this.props.offset.x > nextProps.dimensions.width);

			if (isNewRow) {
				x = 0,
				y = (prevNode.y * this.props.dimensions.height + this.props.labelConfig.rowHeight) /
						this.props.dimensions.height;
			}

			this._updatePosition({
				name: this.props.text,
				x: x / nextProps.dimensions.width,
				y: y,
				val_y: null,
				val_x: null,
				dragged: nextProps.settings.dragged,
				width: nodeBBox.width
			});
		} else if (!nextProps.prevNode && !nextProps.settings.dragged) {
				this._updatePosition({
					name: nextProps.text,
					x: 0,
					y: 0,
					val_y: null,
					val_x: null,
					dragged: false,
					width: nodeBBox.width
				});
		}
	},

	componentDidUpdate: function(prevProps) {
		// when label updates, check if its width is different. if so, update it
		var isLabelTextNew = (this.props.text !== prevProps.text);
		var isReset = (prevProps.settings.dragged === true && this.props.settings.dragged === false);
		var newConfig = !isEqual(this.props.labelConfig, prevProps.labelConfig);

		if (isLabelTextNew || isReset || newConfig) {
			var node = ReactDOM.findDOMNode(this);
			var nodeBBox = node.getBBox();
			var prevNode = this.props.prevNode;
			this._updatePosition({
				name: this.props.text,
				x: this.props.settings.x,
				y: this.props.settings.y,
				val_y: this.props.settings.val_y,
				val_x: this.props.settings.val_x,
				dragged: this.props.settings.dragged,
				width: nodeBBox.width
			});
		}

	},

	componentDidMount: function() {
		// Set default position of left-most label
		var node = ReactDOM.findDOMNode(this);
		var nodeBBox = node.getBBox();
		var parentSVG = this._getSVGParent(node);
		if (!node.previousSibling) {
			this._updatePosition({
				name: this.props.text,
				x: 0,
				y: 0,
				val_y: null,
				val_x: null,
				dragged: false,
				width: nodeBBox.width
			});
		} else if (this.props.prevNode) {
			var x = ((this.props.prevNode.x * this.props.dimensions.width) +
							 this.props.prevNode.width +
							 this.props.labelConfig.xMargin) / this.props.dimensions.width;

			this._updatePosition({
				name: this.props.text,
				x: x,
				y: 0,
				val_y: null,
				val_x: null,
				dragged: false,
				width: nodeBBox.width
			});
		}
		this.setState({ parentSVG: parentSVG });
	},

	_addDragEvents: function() {
		document.addEventListener("mousemove", this._onMouseMove);
		document.addEventListener("mouseup", this._onMouseUp);
	},

	_removeDragEvents: function() {
		document.removeEventListener("mousemove", this._onMouseMove);
		document.removeEventListener("mouseup", this._onMouseUp);
	},

	componentWillUpdate: function(nextProps, nextState) {
		if (!nextProps.settings.dragged) {
			this._setLegendPosition(nextProps, ReactDOM.findDOMNode(this));
		}

		if (nextProps.settings.dragged === false) {
			return;
		} else if (nextProps.editable === true) {
			// only allow dragging if we are in editable mode
			if (nextState.dragging && !this.state.dragging) {
				this._addDragEvents();
			} else if (!nextState.dragging && this.state.dragging) {
				this._removeDragEvents();
			}
		}
	},

	render: function() {

		var colorClass = "color-index-" + this.props.colorIndex.toString();
		var translate;
		// if we are dragging, get position from local state
		if (this.state.dragging) {
			translate = [this.state.element.x, this.state.element.y ];
		// if not dragging, position should be passed down from parent
		} else if (this.props.settings.dragged) {
			translate = [ this.state.valueComputed.x || this.state.proportionalComputed.x, this.state.valueComputed.y ];
		} else {
			translate = [ this.state.proportionalComputed.x, this.state.proportionalComputed.y ];
		}

		// only add rect if we haven't dragged
		var rect = null;
		var textOffsetX = null;
		var textOffsetY = null;
		var dy = "0.35em";

		if (!this.props.settings.dragged) {
			rect = <rect
				className={["svg-label-rect", colorClass].join(" ")}
				width={this.props.labelConfig.rectSize}
				height={this.props.labelConfig.rectSize}
				y={this.props.labelConfig.rectSize / 2 * -1}
			/>
			textOffsetX = this.props.labelConfig.rectSize + this.props.labelConfig.textMargin;
			textOffsetY = 0;
		} else {
			textXOffset = 0;
			textOffsetY = 0;
			dy = 0
		}

		var ch_size = 9
		var crosshair = null

		if(this.state.dragging) {
			crosshair = <g className="crosshair">
				<line
					x1={ch_size/-2}
					x2={ch_size/2}
					>
				</line>
				<line
					y1={ch_size/-2}
					y2={ch_size/2}
					>
				</line>
			</g>
		}

		var handleMouseDown = null;
		var draggableClass = "";
		if (this.props.editable) {
			handleMouseDown = this._onMouseDown;
			draggableClass = "draggable";
		}

		return (
			<g
				className="svg-label-g"
				transform={"translate(" + translate + ")"}
			>
				{rect}
				<text
					className={["svg-label-text", colorClass, draggableClass].join(" ")}
					x={textOffsetX}
					y={textOffsetY}
					dy={dy}
					draggable={this.props.editable}
					onMouseDown={handleMouseDown}
				>
					{this.props.text}
				</text>
				{crosshair}
			</g>
		);
	}

});

module.exports = SvgRectLabel;
