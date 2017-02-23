var orderLineChart = new OrderLineChart();
var timeLineChart = new TimeLineChart();

$.get('compare' + window.location.search, function (_data) {
	data = _data;

	// WARN
	// TEMPORARY
	// WARN
	data = _data[0]; 

	orderLineChart.update();
	timeLineChart.update();
});
