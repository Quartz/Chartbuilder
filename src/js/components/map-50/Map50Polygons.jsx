
import React from 'react';
const Polygon = require('react-d3-map-core').Polygon;

const PolygonCollection = React.createClass({

  propTypes: {
    geoPath: React.PropTypes.func,
    polygonClass: React.PropTypes.string,
    onClick: React.PropTypes.func
  },
  render: function() {

    const geoPath = this.props.geoPath;
    const polygonClass = this.props.polygonClass;
    
    // override
    if(this.props.onClick) {
      onClick = this.props.onClick;
    }

    const polygons = this.props.data.map(function (polygonData, i) {

      let polygonType = (polygonData.type) ? polygonData.type+'_' : polygonType = '';
     
      return (
        <path
          id= {'polygon_'+ polygonType + i}
          key= {'polygon_' + i}
          d= {geoPath(polygonData.geometry)}
          className={polygonClass}
        />
      )
    });

    return (
      <g>{polygons}</g>
    );
  }
});

module.exports = PolygonCollection
