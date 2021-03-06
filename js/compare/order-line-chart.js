var OrderLineChart = function() { return {
	svgWidth: $('#order-line-chart').width(),
	svgHeight: $('#order-line-chart').height(),
	margin: { 
		top: 20, 
		right: 30, 
		bottom: 30, 
		left: 60
	},

	/**
	* Methods
	*/

	init: function () {
		this.width = +this.svgWidth - this.margin.left - this.margin.right;
		this.height = +this.svgHeight - this.margin.top - this.margin.bottom;

		this.setupScalesAndAxises()

		this.orderSvg = d3.select("#order-line-chart")
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

		this.orderSvg
			.append('g')
				.attr("class", "x axis")
				.attr("transform", "translate(0," + this.height + ")")
				.call(this.orderXAxis)
			.append("text")
				.attr("class", "label")
				.attr("x", this.width)
				.attr("y", -6)
				.style("text-anchor", "end")
				.style('fill', 'orange')
				.text("answer #");

		var self = this;
		this.orderSvg
			.append('g')
				.attr("class", "y axis")
				.call(this.yAxis)
			.append("text")
				.text("difficulty (in cents from correct freq.)")
				.attr("class", "label")
				.attr("transform", "rotate(-90)")
				.attr("y", -35)
				.attr("x", function (d) {
					return -self.svgHeight / 2 + self.margin.top + this.getComputedTextLength() / 2;
				})
				.style("text-anchor", "end");

		return this;
	},

	setupScalesAndAxises: function () {
		var self = this;

		this.xScale = d3.scaleLinear()
			.domain([1, 600])
			.range([0, this.width]);

		this.orderXAxis = d3.axisBottom()
			.scale(this.xScale);

		this.yScale = d3.scaleLinear()
			.domain([0, 100])
			.range([this.height, 0]);

		this.yAxis = d3.axisLeft()
			.scale(this.yScale);

		this.line_0 = d3.line()
			.x(function(d) { return self.xScale(d.order); })
			.y(function(d) { return self.svgHeight / 2; });

		this.line = d3.line()
			.x(function(d) { return self.xScale(d.order); })
			.y(function(d) { return self.yScale(d.difficulty); });
	},

	update: function() {
		var min = d3.min(data, function (userIntervalData) {
			return d3.min(userIntervalData, function (d) {
				return d.order;
			});
		});
		var max = d3.max(data, function (userIntervalData) {
			return d3.max(userIntervalData, function (d) {
				return d.order;
			})
		});

		this.xScale.domain([min, max])
		this.orderSvg.select('.x.axis').call(this.orderXAxis)

		for (var i = data.length - 1; i >= 0; i--) {
			var subDataSet = data[i];

			this.orderSvg.append("path")
				.datum(subDataSet)
				.attr("fill", "none")
				.attr("stroke", subDataSetColors[i])
				.attr("stroke-opacity", .85)
				.attr("stroke-linejoin", "round")
				.attr("stroke-width", 1.0)
				.attr("d", this.line_0)
				.transition().duration(1000)
				.attr("d", this.line)
		}	

		this.setupFocusDot();

		var self = this;
		this.orderSvg.append("rect")
			.attr("class", "overlay")
			.attr("width", this.width)
			.attr("height", this.height)
			.on("mouseover", function() { self.focus.style("display", null); })
			.on("mouseout", function() { 
				self.focus.style("display", "none"); 
				timeLineChart.focus.style("display", "none"); 
			})
			.on("mousemove", this.onMouseMove(self));
	},

	bisectOrder: d3.bisector(function(d) { return d.order; }).left,

	setupFocusDot: function () {
		this.focus = this.orderSvg.append("g")
			.attr("class", "focus")
			.style("display", "none"),

		this.focus.append("circle")
			.attr("r", 5)

		this.focus.append("rect")
				.attr("fill", "black")
				.attr("fill-opacity", .9)
				.attr("width", 115)
				.attr("height", 20)
				.style("y", -9)
				.style("x", 7);

		this.focus.append("text")
				.attr("x", 9)
				.attr("dy", ".35em");
	},

	onMouseMove: function (self) {
		return function () {
			var closestDat = findClosestDat(
				d3.mouse(this), 
				'order', 
				'difficulty', 
				self.xScale, 
				self.yScale
			);

			self.showFocusForDat(closestDat);
			timeLineChart.showFocusForDat(closestDat);
		}
	},

	showFocusForDat: function (d) {
		var xPos = this.xScale(d.order);
		var anchor = "start";
		var dx = 0;
		var dxBG = 7;
		if (xPos + 110 > this.width) {
			anchor = "end";
			dx = -19;
			dxBG = -140 - dx;
		} 

		this.focus.style("display", "block"),
		this.focus.attr("transform", "translate(" + xPos + "," + this.yScale(d.difficulty) + ")");
		this.focus.select("text")
			.text("(" + d.order + ", " + d.difficulty.toFixed(1) + " cents)")
			.style("text-anchor", anchor)
			.attr('dx', dx)
		this.focus.select('rect')
			.style('x', dxBG)
	}
}.init(); };
