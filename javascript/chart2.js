// Set up chart dimensions
var width = 1060;
var height = 720;
var margin = { top: 80, right: 50, bottom: 200, left: 150 };

// Append an SVG element to the education-chart div
var svg = d3.select("#education-chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

d3.csv("lvofedu.csv").then(function (data) {
  // Convert data for visualization
  var parsedData = [];

  // Iterate through each row in the CSV data
  data.forEach(function (d) {
    // Iterate through each data type (Skilled, Family, Humanitarian)
    Object.keys(d).forEach(function (type) {
      // Skip the "Level of education" column and create an object for each data type
      if (type !== "Level of education") {
        // Add object to the parsedData array
        parsedData.push({
          type: type,
          level: d["Level of education"],
          count: +d[type] // Convert value to number
        });
      }
    });
  });

  // Set up scales for x-axis and y-axis
  var xScale = d3.scaleBand()
    .domain(data.map(function (d) { return d["Level of education"]; }))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  var yScale = d3.scaleLinear()
    .domain([0, d3.max(parsedData, function (d) { return d.count; })])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Add x-axis
  svg.append("g")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("text-anchor", "end")
    .style("font-weight", "bold")
    .style("font-size", "10px")
    .style("text-transform", "uppercase")
    .attr("transform", "rotate(-45)")
    .style("fill", "#FDEEE7");

  // Add y-axis
  svg.append("g")
    .attr("transform", "translate(" + margin.left + ",0)")
    .call(d3.axisLeft(yScale).ticks(10))
    .selectAll("text")
    .style("font-weight", "bold")
    .style("font-size", "13px")
    .style("text-transform", "uppercase")
    .style("fill", "#FDEEE7");

  // Create an array containing all unique data types
  var types = ["Skilled", "Family", "Humanitarian"];

  // Create colors for each data type
  var colorScale = d3.scaleOrdinal()
    .domain(types)
    .range(d3.schemeCategory10);

  // Create a div for the tooltip
  var tooltip = d3.select("#education-chart")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute")
  .style("background-color", "rgba(0, 0, 0, 0.8)") 
  .style("color", "white") 
  .style("padding", "8px") 
  .style("border-radius", "4px") 
  .style("pointer-events", "none"); 

  // Create lines for each data type
  types.forEach(function (type) {
    var line = d3.line()
      .x(function (d) { return xScale(d.level) + xScale.bandwidth() / 2; })
      .y(function (d) { return yScale(d.count); });

    svg.append("path")
      .datum(parsedData.filter(function (d) { return d.type === type; }))
      .attr("fill", "none")
      .attr("stroke", colorScale(type))
      .attr("stroke-width", 5)
      .attr("d", line);

    // Select data points for the current type
    var typeData = parsedData.filter(function (d) { return d.type === type; });

    // Add dots for each data point
    svg.selectAll("." + type.toLowerCase())
      .data(typeData)
      .enter().append("circle")
      .attr("class", type.toLowerCase())
      .attr("cx", function (d) { return xScale(d.level) + xScale.bandwidth() / 2; })
      .attr("cy", function (d) { return yScale(d.count); })
      .attr("r", 5) 
      .style("fill", colorScale(type))
      // Tooltip for each dot
      .on("mouseover", function (d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(type + "<br>" + d.level + ": " + d.count)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mousemove", function (d) {
        tooltip.style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function (d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  });

  // Add legends for the lines
  var legend = svg.selectAll(".legend")
    .data(types)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) { return "translate(0," + (i * 20 + margin.top) + ")"; });

  legend.append("rect")
    .attr("x", width - margin.right)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", colorScale);

  legend.append("text")
    .attr("x", width - margin.right - 5)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .style("font-weight", "bold")
    .style("font-size", "13px")
    .style("text-transform", "uppercase")
    .style("fill", "#FDEEE7")
    .text(function (d) { return d; });

  // Add chart title
  svg.append("text")
    .attr("x", (width / 2))
    .attr("y", (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .style("text-transform", "uppercase")
    .style("fill", "#FDEEE7")
    .text("Total Number of Migrants by Level of Education and Migrant Type");
});
