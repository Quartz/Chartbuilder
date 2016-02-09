global.React = require("react");
var ReactDOM = require("react-dom")

var container = document.querySelector(".chartbuilder-container");
var TestPage = require("./TestPage.jsx");

document.addEventListener("DOMContentLoaded", function() {
	// Initialize data from localStorage
	ReactDOM.render(
		<TestPage />,
	container);
});
