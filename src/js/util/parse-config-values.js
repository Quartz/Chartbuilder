function convertConfig(item, info, emSize, chartWidth) {
	var out;
	var o;

	if(!info) {
		info = {};
		info.em = emSize;
		info.width = chartWidth;
	}

	if(item === null) {
		out = item;
	}
	else if(Array.isArray(item)) {
		out = [];
		for (var i = item.length - 1; i >= 0; i--) {
			out[i] = convertConfig(item[i], info);
		}
	}
	else if (typeof item === "object") {
		out = {};
		for(var prop in item) {
			out[prop] = convertConfig(item[prop], info);
		}
	}
	else {
		out = item;

		if(typeof item === "string") {
			var floated = parseFloat(item);
			if(floated + "em" == item || floated + "rem" == item) {
				out = info.em * floated;
			}
			else if(floated + "%" == item) {
				out = info.width * floated/100;
			}
			else if(floated + "px" == item) {
				out = floated;
			}
		}
	}

	return out;

}



module.exports = convertConfig;
