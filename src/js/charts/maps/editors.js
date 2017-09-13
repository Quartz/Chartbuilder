/**
 * @name editors
 */

// Editor components for chart types, as well as their mobile override editor interfaces
module.exports = {
  mapchoro: {
    Editor: require("../../components/map-choro/MapchoroEditor.jsx"),
    MobileOverrides: require("../../components/map-choro/MapchoroMobile.jsx")
  },
  mapcartogram: {
    Editor: require("../../components/map-cartogram/MapCartogramEditor.jsx"),
    MobileOverrides: require("../../components/map-cartogram/MapCartogramMobile.jsx")
  },
  mapbubble: {
    Editor: require("../../components/map-bubble/MapBubbleEditor.jsx"),
    MobileOverrides: require("../../components/map-bubble/MapBubbleMobile.jsx")
  }
};
