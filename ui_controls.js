//
// Number of questions answered slider
//

// setup slider callback
$( "#questions-answered-slider-range" ).slider({
	range: true,
	min: 0,
	max: 500,
	values: [75, 300],
	slide: function(event, ui) {
		$("#amount").val("$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ]);
	}
});

// set slider initial values
$( "#amount" ).val("$" + $("#questions-answered-slider-range")
	.slider("values", 0) + " - $" + $("#questions-answered-slider-range")
	.slider("values", 1));

//
// Questions answered picker
//

//
// Date picker
//

$('.input-daterange').datepicker({
	todayBtn: "linked",
	todayHighlight: true
});
