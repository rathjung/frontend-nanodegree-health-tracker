/*global Backbone */
var App = App || {};

(function () {


	// Create Foods Collection View
	App.Views.Foods = Backbone.View.extend({
		tagName: 'ul',
		className: 'selected-result',

		// listen to collection add event. Then call a method to create an element and append to the DOM.
		initialize: function(){
			this.collection.on('add', this.addOne, this);
		},
		// Method for render unordered list of selected food. Use for initiating the app with data from localstorage
		render: function(){
			this.collection.each(this.addOne, this);
			return this;
		},
		// Method for add new model and append to the DOM.
		addOne: function(food){
			$('#resultAlert').hide();
			var foodView = new App.Views.Food ({model: food});
			this.$el.append(foodView.render().el);
		}
	});

	// Create Add food View
	App.Views.AddFood = Backbone.View.extend({
		el: '#addFood',

		// Fire event when clicked on element with id foodSubmit
		events: {
			'click #foodSubmit' : 'submit'
		},

		submit: function(e) {
			e.preventDefault();
			// Get value from selected food
			var newFoodName = $('#FoodName').text().toString();
			var newFoodCal = parseInt($('#FoodCal').text());

			// Check if food Calorie is really a number. If it isn't then return
			if (isNaN(newFoodCal)) {
				return;
			}

			// Add food model with data above to the collection.
			var food = new App.Models.Food({title: newFoodName, calorie: newFoodCal}, {validate: true});
			this.collection.add(food);
			// Add to localstorage
			food.save();
		}
	});

	// Create Sum total Calorie View
	App.Views.Total = Backbone.View.extend({
		el: '#total',

		initialize: function(){
			this.render();
			// listen to update event on collection. If there's an update then re-render this view
			this.collection.on('update', this.render, this);
		},

		render: function(){
			var total = 0;
			// Loop through collection item and add it's calorie to total calorie
			this.collection.each(function(elem){
				total += parseInt(elem.get('calorie'));
			}, this);

			// Show total number
			this.$el.text(total);

			return this;
		}
	});

})();

