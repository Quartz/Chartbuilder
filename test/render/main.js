global.React = require("react");
var container = document.querySelector(".chartbuilder-container");
var TestPage = require("./TestPage.jsx");

document.addEventListener("DOMContentLoaded", function() {
	// Initialize data from localStorage
	React.render(
		<TestPage />,
	container);

	// Render parent chartbuilder component
});
