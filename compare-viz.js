var dataset = [[1,1], [2,2], [3,3], [4,4], [5,5]];

var svgWidth = $('svg').width();
var svgHeight = $('svg').height();
var margin = { top: 30, right: 30, bottom: 30, left: 30 },
	width = +svgWidth - margin.left - margin.right,
	height = +svgHeight - margin.top - margin.bottom

var xScale = d3.scaleLinear()
	.domain([0, 600])
	.range([0, width]);

var xAxis = d3.axisBottom()
	.scale(xScale);

var yScale = d3.scaleLinear()
	.domain([0, 100])
	.range([height, 0]);

var yAxis = d3.axisLeft()
	.scale(yScale);

var line_0 = d3.line()
    .x(function(d) { return xScale(d[0]); })
    .y(function(d) { return svgHeight / 2; });

var line = d3.line()
    .x(function(d) { return xScale(d[0]); })
    .y(function(d) { return yScale(d[1]); });

var svg = d3.select("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg
	.append('g')
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		// .attr("stroke", "white")
		.call(xAxis)
	.append("text")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text("x-axis");

svg
	.append('g')
		.attr("class", "y axis")
		.call(yAxis)
	.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("x", -svgHeight/2 )
		.style("text-anchor", "end")
		.text("difficulty");

$.get('compare', function (data) {
	svg.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "white")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.0)
		.attr("d", line_0)
		.transition().duration(1000)
		.attr("d", line)


	var focus = svg.append("g")
		.attr("class", "focus")
		.style("display", "none");

	focus.append("circle")
		.attr("r", 4.5);

	focus.append("text")
		.attr("x", 9)
		.attr("dy", ".35em");

	svg.append("rect")
		.attr("class", "overlay")
		.attr("width", width)
		.attr("height", height)
		.on("mouseover", function() { focus.style("display", null); })
		.on("mouseout", function() { focus.style("display", "none"); })
		.on("mousemove", mousemove);

	bisectDate = d3.bisector(function(d) { return d[0]; }).left;

	function mousemove() {
		var x0 = xScale.invert(d3.mouse(this)[0]),
		i = bisectDate(data, x0, 1),
		d0 = data[i - 1],
		d1 = data[i],
		d = x0 - d0[0] > d1[0] - x0 ? d1 : d0;
		focus.attr("transform", "translate(" + xScale(d[0]) + "," + yScale(d[1]) + ")");
		focus.select("text").text("(" + d[0] + ", " + d[1] + ")");
	}
});

