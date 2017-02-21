filters = {
	dateStart: '4/26/2016',
	dateEnd: moment().format('M/D/YYYY'),
	breakdownByInterval: true,
	// totalQuestionsAnswered: [0, 100]
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

var updateViz = function () {
	function sumBySize(d) {
		return d.size;
	}

	console.log('updateViz called')

	var root = d3.hierarchy(data)
		.eachBefore(function(d) { 
			d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; 
			// console.log(d);
			if (!('device>platform>name' in d['data']) && d.depth != 0) {
				// console.log(d);
				d['data']['device>platform>name'] = d.parent['data']['device>platform>name'];
			} else {
				// console.log(d);
			}
			// d.data['device>platform>name'] = 
		})
		.sum(sumBySize)
		.sort(function(a, b) { return b.height - a.height || b.value - a.value; });

	treemap(root);

	var cell = svg.selectAll("rect")
		.data(root.leaves());

	var transitionDuration = root.leaves().length < 1250 ? 750 : 0;

	cell.enter().append("rect").merge(cell)
		// .transition().duration(transitionDuration)
		.attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
		.attr("id", function(d) { return d.data.id; })
		.attr("width", function(d) { return d.x1 - d.x0; })
		.attr("height", function(d) { return d.y1 - d.y0; })
		.attr("fill", function(d) { return filters.breakdownByInterval ? color(d.parent.data.id) : color(d.data.id); })
		.on('mouseover', function (d) {
			// var rectTopLeftOffsetX = 20;
			// var rectTopLeftOffsetY = 20;

			// console.log(d)

			$('#popover785269').css("display", "block");
			$('#popover785269 .popover-content').html(d.value + " questions"
				+ "<br>" + d.data.name
				+ "<br>" + d.data['device>platform>name']
			);
			// $('#popover785269 .popover-content').html(d.value + " questions<br/>\n" + d['data']['name']);

			var bodyPaddingTop = 10;
			var bodyPaddingLeft = 10;
			var popoverHeight = $('#popover785269').height();
			var popoverWidth = $('#popover785269').width();
			var popoverArrowWidth = 10;
			var popoverBorderWidth = $('#popover785269').css('border-width');
			console.log(popoverArrowWidth)
			var cellWidth = d.x1 - d.x0;
			var cellHeight = d.y1 - d.y0;

			var heightDiff = (popoverHeight/2 - cellHeight);
			console.log(heightDiff + " height diff")

			var xPosition = d.x0 + cellWidth;
			var yPosition = d.y0 - heightDiff - cellHeight / 2;

			if (yPosition < 0) {
				// xPosition = d.x0;
				// yPosition = d.y0;

				xPosition = d.x0 -(popoverWidth / 2 - cellWidth / 2 );
				yPosition = d.y0 + cellHeight;

				if (xPosition < bodyPaddingLeft) {
					xPosition = Math.max(xPosition, 0);
					var arrowMarginLeft = $('#popover785269 .arrow').css('margin-left');
					// $('#popover785269 .arrow').css('left', - arrowMarginLeft);
				}

				console.log('in if')

				$('#popover785269').removeClass("right top")
				$('#popover785269').addClass("bottom")
			} else if (yPosition + popoverHeight > svg.node().getBoundingClientRect().height){
				$('#popover785269').removeClass("bottom right")
				$('#popover785269').addClass("top")

				xPosition = d.x0 -(popoverWidth / 2 - cellWidth / 2 );
				yPosition = d.y0 - popoverHeight - 4;
			} else {
				$('#popover785269').removeClass("bottom top")
				$('#popover785269').addClass("right")
			}

			$('#popover785269').css('left', xPosition);
			$('#popover785269').css('top', yPosition)
		}).on('mouseout', function (d) {
			// $('#popover785269').css("display", "none");
		})
		// .attr("data-toggle", "popover")
		// .attr("data-content", "hey")
		// .attr("title", "the title")
		// .attr("data-trigger", "mouseover")

	cell.exit().remove();
	$("[data-toggle=popover]").popover();
}

var filtersChanged = function () {
	console.log('filtersChanged called');
	$('#loading-gif').css('display', 'initial');
	$.get('http://0.0.0.0:8888/treemap', filters, function (_data) 
	{
		var dataWasUndefined = typeof data == "undefined";
		data = _data;

		if (dataWasUndefined) {
			UIInit();
		}
		updateUIForNewData();
		updateViz(data);

		$('#loading-gif').css('display', 'none');
	})
	.fail(function() {
		alert( "failure loading data from the local server" );
	});
}

filtersChanged();

