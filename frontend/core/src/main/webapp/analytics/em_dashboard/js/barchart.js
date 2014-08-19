function initChartToElement(elementId, dataSource) {

var margin = {top: 20, right: 20, bottom: 180, left: 40},
    width = 960 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10, "d");

var svg = d3.select(elementId).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// parse string to date object
var parseDate = d3.time.format("%Y-%m-%d_%H:%M:%S+0000");

d3.json(dataSource, function (data) {
  console.log("data loaded");
  console.log(data);
  if (data == null) {
    console.log("Cannot draw chart without data");
    return;
  }

  /*data.forEach(function(d) {
        d.time = parseDate(d.date);
  });*/

  x.domain(data.map(function(d) { return d.time; }));
  y.domain([0, d3.max(data, function(d) { return d.value; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Data");

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.time); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); });

  svg.selectAll(".bar")
      .data(data)
    .enter().append("text")
      .attr("x", function(d) { return x(d.time); })
      .attr("y", function(d) { return y(d.value); })
      .attr("dy", ".35em")
      .text(function(d) { return d.value; });

});

function type(d) {
    d.value = +d.value;

    var parseDate = d3.time.format("%Y-%m-%d_%H:%M:%S+0000");
    d.time = parseDate(d.time);
    return d;
}

};