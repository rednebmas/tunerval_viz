//
// Number of questions answered slider
//

var sliderTimeout;

// setup slider callback
$("#questions-answered-slider-range").slider({
	range: true,
	min: 0,
	max: 1,
	values: [0, 1], 
	slide: function(event, ui) {
		$("#questions-answered-slider-amount").val(ui.values[0] + " - " + ui.values[1]);
		filters.totalQuestionsAnswered = [ui.values[0], ui.values[1]];

		if (sliderTimeout) {
			clearTimeout(sliderTimeout);
		}

		sliderTimeout = setTimeout(function() { 
			filtersChanged();
		}, 500);
	}
});

var updateSlider = function () {
	// update input box text to reflect the new values
	$( "#questions-answered-slider-amount" ).val($("#questions-answered-slider-range")
		.slider("values", 0) + " - " + $("#questions-answered-slider-range")
		.slider("values", 1));
}

//
// Date picker
//

// set initial value for end date
$('#daterange-end').val(filters.dateEnd);

// then initialize the datepicker
$('.input-daterange').datepicker({
	todayBtn: 'linked',
	autoclose: true,
	todayHighlight: true,
	format: 'm/d/yyyy',
	startDate: '4/26/2016',
	endDate: '+0d'
});

// on change ask server for new data
$('#daterange-start').change(function (event) {
	filters.dateStart = $(this).val();
	filtersChanged();
});

$('#daterange-end').change(function (event) {
	filters.dateEnd = $(this).val();
	filtersChanged();
});


//
// Breakdown by interval checkbox change
//

$('#breakdown-by-interval-checkbox').change(function (e) {
	filters.breakdownByInterval = this.checked;
	filtersChanged();
	// console.log(this.checked)
})

//
// Method that is called when UI should be update b/c of new data
//

var updateUIForNewData = function () {
	updateSlider();
}

var UIInit = function () {
	// set slider values to be equal to min/max of the dataset
	$("#questions-answered-slider-range").slider({
		min: data['min_questions_answered'],
		max: data['max_questions_answered']
	});
	$("#questions-answered-slider-range").slider('values', 0, data['min_questions_answered']);
	$("#questions-answered-slider-range").slider('values', 1, data['max_questions_answered']);

}

//
// Compare button
//

$('#compare-btn').click(function () {
	var clientIDs = "";
	var intervals = "";
	for (var i = selection.length - 1; i >= 0; i--) {
		var select = selection[i];

		if (clientIDs.length != 0) {
			clientIDs += "&";
			intervals += "&";
		}

		clientIDs += "client_ids[]=" + encodeURIComponent(select.client_id);
		intervals += "intervals[]=" + encodeURIComponent(select.interval);
	}

	var newLoc = UpdateQueryString("filter", JSON.stringify(selection), window.location.origin + "/compare.html");
	window.open(window.location.origin + "/compare.html?" + clientIDs + "&" + intervals);
})

//
// Color by dropdown
//

$(".dropdown-menu li a").click(function(){
	$("#color-squares-by-btn-text").text($(this).text());
	filters.colorBy = $(this).text();
	updateViz();
});
