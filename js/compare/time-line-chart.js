var TimeLineChart = function() { return {
	svgWidth: $('#time-line-chart').width(),
	svgHeight: $('#time-line-chart').height(),
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

		this.timeSvg = d3.select("#time-line-chart")
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

		this.timeSvg
			.append('g')
				.attr("class", "x axis")
				.attr("transform", "translate(0," + this.height + ")")
				.call(this.xAxis)
			.append("text")
				.attr("class", "label")
				.attr("x", this.width)
				.attr("y", -6)
				.style("text-anchor", "end")
				.style('fill', 'orange')
				.text("time");

		var self = this;
		this.timeSvg
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

		this.xScale = d3.scaleTime()
			.domain([new Date(2016, 6, 23), new Date()])
			.range([0, this.width]);

		this.xAxis = d3.axisBottom()
			.scale(this.xScale);

		this.yScale = d3.scaleLinear()
			.domain([0, 100])
			.range([this.height, 0]);

		this.yAxis = d3.axisLeft()
			.scale(this.yScale);

		this.line_0 = d3.line()
			.x(function(d) { return self.xScale(d.timestamp); })
			.y(function(d) { return self.svgHeight / 2; });

		this.line = d3.line()
			.x(function(d) { return self.xScale(d.timestamp); })
			.y(function(d) { return self.yScale(d.difficulty); });
	},

	update: function() {
		var minTime = d3.min(data, function (userIntervalData) {
			return d3.min(userIntervalData, function (d) {
				return d.timestamp;
			});
		});
		var maxTime = d3.max(data, function (userIntervalData) {
			return d3.max(userIntervalData, function (d) {
				return d.timestamp;
			});
		});

		this.xScale.domain([new Date(minTime), new Date(maxTime)])
		this.timeSvg.select('.x.axis').call(this.xAxis)

		var self = this;

		for (var i = data.length - 1; i >= 0; i--) {
			var subDataSet = data[i];

			this.timeSvg.selectAll(".dot-dset" + i)
				.data(subDataSet)
				.enter().append("circle")
					.attr("class", "dot")
					.attr("r", 3.5)
					.attr("cx", function(d) { return self.xScale(d.timestamp); })
					.attr("cy", function(d) { return self.yScale(d.difficulty); })
					.style("fill", subDataSetColors[i])
					.style("fill-opacity", .33);
		}

		this.setupFocusDot();

		this.timeSvg.append("rect")
			.attr("class", "overlay")
			.attr("width", this.width)
			.attr("height", this.height)
			.on("mouseover", function() { self.focus.style("display", null); })
			.on("mouseout", function() { 
				self.focus.style("display", "none"); 
				orderLineChart.focus.style("display", "none"); 
			})
			.on("mousemove", this.onMouseMove(self));
	},

	bisectOrder: d3.bisector(function(d) { return d.timestamp; }).left,

	setupFocusDot: function () {
		this.focus = this.timeSvg.append("g")
			.attr("class", "focus")

		this.focus.append("circle")
			.attr("r", 5)

		this.focus.append("rect")
				.attr("fill", "black")
				.attr("fill-opacity", .9)
				.attr("width", 180)
				.attr("height", 20)
				.style("y", -9)
				.style("x", 7);

		this.focus.append("text")
			.attr("x", 9)
			.attr("dy", ".35em");
	},

	onMouseMove: function (self) {
		// This searches through all points and finds the closest.
		// Fairly computationally intensive, but so far does not appear to be a problem.
		return function () {
			var closestDat = findClosestDat(
				d3.mouse(this), 
				'timestamp', 
				'difficulty', 
				self.xScale, 
				self.yScale
			);

			self.showFocusForDat(closestDat);
			orderLineChart.showFocusForDat(closestDat);
		}
	},

	showFocusForDat: function (d) {
		var xPos = this.xScale(d.timestamp);
		var anchor = "start";
		var dxText = 0;
		var dxBG = 7;

		if (xPos + 180 > this.width) {
			anchor = "end";
			dxText = -19;
			dxBG = dxText - 180;
		} 

		this.focus.style("display", "block"),
		this.focus.attr("transform", "translate(" + xPos + "," + this.yScale(d.difficulty) + ")");
		this.focus.select("text")
			.text("(" + moment(d.timestamp).format("DD MMM YYYY hh:mm a") + ", " + d.difficulty.toFixed(1) + " cents)")
			.style("text-anchor", anchor)
			.attr('dx', dxText);

		this.focus.select('rect')
			.style('x', dxBG)
	}
}.init(); };
