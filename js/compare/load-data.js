var orderLineChart = new OrderLineChart();
console.log(orderLineChart);
$.get('compare' + window.location.search, function (_data) {
	data = _data;

	// WARN
	// TEMPORARY
	// WARN
	data = _data[0]; 

	orderLineChart.update();
	// updateTimeLineChart();
});
