filters = {
	dateStart: '4/26/2016',
	dateEnd: moment().format('M/D/YYYY'),
	breakdownByInterval: true,
	totalQuestionsAnswered: [0, 10000]
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

	// if the data set is empty, clear the graphic
	if (data.children.length < 1) {
		$('svg').html('')
		return;
	}

	var root = d3.hierarchy(data)
		.eachBefore(function(d) { 
			d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; 
			if (!('device>platform>name' in d['data']) && d.depth != 0) {
				// console.log(d);
				d['data']['device>platform>name'] = d.parent['data']['device>platform>name'];
				d['data']['client_id'] = d.parent['data']['name'];
			} else {
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
			return filters.breakdownByInterval ? color(d.parent.data.id) : color(d.data.id); 
		})
		.attr("fill-opacity", .9)
		.on('click', function (d) {
			var fillColor = 'red';

			var currentSelection = {
				client_id: d.data['client_id'],
				interval: d.data['name']
			}

			var cellIsSelected = d3.select(this).attr('fill') == 'red'
			if (cellIsSelected) {
				fillColor = filters.breakdownByInterval ? color(d.parent.data.id) : color(d.data.id);
				selection = selection.filter(function (selected) {
					return selected.client_id != currentSelection.client_id &&
						   selected.interval != currentSelection.interval;
				})
			} else {
				selection.push(currentSelection);
			}

			d3.select(this).attr('fill', fillColor);
		})
		.on('mouseover', function (d) {
			// var rectTopLeftOffsetX = 20;
			// var rectTopLeftOffsetY = 20;
			d3.select(this).attr('fill-opacity', 1.0);

			// console.log(d)

			// $('#popover785269').fadeIn();
			$('#popover785269').css("display", "block");
			$('#popover785269 .popover-content').html(d.value + " questions"
				+ "<br>" + d.data.name
				+ "<br>" + d.data['device>platform>name']
				// + "<br>" + d.data['client_id']
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

var filtersChanged = function () {
	console.log('filtersChanged called');
	$('#loading-gif').css('display', 'initial');
	$.get('treemap', filters, function (_data) 
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

