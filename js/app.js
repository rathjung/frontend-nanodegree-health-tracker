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

// Create Food Model
App.Models.Food = Backbone.Model.extend({
	default: {
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

// Create Foods Collection
App.Collections.Foods = Backbone.Collection.extend({
	model: App.Models.Food,
	// Implement localstorage
	localStorage: new Backbone.LocalStorage('FoodsLocal')
});

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


// Create Search result list
App.Views.SearchResult = Backbone.View.extend({

	// Cache common element use in this view.
	element: {
		searchBtn: $('#searchBtn'),
		searchKey: $('#searchfield'),
		searchformAlert: $('#searchformAlert')
	},

	initialize: function() {
		var self = this;
		this.element.searchBtn.on('click', function(e){
			e.preventDefault();
			// Preparing the keyword
			var keyword = $.trim(self.element.searchKey.val()).toLowerCase();
			// Check if user provide a keyword or not
			if (!keyword) {
				self.element.searchformAlert.text('Please insert search keyword.');
				return;
			}
			// Remove the message that tell user to type a keyword
			self.element.searchformAlert.text('');
			// Firing an AJAX request
			self.getAJAX(keyword);
		});
	},

	getAJAX: function(keyword){
		var self = this;
		var searchUL = $('.search-result');

		searchUL.html('<p>Now Loading...</p>');

		$.ajax({
			type: 'GET',
			dataType: 'json',
			cache: true,
			url: 'https://api.nutritionix.com/v1_1/search/' + keyword +'?results=0%3A10&cal_min=0&cal_max=50000&fields=item_name%2Cbrand_name%2Cnf_calories&appId=13503f28&appKey=3daab5653ab630e12e2f2aa9e1cecf8e'
		}).done(function(data) {
			var food;
			var addBtn = $('#foodSubmit');
			var searchItemHTML = '';

			// If no food found then tell the user.
			if (data.hits.length <= 0) {
				var seachNotfound = '<p>Not found any food from keyword: ' + keyword + '</p>';
				searchUL.html(seachNotfound);
				return;
			}

			// Iterate through each food object and get the data from it
			for (var i = 0; i < data.hits.length; i++) {
				searchItemHTML += '<li class="searchItem"><span class="searchName">' + data.hits[i].fields.item_name + ', ' + data.hits[i].fields.brand_name + '</span> <span class="searchCal">' + Math.round(data.hits[i].fields.nf_calories) + ' Cal. </span></li>';
			}
			// Insert to the DOM.
			searchUL.html(searchItemHTML);
			var searchItem = $('.searchItem');
			// Listen to an event. If user clicked on the targeted element then get the element's value
			searchItem.on('click', function(){
				addBtn.prop('disabled', false);
				var name = $(this).find('.searchName').text();
				var cal = $(this).find('.searchCal').text();
				$('#FoodName').text(name);
				$('#FoodCal').text(cal);
				return;
			});
		}).fail(function(){
			// If AJAX request is fail then tell the user.
			searchUL.html('<p>There\'re some error getting food information. Please try again later.</p>');
		});
	}
});

// Initialize App
var foodList = new App.Collections.Foods([]);
foodList.fetch();
var addFoodView = new App.Views.AddFood({collection: foodList});
var foodListView = new App.Views.Foods({collection: foodList});
var totalFoodCal = new App.Views.Total({collection: foodList});
var searchResult = new App.Views.SearchResult();

$('.foodsList').html(foodListView.render().el);
