filters = {
	dateStart: '4/26/2016',
	dateEnd: moment().format('M/D/YYYY'),
	breakdownByInterval: true,
	totalQuestionsAnswered: [0, 10000],
	colorBy: 'Client ID' // this doesn't need to be sent to the server
}

selection = [
	/* example of data format
	{
		client_id: "6C55CFB1-12AF-4128-9C7B-CA5B261724D3"
		interval: "asc minor second"
	}
	*/
]

var svg = d3.select("svg"),
	width = +svg.node().getBoundingClientRect().width,
	height = +svg.node().getBoundingClientRect().height;

var fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); },
	color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
	format = d3.format(",d"),
	divergingColorScale = d3.scaleSequential(d3.interpolatePiYG);

var treemap = d3.treemap()
	.tile(d3.treemapResquarify)
	.size([width, height])
	.round(true)
	.paddingInner(1);

var updateViz = function () {
	function sumBySize(d) {
		return d.size;
	}

	// if the data set is empty, clear the graphic
	if (data.children.length < 1) {
		$('svg').html('');
		return;
	}

	var root = d3.hierarchy(data)
		.eachBefore(function(d) { 
			d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; 
			if (!('device>platform>name' in d['data']) && d.depth != 0) {
				d['data']['device>platform>name'] = d.parent['data']['device>platform>name'];
				d['data']['client_id'] = d.parent['data']['name'];
			} 
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
		.attr("fill", function(d) { 
			// console.log(d);
			if (filters.colorBy == 'Client ID') {
				return filters.breakdownByInterval ? color(d.parent.data.id) : color(d.data.id); 
			} else if (filters.colorBy == 'Interval') {
				return d3.interpolatePRGn((+d.data.interval_value + 12) / 24); 
			} else if (filters.colorBy == 'Platform') {
				if (d.data['device>platform>name'] == 'iOS') {
					return 'rgb(80, 122, 165)';
				} else {
					return 'rgb(92, 160, 83)';
				}
				return color(d.data['device>platform>name']);
			}
		})
		.attr("fill-opacity", .9)
		.attr("stroke-width", 0)
		.on('click', onCellClick)
		.on('mouseover', function (d) {
			// var rectTopLeftOffsetX = 20;
			// var rectTopLeftOffsetY = 20;
			d3.select(this).attr('fill-opacity', 1.0);

			// $('#popover785269').fadeIn();
			$('#popover785269').css("display", "block");
			$('#popover785269 .popover-content').html(d.value + " questions"
				+ "<br>" + d.data.name
				+ "<br>" + d.data['device>platform>name']
			);
			$('#popover785269 .popover-title').text(d.data['client_id']);

			// $('#popover785269 .popover-content').html(d.value + " questions<br/>\n" + d['data']['name']);

			var bodyPaddingTop = 10;
			var bodyPaddingLeft = 10;
			var popoverHeight = $('#popover785269').height();
			var popoverWidth = $('#popover785269').width();
			var popoverArrowWidth = 10;
			var popoverBorderWidth = $('#popover785269').css('border-width');
			var cellWidth = d.x1 - d.x0;
			var cellHeight = d.y1 - d.y0;

			var heightDiff = (popoverHeight/2 - cellHeight);

			var xPosition = d.x0 + cellWidth;
			var yPosition = d.y0 - heightDiff - cellHeight / 2;

			if (yPosition < 0) {

				xPosition = d.x0 -(popoverWidth / 2 - cellWidth / 2 );
				yPosition = d.y0 + cellHeight;

				if (xPosition < bodyPaddingLeft) {
					xPosition = Math.max(xPosition, 0);
					var arrowMarginLeft = $('#popover785269 .arrow').css('margin-left');
					// $('#popover785269 .arrow').css('left', - arrowMarginLeft);
				}

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

			$('#popover785269').stop();
			$('#popover785269').animate({
				'left': xPosition,
				'top': yPosition
			}, { 
				queue: false,
				duration: 25
			});
		}).on('mouseout', function (d) {
			$('#popover785269').css("display", "none");
			// console.log('mouseout')
			d3.select(this).attr('fill-opacity', 0.9);
		})

	cell.exit().remove();
	$("[data-toggle=popover]").popover();
}

var onCellClick = function (d) {
	var fillColor = 'red';

	var currentSelection = {
		client_id: d.data['client_id'],
		interval: d.data['name']
	}

	var cellIsSelected = d3.select(this).attr('stroke-width') > 0;
	if (cellIsSelected) {
		selection = selection.filter(function (selected) {
			return !(selected.client_id == currentSelection.client_id &&
				   selected.interval == currentSelection.interval);
		});

		makeCellRegular(this);
	} else {
		selection.push(currentSelection);
		makeCellSmall(this);
	}

	// d3.select(this).attr('fill', fillColor);
	/*
			if (filters.breakdownByInterval == false) {
				alert('In order to view score history you must be in "Breakdown by interval" mode.')
				return;
			}

			var currentSelection = [{
				client_id: d.data['client_id'],
				interval: d.data['name']
			}];
			var newLoc = UpdateQueryString("filter", JSON.stringify(currentSelection), window.location.origin + "/compare.html");
			window.open(newLoc);
	*/
}

var makeCellSmall = function (cell) {
	var dx = 2;
	var dy = 2;
	d3.select(cell).transition()
		.attr("transform", function(d) { return "translate(" + (d.x0 + dx) + "," + (d.y0 + dy) + ")"; })
		.attr("id", function(d) { return d.data.id; })
		.attr("width", function(d) { return d.x1 - d.x0 - 2*dx; })
		.attr("height", function(d) { return d.y1 - d.y0 - 2*dy; })
		.attr("stroke", "white")
		.attr("stroke-width", 1)
		.attr("stroke-opacity", .9)
}

var makeCellRegular = function (cell) {
	d3.select(cell).transition()
		.attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
		.attr("id", function(d) { return d.data.id; })
		.attr("width", function(d) { return d.x1 - d.x0; })
		.attr("height", function(d) { return d.y1 - d.y0; })
		.attr("stroke-width", 0)
}

var filtersChanged = function () {
	console.log('filtersChanged called');
	$('#loading-gif').css('display', 'initial');
	$.get('treemap', filters, function (_data) 
	{
		var dataWasUndefined = typeof data == "undefined";
		data = _data;
		console.log(data);

		if (dataWasUndefined) {
			UIInit();
		}
		updateUIForNewData();
		updateViz(data);
		selection = [];

		$('#loading-gif').css('display', 'none');
	})
	.fail(function() {
		alert( "failure loading data from the local server" );
	});
}

filtersChanged();

