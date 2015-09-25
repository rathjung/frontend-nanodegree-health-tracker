/*global Backbone */
var App = App || {};

(function () {

	// Create Food Item Model View
	App.Views.Food = Backbone.View.extend({
		tagName: 'li',
		className: 'selected-item',

		// set up template for later use
		template: App.Helper.template('foodsListTemplate'),

		// listen to destroy event, set context to this model
		initialize: function(){
			this.model.on('destroy', this.remove, this);
		},

		// when click on element with class .delete call destroy method
		events: {
			'click .delete' : 'destroy'
		},

		// render this model by parsing object to template
		render: function(){
			var template = this.template(this.model.toJSON());
			this.$el.html(template);
			return this;
		},

		// method for destroy the model
		destroy: function(){
			this.model.destroy();
		},

		// method for remove the element from the DOM.
		remove: function(){
			// if no food element left then show message to tell user to add food.
			if (this.$el.siblings().length === 0) {
				$('#resultAlert').show();
			}
			this.$el.remove();
		}
	});

})();

