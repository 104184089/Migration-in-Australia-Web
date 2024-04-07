// Define map dimensions
var width = 1060;
var height = 720;
var margin = { top: 20, right: 20, bottom: 40, left: 20 };

// Create SVG container for map
var mapSvg = d3.select(".map-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

// Color Scale function
var color = d3.scaleOrdinal()
  .range(['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#6a3d9a']);

// Create a group for all elements except the border for map
var mapChartGroup = mapSvg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Read data from JSON file for map
d3.json("newsouthwales.json").then(function (mapData) {

  // Create projection and path
  var projection = d3.geoMercator()
    .fitSize([width, height], mapData);

  var path = d3.geoPath().projection(projection);


  //==================================================================== Map of the state ==================================================//
  // Read data from CSV file for column chart
  d3.csv("migrationnsw_data.csv").then(function (migrationData) {

    // Process the data
    var processedData = [];
    migrationData.forEach(function (d) {
      processedData.push({
        city: d.City,
        skilled: +d.Skilled,
        family: +d.Family,
        humanitarian: +d.Humanitarian
      });
    });

    // Draw polygons of New South Wales
    mapChartGroup.selectAll("path")
      .data(mapData.features)
      .enter().append("path")
      .attr("d", path)
      .attr("fill", function (d, i) { return color(i); })
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    // Define cities within the scope of the d3.json().then() function
    var cities = [
      { name: "Sydney", coordinates: [-33.8688, 151.2093] },
      { name: "Newcastle", coordinates: [-32.9283, 151.7817] },
      { name: "Wollongong", coordinates: [-34.4278, 150.8931] },
      { name: "Central Coast", coordinates: [-33.2833, 151.2333] },
      { name: "Tweed", coordinates: [-28.1781, 153.5380] },
      { name: "Wagga Wagga", coordinates: [-35.1150, 147.3678] },
      { name: "Albury", coordinates: [-36.0737, 146.9135] },
      { name: "Maitland", coordinates: [-32.7333, 151.5500] },
      { name: "Tamworth", coordinates: [-31.0833, 150.9167] },
      { name: "Coffs Harbour", coordinates: [-30.2963, 153.1131] }
    ];

    var csvContent = "place,lat,lon\n";

    cities.forEach(function (city) {
      csvContent += city.name + "," + city.coordinates[0] + "," + city.coordinates[1] + "\n";
    });

    console.log(csvContent);

    // Add dots for cities on map
    mapChartGroup.selectAll("circle")
      .data(cities)
      .enter().append("circle")
      .attr("cx", function (d) { return projection([d.coordinates[1], d.coordinates[0]])[0]; })
      .attr("cy", function (d) { return projection([d.coordinates[1], d.coordinates[0]])[1]; })
      .attr("r", 5)
      .attr("fill", "red")
      .on("mouseover", showTooltip)
      .on("mousemove", showTooltip)
      .on("mouseleave", hideTooltip);

    // Add tooltips to circles
    var tooltip = d3.select(".map-container")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "rgb(144, 111, 111)")
      .style("border", "3px solid black")
      .style("border-radius", "10px")
      .style("padding", "5px 10px")
      .style("position", "absolute")
      .style("font-size", "14px");

    // Function to show tooltip
    function showTooltip(d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", 1);
      tooltip.html(d.name)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");
    }

    // Function to hide tooltip
    function hideTooltip(d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
    }

  });

  // Add title for map
  mapSvg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("New South Wales state map");
});

//==================================================================== Draw chart ==================================================//
//========================== Column chart =================================//
// Define chart dimensions
var chartWidth = 650;
var chartHeight = 450;
var chartMargin = { top: 60, right: 40, bottom: 60, left: 80 };

// Create SVG container for chart
var chartSvg = d3.select(".map-container")
  .append("svg")
  .attr("width", chartWidth + chartMargin.left + chartMargin.right)
  .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
  .append("g")
  .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");

// Data for column chart
var columnData = [
  { city: "Greater Sydney", skilled: 481569, family: 312781, humanitarian: 86398 },
  { city: "Rest of New South Wales", skilled: 55313, family: 41779, humanitarian: 9353 }
];

