var React = require('react');
var ReactDom = require("react-dom");

var merge = require("lodash/merge");


var AnnotationMarker = React.createClass({

	propTypes: {
		index: React.PropTypes.number.isRequired,
		arrow: React.PropTypes.object,
		onMarkerUpdate: React.PropTypes.func,
		dimensions: React.PropTypes.object,
		margin: React.PropTypes.object,
		offset: React.PropTypes.object,
		editable: React.PropTypes.bool
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		var newProps = (this.props !== nextProps);
		var newDrag = (this.state.dragging !== nextState.dragging);

		return !this.state.updatingFromInline && (newProps || newDrag || nextState.dragging);
	},

	componentDidMount: function() {
		this._placeArrow();
		this.props.arrow = this._arrowPointFromPct();
	},

	componentDidUpdate: function(prevProps, prevState) {
		this.props.arrow = this._arrowPointFromPct();
		
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({
			arrow: this._arrowPointFromPct(nextProps)
		})	

	},

	componentWillUpdate: function(nextProps, nextState) {

		if(!this.state.dragging) {
			this._placeArrow();
		}

		if(nextProps.editable === true) {
			if(nextState.dragging && !this.state.dragging) {
				this._addDragEvents();
			} else if (!nextState.dragging && this.state.dragging) {
				this._removeDragEvents();
			}	
		}
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
		this._handleMouseDownForDraggableElements(e, "arrowEnd")
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

		e.stopPropagation();
		e.preventDefault();

	},

	_handleMouseUp: function(e) {
		var pos = this.state.arrow.end.pct;
		var target = "arrowEnd";

		this.setState({
			dragging: false,
			target: null
		})

		this.props.onMarkerUpdate(this.props.index, pos, target);

		e.stopPropagation();
		e.preventDefault();
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

	_addDragEvents: function() {
		document.addEventListener("mousemove", this._handleMouseMove);
		document.addEventListener("mouseup", this._handleMouseUp);
	},

	_removeDragEvents: function() {
		document.removeEventListener("mousemove", this._handleMouseMove);
		document.removeEventListener("mouseup", this._handleMouseUp);
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
			target: null,
			arrow: this.props.arrow,
			updatingFromInline: false
		}
	},

	_placeArrow: function(){

		var node = ReactDom.findDOMNode(this);
		var parent = node.parentNode;

		var arrow = this.state.arrow;


		arrow.start.pct = this._toProportionalPosition(arrow.start.point, null, this.props.pos)

		this.setState({
			arrow: arrow,
			parent: parent
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
			x: (pos.x) / props.dimensions.width,
			y: (pos.y) / props.dimensions.height,
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
			x: (pos.x) * props.dimensions.width,
			y: (pos.y) * props.dimensions.height,
		};
	},

	render: function() {
		var style = {
			position: "absolute",
			left: this.props.x(this.state.dragging ? this.state.arrow.end.point.x : this.props.arrow.end.point.x),
			top:  this.props.y(this.state.dragging ? this.state.arrow.end.point.y : this.props.arrow.end.point.y) 
		};

		return (
			<div className="annotation-marker"
			style={style}
			onMouseDown={this._handleInterfaceMouseDown}
			>
				<p>
					{this.props.index + 1}
				</p>
			</div>
		);
	}

});

module.exports = AnnotationMarker;