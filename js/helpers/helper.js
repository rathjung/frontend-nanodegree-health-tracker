/*global Backbone */
var App = App || {};

(function () {

	// Namespacing
	window.App = {
		Models: {},
		Collections: {},
		Views: {},
		Helper: {}
	};

	// Helper function for templating
	App.Helper.template = function(id) {
		return _.template($('#' + id).html());
	};

})();