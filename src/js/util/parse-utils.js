var tabRegex = /[^\t]/gi;
var datePattern = /^(date|time|year)$/i;

function escapeRegExp(str) {
	return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// Detect delimiter of input
// algorithm: if numtabs >= numrows then TSV, else CSV
function detectDelimiter(input) {
	var numRows = input.split(/\r\n|\r|\n/).length;
	var numTabs = input.replace(tabRegex, "").length;

	if (numTabs >= numRows - 1) {
		return "\t";
	} else {
		return ",";
	}
}

function matchDatePattern(str) {
	return datePattern.test(str);
}

module.exports = {
	escapeRegExp: escapeRegExp,
	detectDelimiter: detectDelimiter,
	matchDatePattern: matchDatePattern
};
