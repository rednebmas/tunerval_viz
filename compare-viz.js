var dataset = [[1,1], [2,2], [3,3], [4,4], [5,5]];

var svgWidth = $('svg').width();
var svgHeight = $('svg').height();
var margin = { top: 30, right: 30, bottom: 30, left: 60 },
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
    .x(function(d) { return xScale(d.order); })
    .y(function(d) { return svgHeight / 2; });

var line = d3.line()
    .x(function(d) { return xScale(d.order); })
    .y(function(d) { return yScale(d.difficulty); });

var svg = d3.select("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg
	.append('g')
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
	.append("text")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text("order");

svg
	.append('g')
		.attr("class", "y axis")
		.call(yAxis)
	.append("text")
		.text("difficulty")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", -35)
		.attr("x", function (d) {
			return -svgHeight / 2 + margin.top + this.getComputedTextLength() / 2;
		})
		// .style('fill', 'darkOrange')
		.style("text-anchor", "end");

// var filter = JSON.parse(getQueryParams(window.location.search).filter);
$.get('compare' + window.location.search, function (_data) {

	data = _data;

	data = data[0];

	xScale = d3.scaleLinear()
	.domain([0, d3.max(data, function (d) {
		return d.order - 1;
	})])
	.range([0, width]);

	svg.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "white")
		.attr("stroke-linejoin", "round")
		// .attr("stroke-linecap", "round")
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

	bisectDate = d3.bisector(function(d) { return d.order; }).left;

	function mousemove() {
		var x0 = xScale.invert(d3.mouse(this)[0]),
		i = Math.min(bisectDate(data, x0, 1), data.length - 1), 
		d0 = data[i - 1],
		d1 = data[i];
		var d = x0 - d0.order > d1.order - x0 ? d1 : d0;
		focus.attr("transform", "translate(" + xScale(d.order) + "," + yScale(d.difficulty) + ")");
		focus.select("text").text("(" + d.order + ", " + d.difficulty + ")");
	}
});

