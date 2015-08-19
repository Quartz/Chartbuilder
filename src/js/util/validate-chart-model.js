/**
 * Test whether a string is a valid Chartbuilder model
 * @param {string} modelStr - unparsed string of chart model JSON
 * @returns {object or null} parsed - parsed object
 * @static
 * @memberof helper
*/
function validate_chart_model(modelStr) {
	var parsed;

	try {
		parsed = JSON.parse(modelStr);
	} catch (e) {
		throw new TypeError("Chart model is not valid JSON");
	}

	var isValidChartModel = (parsed.hasOwnProperty("chartProps") && parsed.hasOwnProperty("metadata"));
	if (isValidChartModel) {
		return parsed;
	} else {
		throw new TypeError("Not a valid Chartbuilder model");
	}

}

module.exports = validate_chart_model;
