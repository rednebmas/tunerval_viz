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
				.call(this.orderXAxis)
			.append("text")
				.attr("class", "label")
				.attr("x", this.width)
				.attr("y", -6)
				.style("text-anchor", "end")
				.text("time relative to first answer");

		var self = this;
		this.timeSvg
			.append('g')
				.attr("class", "y axis")
				.call(this.yAxis)
			.append("text")
				.text("difficulty")
				.attr("class", "label")
				.attr("transform", "rotate(-90)")
				.attr("y", -35)
				.attr("x", function (d) {
					return -self.svgHeight / 2 + self.margin.top + this.getComputedTextLength() / 2;
				})
				// .style('fill', 'darkOrange')
				.style("text-anchor", "end");

		return this;
	},

	setupScalesAndAxises: function () {
		var self = this;

		this.xScale = d3.scaleLinear()
			.domain([0, 600])
			.range([0, this.width]);

		this.orderXAxis = d3.axisBottom()
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
		console.log('msg');
		this.xScale = d3.scaleLinear()
		.domain([d3.min(data, function (d) {
			return d.timestamp;
		}), d3.max(data, function (d) {
			return d.timestamp;
		})])
		.range([0, this.width]);

		this.timeSvg.append("path")
			.datum(data)
			.attr("fill", "none")
			.attr("stroke", "white")
			.attr("stroke-linejoin", "round")
			// .attr("stroke-linecap", "round")
			.attr("stroke-width", 1.0)
			.attr("d", this.line_0)
			.transition().duration(1000)
			.attr("d", this.line)

		this.setupFocusDot();

		var self = this;
		this.timeSvg.append("rect")
			.attr("class", "overlay")
			.attr("width", this.width)
			.attr("height", this.height)
			.on("mouseover", function() { self.focus.style("display", null); })
			.on("mouseout", function() { self.focus.style("display", "none"); })
			.on("mousemove", this.onMouseMove(self));
	},

	bisectOrder: d3.bisector(function(d) { return d.timestamp; }).left,

	setupFocusDot: function () {
		this.focus = this.timeSvg.append("g")
			.attr("class", "focus")
			.style("display", "none"),
		this.focus.append("circle")
			.attr("r", 5)

		this.focus.append("text")
			.attr("x", 9)
			.attr("dy", ".35em");
	},

	onMouseMove: function (self) {
		return function () {
			var x0 = self.xScale.invert(d3.mouse(this)[0]),
			i = Math.min(self.bisectOrder(data, x0, 1), data.length - 1), 
			d0 = data[i - 1],
			d1 = data[i];
			var d = x0 - d0.timestamp > d1.timestamp - x0 ? d1 : d0;
			self.focus.attr("transform", "translate(" + self.xScale(d.timestamp) + "," + self.yScale(d.difficulty) + ")");
			self.focus.select("text").text("(" + d.timestamp + ", " + moment(d.timestamp).format("DD MMM YYYY hh:mm a") + ", " + d.difficulty + ")");
		}
	}
}.init(); };
