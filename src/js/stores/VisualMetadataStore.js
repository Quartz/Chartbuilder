/*
 * Store the Chart's metadata. These are properties used to describe the chart
 * and are unrelated to the actual rendering of the chart.
*/
var assign = require("lodash/assign");
var EventEmitter = require("events").EventEmitter;

/* Flux dispatcher */
var Dispatcher = require("../dispatcher/dispatcher");

/* Require the `ChartProptiesStore so that we can wait for it to update */
var VisualPropertiesStore = require("./VisualPropertiesStore");

/* Singleton that houses metadata */
var _metadata = {};
var CHANGE_EVENT = "change";

/**
 * ### VisualMetadataStore.js
 * Flux store for chart metadata such as title, source, size, etc.
*/
var VisualMetadataStore = assign({}, EventEmitter.prototype, {

	emitChange: function() {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener: function(callback) {
		this.on(CHANGE_EVENT, callback);
	},

	removeChangeListener: function(callback) {
		this.removeListener(CHANGE_EVENT, callback);
	},

	/**
	 * get
	 * @param k
	 * @return {any} - Return value at key `k`
	 * @instance
	 * @memberof VisualMetadataStore
	 */
	get: function(k) {
		return _metadata[k];
	},

	/**
	 * getAll
	 * @return {object} - Return all metadata
	 * @instance
	 * @memberof VisualMetadataStore
	 */
	getAll: function() {
		return _metadata;
	},

	/**
	 * clear
	 * Set metadata to empty
	 * @instance
	 * @memberof VisualMetadataStore
	 */
	clear: function() {
		_metadata = {};
	}

});

/* Respond to actions coming from the dispatcher */
function registeredCallback(payload) {
	var action = payload.action;
	var data;
	var titleDirty = false;

	switch(action.eventName) {
		/*
		* New chart model is received. Respond by first waiting for
		* `ChartProptiesStore`
		*/
		case "receive-model":
			Dispatcher.waitFor([VisualPropertiesStore.dispatchToken]);
			_metadata = action.model.metadata;
			data = VisualPropertiesStore.get("data");
			_metadata.title = defaultTitle(data);
			VisualMetadataStore.emitChange();
			break;

		/* Metadata alone is being updated */
		case "update-metadata":
			_metadata[action.key] = action.value;
			// if title is edited, set dirty to true and dont generate default anymore
			// TODO: we don't need to do this every time
			if (action.key == "title") {
				titleDirty = true;
			}
			VisualMetadataStore.emitChange();
			break;

		case "update-and-reparse":
			data = VisualPropertiesStore.get("data");
			//_metadata.title = defaultTitle(data);
			_metadata[action.key] = action.value;
			VisualMetadataStore.emitChange();
			break;

		case "update-data-input":
			if (!titleDirty) {
				data = ChartPropertiesStore.get("data");
				_metadata.title = defaultTitle(data);
				ChartMetadataStore.emitChange();
			}
			break;

		default:
			// do nothing
	}

	return true;

}

//Dispatcher.register(registeredCallback);
/* Respond to actions coming from the dispatcher */
VisualMetadataStore.dispatchToken = Dispatcher.register(registeredCallback);

function defaultTitle(data) {
	if (data.length === 1 && _metadata.title === "") {
		return data[0].name;
	} else {
		return _metadata.title;
	}
}

module.exports = VisualMetadataStore;
