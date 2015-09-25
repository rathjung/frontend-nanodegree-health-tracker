/*global Backbone */
var App = App || {};

(function () {

	// Create Food Model
	App.Models.Food = Backbone.Model.extend({
		default: {
			title: '',
			calorie: 0
		},
		// Validation for every food model must have name and calorie
		validate: function(attrs){
			if(! $.trim(attrs.title)) {
				return 'Must provide Food name';
			}
			if(! $.trim(attrs.calorie)) {
				return 'Must provide food calorie';
			}
		}
	});

})();
