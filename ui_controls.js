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

// set initial value for end date
$('#daterange-end').val(filters.dateEnd);

// then initialize the datepicker
$('.input-daterange').datepicker({
	todayBtn: 'linked',
	autoclose: true,
	todayHighlight: true,
	format: 'm/d/yyyy',
	startDate: '4/26/2016',
	endDate: '+0d',
	// setDate: '2/16/2017'
});

// on change ask server for new data
$('#daterange-start').change(function (event) {
	filters.dateStart = $(this).val();
	console.log('hey this start: ' + $(this).val());
	console.log(filters);
	filtersChanged();
});
$('#daterange-end').change(function (event) {
	filters.dateEnd = $(this).val();
	console.log(filters);
	filtersChanged();
});
