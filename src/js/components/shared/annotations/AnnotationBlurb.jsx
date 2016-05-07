var React = require('react');
var ReactDom = require("react-dom");

var swoopyArrow = require("../swoopyArrows.js").swoopy;
var merge = require("lodash/merge");

var AnnotationBlurb = React.createClass({

	propTypes: {
		key: React.PropTypes.string,
		index: React.PropTypes.number.isRequired,
		tout: React.PropTypes.string,
		copy: React.PropTypes.string,
		pos: React.PropTypes.object,
		arrow: React.PropTypes.object,
		onBlurbUpdate: React.PropTypes.func,
		dimensions: React.PropTypes.object,
		margin: React.PropTypes.object,
		offset: React.PropTypes.object
	},

	getDefaultProps: function() {
		return {
			index: null,
			tout: "",
			copy: "",
			pos: {x: 0, y: 0, point: {x: 0, y: 0}, val:{}},
			x: function(d){return d},
			y: function(d){return d},
			arrow: {
				start: {point:{x: 10, y: 50}, val:{}, pct: {x:0, y:0}},
				end: {point: {x: 20, y: 100}, val:{}}, pct: {x:0, y:0},
				snapTo: "textEnd",
				clockwise: true
			}
		};
	},

	getInitialState: function() {
		var proPPos = this._toProportionalPosition(this.props.pos)
		var arrow = this.props.arrow;
		arrow.end.point = this._fromProportionalPosition(this.props.arrow.end.pct,null,proPPos)
		arrow.start.point = this._fromProportionalPosition(this.props.arrow.start.pct,null,proPPos)
		this.props.arrow = arrow;

		return this.stateFromProps();
	},

	stateFromProps: function(props) {
		if(!props) {
			props = this.props
		}

		return {
			dragging: false,
			clickOrigin: {x: 0, y: 0},
			tout: this.props.tout,
			target: null,
			copy: this.props.copy,
			pos: this.props.pos,
			arrow: this.props.arrow,
			updatingFromInline: false
		}
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		var newProps = (this.props !== nextProps);
		var newDrag = (this.state.dragging !== nextState.dragging);

		return !this.state.updatingFromInline && (newProps || newDrag || nextState.dragging);
	},

	componentDidMount: function() {
		this._placeArrow();
		this._addDragEvents();
		this.props.arrow = this._arrowPointFromPct();
	},

	componentDidUpdate: function(prevProps, prevState) {
		this.props.arrow = this._arrowPointFromPct();
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({
			arrow: this._arrowPointFromPct(nextProps)
		})

		this._placeArrow(nextProps);
	},

	componentWillUpdate: function(nextProps, nextState) {
		this._placeArrow(nextProps);
		if(!this.state.updatingFromInline && !this.state.dragging) {
			this.setState({
				tout: nextProps.tout,
				copy: nextProps.copy
			})
		}
	},

	_arrowPointFromPct: function(props) {
		if(!props) {
			props = this.props;
		}
		var proPPos = this._toProportionalPosition(props.pos)
		var arrow = props.arrow;
		arrow.end.point = this._fromProportionalPosition(props.arrow.end.pct,null,proPPos)
		arrow.start.point = this._fromProportionalPosition(props.arrow.start.pct,null,proPPos)
		return arrow
	},

	_getMousePosition: function(e) {
		// get SVG mouse position accounting for the location of parent
		// see https://stackoverflow.com/questions/10298658/mouse-position-inside-autoscaled-svg
		// and https://github.com/mbostock/d3/blob/master/src/event/mouse.js
		var parent = this.state.parent;
		var rect = parent.getBoundingClientRect();
		var pos = {
			x: e.clientX - rect.left - parent.clientLeft,
			y: e.clientY - rect.top - parent.clientTop
		};
		return pos;
	},

	_handleMouseDownForDraggableElements: function(e, target) {
		if(e.button !== 0) { return; }

		this.setState({
			dragging: true,
			target: target,
			clickOrigin: this._getMousePosition(e)
		})

		e.stopPropagation();
		e.preventDefault();
	},

	_handleInterfaceMouseDown: function(e) {
		this._handleMouseDownForDraggableElements(e, "pos")
	},

	_handleArrowEndMouseDown: function(e) {
		this._handleMouseDownForDraggableElements(e, "arrowEnd")
	},

	_handleArrowStartMouseDown: function(e) {
		this._handleMouseDownForDraggableElements(e, "arrowStart")
	},

	_handleMouseMove: function(e) {
		if(!this.state.dragging) { return; }
		var mousePos = this._getMousePosition(e);
		var delta = {
			x: (mousePos.x - this.state.clickOrigin.x),
			y: (mousePos.y - this.state.clickOrigin.y)
		}

		var newPos;
		var stateUpdate = {};
		switch(this.state.target) {
			case "pos":
				propPos = this.props.pos
				stateUpdate = {
					pos: {
						x: propPos.x + delta.x,
						y: propPos.y + delta.y
					},
					arrow: merge({}, this.state.arrow, {
						end: {
							point: {
								x: this.props.arrow.end.point.x - delta.x,
								y: this.props.arrow.end.point.y - delta.y
							}
						}
					})
				}


				this.setState(stateUpdate)
				break

			case "arrowEnd":
				propPos = this.props.arrow.end.point
				newPos = {
					point: {
						x: propPos.x + delta.x,
						y: propPos.y + delta.y,
					}
				}
				newPos.pct = this._toProportionalPosition(newPos.point,null,this.props.pos)

				this.setState({
					arrow: merge({}, this.state.arrow, {end: newPos})
				})
				break

			case "arrowStart":
				propPos = this.props.arrow.start.point;
				newPos = {
					point: {
						x: propPos.x + delta.x,
						y: propPos.y + delta.y,
					}
				}

				newPos.pct = this._toProportionalPosition(newPos,null,this.props.pos)
				this.setState({
					arrow: merge({}, this.state.arrow, {start: newPos})
				})

				break

			default:
		}

		e.stopPropagation();
		e.preventDefault();

	},

	_handleMouseUp: function(e) {
		var pos;
		var target = this.state.target;

		this.setState({
			dragging: false,
			target: null
		})

		switch(target) {
			case "pos":
				pos = this.state.pos;
				break
			case "arrowEnd":
				pos = this.state.arrow.end.pct
				break
			case "arrowStart":
				pos = this.state.arrow.start.pct
				break
			default:
		}

		if(target == "pos") {
			this.props.onBlurbUpdate(this.props.index, this.state.arrow.start.pct, "arrowStart")
		}
		this.props.onBlurbUpdate(this.props.index, pos, target);


		e.stopPropagation();
		e.preventDefault();
	},

	_addDragEvents: function() {
		document.addEventListener("mousemove", this._handleMouseMove);
		document.addEventListener("mouseup", this._handleMouseUp);
	},

	_handleToutKeyUp: function(e) {
		var newText = ReactDom.findDOMNode(e.target).textContent
		this._updateText("tout", newText)
	},

	_handleCopyKeyUp: function(e) {

		var newText = ReactDom.findDOMNode(e.target).textContent
		this._updateText("copy", newText)
	},

	_handleArrowDoubleClick: function(d) {
		this.props.onBlurbUpdate(this.props.index, !this.state.arrow.clockwise, "arrowClockwise");
	},

	_handleSpanFocus: function(e) {
		this.setState({
			updatingFromInline: true
		})
	},

	_handleSpanBlur: function(e) {
		this.setState({
			updatingFromInline: false
		})
	},

	_updateText: function(key, newText) {
		this.props.onBlurbUpdate(this.props.index, newText, key);
	},

	_locationToPoint: function(loc,node) {
		var point;

		if(!node) {
			node = ReactDom.findDOMNode(this);
		}
		var nodeBB = node.getBoundingClientRect();
		
		var endMark = node.querySelector("span.end-mark");
		var endMarkBB = endMark.getBoundingClientRect();


		
	
		if(this.props.arrow.snapTo == "textEnd") {
			point = {
				x: endMarkBB.left - this.state.pos.x,
				y: endMarkBB.top - nodeBB.top + 3
			}
		}

		return point
	},

	_placeArrow: function(props){
		if(!props) {
			props = this.props;
		}

		var arrow = this.state.arrow;
		var node = ReactDom.findDOMNode(this)

		

		arrow.start = {
			point: this._locationToPoint("textEnd", node)
		}

		arrow.start.pct = this._toProportionalPosition(arrow.start.point, null, props.pos)

		this.setState({
			node: node,
			parent: node.parentNode,
			endMarkBB: endMarkBB,
			arrow: arrow
		})

	},

	_toProportionalPosition: function(pos,props,origin){
		// takes a pixel position and converts it to a proportional one

		if (!props) {
			props = this.props;
		}

		if(!origin) {
			origin = {x: 0, y: 0}
		}
		return {
			x: (pos.x + origin.x) / props.dimensions.width,
			y: (pos.y + origin.y) / props.dimensions.height,
		};
	},

	_fromProportionalPosition: function(pos,props,origin){
		// takes a proportional position and converts it to a pixel location
		if (!props) {
			props = this.props;
		}

		if(!origin) {
			origin = {x: 0, y: 0}
		}

		return {
			x: (pos.x - origin.x) * props.dimensions.width,
			y: (pos.y - origin.y) * props.dimensions.height,
		};
	},

	_toValuePosition: function(pos, x, y) {
		if(!x) {
			x = this.props.x;
		}

		if(!y) {
			y = this.props.y;
		}


		return {
			x: pos.x !== 0 ? x.invert(pos.x+this.props.offset.x) : null,
			y: pos.y !== 0 ? y.invert(pos.y+this.props.offset.y) : null
		};
	},

	_fromValuePosition: function(vals, x, y) {
		if(!x) {
			x = this.props.x;
		}

		if(!y) {
			y = this.props.y;
		}

		return {
			x: vals.x ? x(vals.x)-this.props.offset.x : 0,
			y: vals.y ? y(vals.y)-this.props.offset.y : 0
		};
	},

	render: function() {

		var style = {
			position: "absolute",
			left: this.props.x(this.state.dragging ? this.state.pos.x : this.props.pos.x) ,
			top:  this.props.y(this.state.dragging ? this.state.pos.y : this.props.pos.y) 
		};
		var swoopy = swoopyArrow()
		  .angle(Math.PI/3)
		  .clockwise((this.state.arrow.start.x < this.state.arrow.end.x) ? true : false)
		  // .clockwise(this.state.arrow.clockwise)
		  .x(function(d) { return d.x; })
		  .y(function(d) { return d.y; });

		  var arrowPos = {};

		  if(this.state.dragging) {	
		  	arrowPos.start = this.state.arrow.start.point
		  	arrowPos.end = this.state.arrow.end.point
		  }
		  else {
		  	arrowPos.start = this.props.arrow.start.point || 0
		  	arrowPos.end = this.props.arrow.end.point
		  }

		  var editableSpanProps = {
		  	contentEditable: "true",
		  	onBlur: this._handleSpanBlur,
		  	onFocus: this._handleSpanFocus
		  }

		return (
			<div
			 className="blurb"
			 style={style}
			 data-mode={this.state.mode}
			>
				<div
					className="interface"
					onMouseDown={this._handleInterfaceMouseDown}
				 />
				 <div
				 	className="content"
				 >
				 	<p>
				 		<span
				 			{...editableSpanProps}
				 			onKeyUp={this._handleToutKeyUp}
				 		>
				 			{this.state.tout.trim()}
				 		</span>
				 		<span> </span>
				 		<span
				 			{...editableSpanProps}
				 			onKeyUp={this._handleCopyKeyUp}
				 		>
				 			{this.state.copy.trim()}
				 		</span>
				 		<span className="end-mark" />
				 	</p>

				 </div>
				 <svg>
				 	<circle
				 		cx={arrowPos.start.x}
				 		cy={arrowPos.start.y}
				 		r="10px"
				 		onMouseDown={this._handleArrowStartMouseDown}
				 		onDoubleClick={this._handleArrowDoubleClick}
				 	/>

				 	<circle
				 		cx={arrowPos.end.x}
				 		cy={arrowPos.end.y}
				 		r="10px"
				 		onMouseDown={this._handleArrowEndMouseDown}
				 		onDoubleClick={this._handleArrowDoubleClick}
				 	/>
				 	<path
				 		markerEnd="url(#arrowhead)"
				 		d={swoopy([arrowPos.start, arrowPos.end])}
				 	/>
				 </svg>

			</div>
		);
	}

});

module.exports = AnnotationBlurb;