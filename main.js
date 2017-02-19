var svg = d3.select("svg"),
	width = +svg.node().getBoundingClientRect().width,
	height = +svg.node().getBoundingClientRect().height;

var fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); },
	color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
	format = d3.format(",d");

var treemap = d3.treemap()
	.tile(d3.treemapResquarify)
	.size([width, height])
	.round(true)
	.paddingInner(1);

$.get('http://0.0.0.0:8888/treemap', function (data) {
	$('#loading-gif').css('display', 'none');

	var root = d3.hierarchy(data)
		.eachBefore(function(d) { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; })
		.sum(sumBySize)
		.sort(function(a, b) { return b.height - a.height || b.value - a.value; });

	treemap(root);

	var cell = svg.selectAll("g")
		.data(root.leaves())
		.enter().append("g")
		.attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

	var tic = performance.now();
	cell.append("rect")
		.attr("id", function(d) { return d.data.id; })
		.attr("width", function(d) { return d.x1 - d.x0; })
		.attr("height", function(d) { return d.y1 - d.y0; })
		.attr("fill", function(d) { return color(d.parent.data.id); });
	var toc = performance.now();
	console.log((toc - tic) / 1000);

	cell.append("clipPath")
		.attr("id", function(d) { return "clip-" + d.data.id; })
		.append("use")
		.attr("xlink:href", function(d) { return "#" + d.data.id; });

	cell.append("text")
		.attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
		.attr("fill", "white")
		.selectAll("tspan")
		.data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
		.enter().append("tspan")
		.attr("x", 4)
		.attr("y", function(d, i) { return 13 + i * 10; })
		.text(function(d) { return d; });

	cell.append("title")
		.text(function(d) { return d.data.id + "\n" + format(d.value); });

	function changed(sum) {
		treemap(root.sum(sum));

		cell.transition()
		.duration(750)
		.attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
		.select("rect")
		.attr("width", function(d) { return d.x1 - d.x0; })
		.attr("height", function(d) { return d.y1 - d.y0; });
	}
})
.fail(function() {
	alert( "failure loading data from the local server" );
});

function sumBySize(d) {
	return d.size;
}
