$(function () {

	// Initialize App
	var foodList = new App.Collections.Foods([]);
	foodList.fetch();
	new App.Views.AddFood({collection: foodList});
	var foodListView = new App.Views.Foods({collection: foodList});
	new App.Views.Total({collection: foodList});
	new App.Views.SearchResult();

	$('.foodsList').html(foodListView.render().el);

});