// Stack the data
var keys = ["skilled", "family", "humanitarian"];
var stack = d3.stack().keys(keys);
var stackedData = stack(columnData);

// Color scale for stacked bars
var colorScale = d3.scaleOrdinal().domain(keys).range(["#66c2a5", "#fc8d62", "#8da0cb"]);

// X scale
var xScale = d3.scaleBand()
  .domain(columnData.map(function (d) { return d.city; }))
  .range([0, chartWidth])
  .padding(0.5);

// Y scale
var yScale = d3.scaleLinear()
  .domain([0, d3.max(stackedData, function (d) { return d3.max(d, function (d) { return d[1]; }); })])
  .range([chartHeight, 0]);

// Define tooltip
var tooltip = d3.select("#column-chart-container")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute")
  .style("background-color", "rgba(0, 0, 0, 0.8)")
  .style("color", "white")
  .style("padding", "8px")
  .style("border-radius", "4px")
  .style("pointer-events", "none");

// Draw bars
chartSvg.selectAll(".bar")
  .data(stackedData)
  .enter().append("g")
  .attr("fill", function (d) { return colorScale(d.key); })
  .selectAll("rect")
  .data(function (d) {
    return d.map(function (point) {
      point.key = d.key;
      return point;
    });
  })
  .enter().append("rect")
  .attr("x", function (d) { return xScale(d.data.city); })
  .attr("y", function (d) { return yScale(d[1]); })
  .attr("height", function (d) { return yScale(d[0]) - yScale(d[1]); })
  .attr("width", xScale.bandwidth())
  .on("mouseover", function (d) {
    var total = d.data.skilled + d.data.family + d.data.humanitarian;
    tooltip.transition()
      .duration(200)
      .style("opacity", .9);
    tooltip.html(
      d.key + ": " + d[1]
    )
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px")
      .style("transform", "translate(-50%, -50%)")
      .style("font-weight", "bold")
      .style("text-transform", "uppercase");
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


// Add X axis
chartSvg.append("g")
  .attr("transform", "translate(0," + chartHeight + ")")
  .call(d3.axisBottom(xScale))
  .style("font-size", "12px")
  .style("text-transform", "uppercase")
  .style("font-weight", "bold");

// Add Y axis
chartSvg.append("g")
  .call(d3.axisLeft(yScale))
  .attr("transform", "translate(-5,0)")
  .style("font-size", "12px")
  .style("text-transform", "uppercase")
  .style("font-weight", "bold");

// Add legend
var legend = chartSvg.selectAll(".legend")
  .data(keys)
  .enter().append("g")
  .attr("class", "legend")
  .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

legend.append("rect")
  .attr("x", chartWidth - 18)
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", function (d) { return colorScale(d); });

legend.append("text")
  .attr("x", chartWidth - 24)
  .attr("y", 9)
  .attr("dy", ".35em")
  .style("text-anchor", "end")
  .text(function (d) { return d; })
  .style("text-transform", "uppercase")
  .style("font-weight", "bold");

// Add title for chart
chartSvg.append("text")
  .attr("x", chartWidth / 2)
  .attr("y", -10)
  .attr("text-anchor", "middle")
  .style("font-size", "18px")
  .style("font-weight", "bold")
  .style("text-transform", "uppercase")
  .text("Migration Data in New South Wales");

// Add labels
chartSvg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - chartMargin.left)
  .attr("x", 0 - (chartHeight / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .style("text-transform", "uppercase")
  .style("font-weight", "bold")
  .text("Number of Migrants");

chartSvg.append("text")
  .attr("x", chartWidth / 2)
  .attr("y", chartHeight + chartMargin.bottom - 5)
  .attr("text-anchor", "middle")
  .style("text-transform", "uppercase")
  .style("font-weight", "bold")
  .text("City");

// Add border around the chart
chartSvg.append("rect")
  .attr("x", -chartMargin.left)
  .attr("y", -chartMargin.top)
  .attr("width", chartWidth + chartMargin.left + chartMargin.right)
  .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
  .style("stroke", "black")
  .style("fill", "none")
  .style("stroke-width", 5);
