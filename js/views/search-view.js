/*global Backbone */
var App = App || {};

(function () {

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

})();