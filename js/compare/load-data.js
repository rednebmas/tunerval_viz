var orderLineChart = new OrderLineChart();
var timeLineChart = new TimeLineChart();

$.get('compare' + window.location.search, function (_data) {
	data = _data; 

	orderLineChart.update();
	timeLineChart.update();
});
