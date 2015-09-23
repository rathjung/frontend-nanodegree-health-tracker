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
	className: 'selected-item',

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
	className: 'selected-result',

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
		'click #foodSubmit' : 'submit'
	},

	submit: function(e) {
		e.preventDefault();
		var newFoodName = $('#FoodName').text().toString();
		var newFoodCal = parseInt($('#FoodCal').text());

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


// Create Search result list
App.Views.SearchResult = Backbone.View.extend({

	element: {
		searchBtn: $('#searchBtn'),
		searchKey: $('#searchfield'),
		searchformAlert: $('#searchformAlert')
	},

	initialize: function() {
		var self = this;
		this.element.searchBtn.on('click', function(e){
			e.preventDefault();
			var keyword = $.trim(self.element.searchKey.val()).toLowerCase();
			if (!keyword) {
				self.element.searchformAlert.text('Please insert search keyword.');
				return;
			}
			self.element.searchformAlert.text('');
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
			if (data.hits.length <= 0) {
				var seachNotfound = '<p>Not found any food from keyword: ' + keyword + '</p>';
				searchUL.html(seachNotfound);
				return;
			}

			for (var i = 0; i < data.hits.length; i++) {
				searchItemHTML += '<li class="searchItem"><span class="searchName">' + data.hits[i].fields.item_name + ', ' + data.hits[i].fields.brand_name + '</span> <span class="searchCal">' + Math.round(data.hits[i].fields.nf_calories) + ' Cal. </span></li>';
			}
			searchUL.html(searchItemHTML);
			var searchItem = $('.searchItem');
			searchItem.on('click', function(){
				addBtn.prop('disabled', false);
				var name = $(this).find('.searchName').text();
				var cal = $(this).find('.searchCal').text();
				$('#FoodName').text(name);
				$('#FoodCal').text(cal);
				return;
			});
		}).fail(function(){
			searchUL.html('<p>There\'re some error getting food information. Please try again later.</p>');
		});
	}
});

// Initialize App
var foodList = new App.Collections.Foods([]);
var addFoodView = new App.Views.AddFood({collection: foodList});
var foodListView = new App.Views.Foods({collection: foodList});
var totalFoodCal = new App.Views.Total({collection: foodList});
var searchResult = new App.Views.SearchResult();

$('.foodsList').html(foodListView.render().el);
