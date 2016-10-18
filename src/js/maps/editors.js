/**
 * @name editors
 */

// Editor components for chart types, as well as their mobile override editor interfaces
module.exports = {
  map50: {
    Editor: require("../components/map-50/Map50Editor.jsx"),
    MobileOverrides: require("../components/map-50/Map50Mobile.jsx")
  },
  mapcartogram: {
    Editor: require("../components/map-cartogram/MapCartogramEditor.jsx"),
    MobileOverrides: require("../components/map-cartogram/MapCartogramMobile.jsx")
  },
  mapbubble: {
    Editor: require("../components/map-bubble/MapBubbleEditor.jsx"),
    MobileOverrides: require("../components/map-bubble/MapBubbleMobile.jsx")
  }
};
