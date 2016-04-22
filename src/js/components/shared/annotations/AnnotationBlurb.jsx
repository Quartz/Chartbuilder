var React = require('react');
var ReactDom = require("react-dom");

var AnnotationBlurb = React.createClass({

	propTypes: {
		key: React.PropTypes.string,
		index: React.PropTypes.number,
		tout: React.PropTypes.string,
		copy: React.PropTypes.string,
		pos: React.PropTypes.object,
		arrow: React.PropTypes.object,
		onBlurbUpdate: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			tout: "",
			copy: "",
			pos: {x: 0, y: 0},
			x: function(d){return d + "px"},
			y: function(d){return d + "px"},
			arrow: {
				start: {x: 10, y: 100},
				end: {x: 10, y: 200},
				snapTo: "textEnd"
			}
		};
	},

	getInitialState: function() {
		return {
			dragging: false,
			mode: "drag",
			clickOrigin: {x: 0, y: 0},
			elementPos: this.props.pos,
			arrow: this.props.arrow
		};
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		var newProps = (this.props !== nextProps);
		var newDrag = (this.state.dragging !== nextState.dragging);

		return (newProps || newDrag || nextState.dragging);
	},

	componentDidMount: function() {
		var node = ReactDom.findDOMNode(this);
		var endMark = node.querySelector("span.end-mark")

		var nodeBB = node.getBoundingClientRect()
		var endMarkBB = endMark.getBoundingClientRect()
		var parent = node.parentNode;

		var arrow = this.state.arrow;

		if(this.props.snapTo == "textEnd") {
			arrow.start = {
				x: endMarkBB.left - this.state.elementPos.x,
				y: endMarkBB.top - nodeBB.top + 3
			}
		}
		

		this.setState({
			node: node,
			parent: parent,
			endMarkBB: endMarkBB,
			arrow: arrow
		})


		if(this.state.mode == "drag") {
			this._addDragEvents();
		}

		this.forceUpdate();
	},

	_updatePostition: function(pos) {
		this.props.onPositionUpdate(this.props.index, pos)
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

		if(this.state.mode == "drag") {

			this.setState({
				dragging: true,
				target: target,
				clickOrigin: this._getMousePosition(e)
			})

			e.stopPropagation();
			e.preventDefault();
		}
	},

	_handleInterfaceMouseDown: function(e) {
		this._handleMouseDownForDraggableElements(e, "blurb")
	},

	_handleArrowEndMouseDown: function(e) {
		this._handleMouseDownForDraggableElements(e, "arrowEnd")
	},

	_handleArrowStartMouseDown: function(e) {
		this._handleMouseDownForDraggableElements(e, "arrowStart")
	},

	_handleMouseMove: function(e) {
		if(!this.state.dragging) { return; }

		var mousePos = this._getMousePosition(e)
		var delta = {
			x: (mousePos.x - this.state.origin.x),
			y: (mousePos.y - this.state.origin.y)
		}

		var newPos;
		var stateUpdate = {};

		switch(this.state.target) {
			case "blurb":
				propPos = this.props.pos
				this.setState({
					pos: {
						x: propPos.x + delta.x,
						y: propPos.y + delta.y
					}
				})
				break

			case "arrowEnd":
				propPos = this.props.arrow.end
				this.setState({
					arrow: {
						end: {
							x: propPos.x + delta.x,
							y: propPos.y + delta.y
						}
					}
				})
				break

			case "arrowStart":
				propPos = this.props.arrow.start
				this.setState({
					arrow: {
						start: {
							x: propPos.x + delta.x,
							y: propPos.y + delta.y
						}
					}
				})

				break

			default:
		}

		e.stopPropagation();
		e.preventDefault();

	},

	_handleMouseUp: function(e) {
		var pos;

		this.setState({
			dragging: false,
			target: null
		})

		switch(this.state.target) {
			case "blurb":
				pos = this.state.pos;
				break
			case "arrowEnd":
				pos = this.state.arrow.end
				break
			case "arrowStart":
				pos = this.state.arrow.start
				break
			default:

		}

		this.props.onPositionUpdate(this.props.index, pos, target);

		e.stopPropagation();
		e.preventDefault();
	},

	_addDragEvents: function() {
		document.addEventListener("mousemove", this._handleMouseMove);
		document.addEventListener("mouseup", this._handleMouseUp);
	},

	_handleToutKeyDown: function(e) {
		var newText = ReactDom.findDOMNode(e.target).textContent
		this._updateText("tout", newText)
	},

	_handleSpanKeyDown: function(e) {
		var newText = ReactDom.findDOMNode(e.target).textContent
		this._updateText("copy", newText)
	},

	_updateText: function(key, newText) {
		this.state[key] = newText;
		this.forceUpdate()
	},

	render: function() {

		var style = {
			position: "absolute",
			left: this.props.x(this.state.dragging ? this.state.elementPos.x : this.props.pos.x) ,
			top:  this.props.y(this.state.dragging ? this.state.elementPos.y : this.props.pos.y) 
		};


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
				 			contentEditable="true"
				 			onKeyDown={this._handleToutKeyDown}
				 		>
				 			{this.state.tout}
				 		</span>
				 		<span
				 			contentEditable="true"
				 			onKeyDown={this._handleCopyKeyDown}
				 		>
				 			{(this.state.tout ? " " : "") + this.state.copy}
				 		</span>
				 		<span className="end-mark" />
				 	</p>

				 </div>
				 <svg>
				 	<circle
				 		cx={this.state.arrow.start.x}
				 		cy={this.state.arrow.start.y}
				 		r="10px"
				 		onMouseDown={this._handleArrowStartMouseDown}
				 	/>

				 	<circle
				 		cx={this.state.arrow.end.x}
				 		cy={this.state.arrow.end.y}
				 		r="10px"
				 		onMouseDown={this._handleArrowEndMouseDown}
				 	/>
				 	<path
				 		markerEnd="url(#arrowhead)"
				 		d={ "M" + [this.state.arrowStart.x, this.state.arrowStart.y].join(",") + "L" + [this.state.arrowEnd.x, this.state.arrowEnd.y].join(",")}
				 	/>
				 </svg>

			</div>
		);
	}

});

module.exports = AnnotationBlurb;