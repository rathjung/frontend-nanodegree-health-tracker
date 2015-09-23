// Namespacing
window.App = {
	Models: {},
	Collections: {},
	Views: {},
	Helper: {}
};

App.Helper.template = function(id) {
	return _.template($('#' + id).html());
};

// Create Food Model
App.Models.Food = Backbone.Model.extend({
	default: {
		calorie : 0
	},
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
	model: App.Models.Food
});

// Create Food Item Model View
App.Views.Food = Backbone.View.extend({
	tagName: 'li',

	template: App.Helper.template('foodsListTemplate'),

	initialize: function(){
		this.model.on('destroy', this.remove, this);
	},

	events: {
		'click .delete' : 'destroy'
	},

	render: function(){
		var template = this.template(this.model.toJSON());
		this.$el.html(template);
		return this;
	},

	destroy: function(){
		this.model.destroy();
	},

	remove: function(){
		this.$el.remove();
	}
});

// Create Foods Collection View
App.Views.Foods = Backbone.View.extend({
	tagName: 'ul',

	initialize: function(){
		this.collection.on('add', this.addOne, this);
	},
	render: function(){
		this.collection.each(this.addOne, this);
		return this;
	},
	addOne: function(food){
		var foodView = new App.Views.Food ({model: food});
		this.$el.append(foodView.render().el);
	}
});

// Create Add food View
App.Views.AddFood = Backbone.View.extend({
	el: '#addFood',

	events: {
		'submit' : 'submit'
	},

	submit: function(e) {
		e.preventDefault();
		var newFoodName = $('#FoodName').val().toString();
		var newFoodCal = parseInt($('#FoodCal').val());

		if (isNaN(newFoodCal)) {
			return;
		}

		var food = new App.Models.Food({title: newFoodName, calorie: newFoodCal}, {validate: true});
		this.collection.add(food);
	}
});

// Create Sum total Calorie View
App.Views.Total = Backbone.View.extend({
	el: '#total',

	initialize: function(){
		this.render();
		this.collection.on('update', this.render, this);
	},

	render: function(){
		var total = 0;
		this.collection.each(function(elem){
			total += parseInt(elem.get('calorie'));
		}, this);

		this.$el.text(total);

		return this;
	}
});

// Initialize App
var foodList = new App.Collections.Foods([
	// {
	// 	title: 'Food item 1',
	// 	calorie: 200
	// },
	// {
	// 	title: 'Food item 2',
	// 	calorie: 300
	// },
	// {
	// 	title: 'Food item 3',
	// 	calorie: 400
	// }
]);


var addFoodView = new App.Views.AddFood({collection: foodList});
var foodListView = new App.Views.Foods({collection: foodList});
var totalFoodCal = new App.Views.Total({collection: foodList});


$('.foodsList').html(foodListView.render().el);
