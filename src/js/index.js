if (process.env.NODE_ENV == "dev") {
	// Include React as a global variable if we are in dev environment.
	// This makes the app useable with React dev tools
	global.React = require("react");
}

var React = require("react");
var ReactDOM = require("react-dom");
var ChartbuilderLocalStorageAPI = require("./util/ChartbuilderLocalStorageAPI");
var Chartbuilder = require("./components/Chartbuilder.jsx");
var container = document.querySelector(".chartbuilder-container");

document.addEventListener("DOMContentLoaded", function() {
	document.cookie = "authed=yes";
	// Initialize data from localStorage
	ChartbuilderLocalStorageAPI.defaultChart();
	// Render parent chartbuilder component
	ReactDOM.render(
		<Chartbuilder
			showMobilePreview={false}
			enableJSONExport={true}
		/>,
	container );

});
