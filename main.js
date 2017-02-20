filters = {
	dateStart: '4/26/2016',
	// dateStart: '2/13/2017',
	dateEnd: moment().format('M/D/YYYY'),
	breakdownByInterval: false
}

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

var parseData = function (data) {
	$('#loading-gif').css('display', 'none');

	function sumBySize(d) {
		return d.size;
	}
	console.log('parseData called')

	var root = d3.hierarchy(data)
		.eachBefore(function(d) { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; })
		.sum(sumBySize)
		.sort(function(a, b) { return b.height - a.height || b.value - a.value; });

	treemap(root);

	var cell = svg.selectAll("rect")
		.data(root.leaves());

	cell
	.enter().append("rect").merge(cell)
	// .transition().duration(5000)
	.attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })

	// var rect = g.insert("rect").merge(g);

	// rect
	.attr("id", function(d) { return d.data.id; })
	.attr("width", function(d) { return d.x1 - d.x0; })
	.attr("height", function(d) { return d.y1 - d.y0; })
	.attr("fill", function(d) { return color(d.parent.data.id); });

	cell.exit().remove();

	// cell.append("clipPath")
	// 	.attr("id", function(d) { return "clip-" + d.data.id; })
	// 	.append("use")
	// 	.attr("xlink:href", function(d) { return "#" + d.data.id; });

	// cell.append("text")
	// 	.attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
	// 	.attr("fill", "white")
	// 	.selectAll("tspan")
	// 	.data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
	// 	.enter().append("tspan")
	// 	.attr("x", 4)
	// 	.attr("y", function(d, i) { return 13 + i * 10; })
	// 	.text(function(d) { return d; });

	// cell.append("title")
	// 	.text(function(d) { return d.data.id + "\n" + format(d.value); });

	function changed(sum) {
		treemap(root.sum(sum));

		cell.transition()
		.duration(750)
		.attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
		.select("rect")
		.attr("width", function(d) { return d.x1 - d.x0; })
		.attr("height", function(d) { return d.y1 - d.y0; });
	}
}

var filtersChanged = function () {
	console.log('filtersChanged called');
	$('#loading-gif').css('display', 'initial');
	$.get('http://0.0.0.0:8888/treemap', filters, function (data) {
		parseData(data);
	})
	.fail(function() {
		alert( "failure loading data from the local server" );
	});
}

filtersChanged();

