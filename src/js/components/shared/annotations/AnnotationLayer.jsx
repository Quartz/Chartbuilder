var React = require('react');

var AnnotationBlurb = require("./AnnotationBlurb.jsx")

var clone = require("lodash/clone");

var AnnotationLayer = React.createClass({

	propTypes: {
		blurbs: React.PropTypes.array
	},

	getDefaultProps: function() {
		return {
			blurbs: [],
			defaultBlurb: {
				tout: "New Blurb",
				copy: "Lorem ipsume dolor sit amet.",
				pos: {x: 100, y: 100}
			}
		};
	},


	_handleBlurbUpdate: function(i,prop,key) {
		this.props.blurbs[i][key] = prop;

		//CHANGE
		this.forceUpdate();
	},

	_addBlurb: function() {
		var blurb = clone(this.props.defaultBlurb);
		
		blurb.index = this.props.blurbs.length
		
		this.props.blurbs.push(this.props.defaultBlurb)	
	},

	render: function() {
		//CHANGE
		this._addBlurb()

		var that = this;
		var blurbs = this.props.blurbs.map(function(d,i) {
			// arrow={{start: d.arrowStart, end: d.arrowEnd}}

			return (<AnnotationBlurb 
					key={"blurb" + i}
					index={d.index}
					tout={d.tout}
					copy={d.copy}
					pos={d.pos}
					onBlurbUpdate={that._handleBlurbUpdate}
				/>)
		})	
		return (
			<div>
				{blurbs}
				<svg>
					<defs>
						<marker id="arrowhead" orient="auto" viewBox="0 0 5.108 8.18" markerHeight="8.18" markerWidth="5.108" refY="4.09" refX="5"><polygon points="0.745,8.05 0.07,7.312 3.71,3.986 0.127,0.599 0.815,-0.129 5.179,3.999" fill="#4C4C4C"></polygon></marker>
					</defs>
				</svg>
			</div>
		);
	}

});

module.exports = AnnotationLayer;