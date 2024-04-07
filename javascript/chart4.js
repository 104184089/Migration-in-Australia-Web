// Define the size and margins
var margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = 1060 - margin.left - margin.right,
    height = 820 - margin.top - margin.bottom; 

// Create SVG
var svg = d3.select("#effect-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Read data from CSV file
d3.csv("effect.csv").then(function (data) {
    // Convert numerical data from string to integer
    data.forEach(function (d) {
        d['Natural increase'] = +d['Natural increase'];
        d['Net internal migration'] = +d['Net internal migration'];
        d['Net overseas migration'] = +d['Net overseas migration'];
    });

    // Define the y-axis value range with negative and positive data
    var y = d3.scaleLinear()
        .domain([d3.min(data, function (d) { return Math.min(0, d['Net internal migration'], d['Net overseas migration'], d['Natural increase']); }) - 1000,
        d3.max(data, function (d) { return Math.max(0, d['Net internal migration'], d['Net overseas migration'], d['Natural increase']); }) + 1000])
        .range([height, 0]);

    // Define the x-axis value range
    var x = d3.scaleBand()
        .domain(data.map(function (d) { return d['Local Government Area']; }))
        .range([0, width])
        .padding(0.2);

    // Create y-axis
    svg.append("g")
        .call(d3.axisLeft(y).ticks(10))
        .style("font-size", "15px")
        .style("font-weight", "bold")
        .style("text-transform", "uppercase")
        .attr("transform", "translate(5,0)");

    // Create a horizontal line from the position 0 of the y-axis
    svg.append("line")
        .attr("class", "x-axis-line")
        .attr("x1", 0)
        .attr("y1", y(0))
        .attr("x2", width)
        .attr("y2", y(0))
        .style("stroke", "black")
        .style("stroke-width", "2px");

    // Define colors for different types of data
    var colorScale = d3.scaleOrdinal()
        .domain(['Net internal migration', 'Net overseas migration', 'Natural increase'])
        .range(['#2ca02c', '#1f77b4', '#ff7f0e']);

    // Create variables for Net internal migration bars
    var barsInternalMigration = svg.selectAll(".bar-internal-migration")
        .data(data)
        .enter().append("g");

    // Create variables for Net overseas migration bars
    var barsOverseasMigration = svg.selectAll(".bar-overseas-migration")
        .data(data)
        .enter().append("g");

    // Create variables for Natural increase bars
    var barsNaturalIncrease = svg.selectAll(".bar-natural-increase")
        .data(data)
        .enter().append("g");

    // Add bars and colors for Net internal migration
    barsInternalMigration.append("rect")
        .attr("class", "bar2")
        .attr("x", function (d) { return x(d['Local Government Area']); })
        .attr("y", function (d) { return y(d3.max([0, d['Net internal migration'], d['Net overseas migration'], d['Natural increase']])); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return Math.abs(y(d['Net internal migration']) - y(d['Net overseas migration'])) })
        .attr("fill", colorScale('Net internal migration'));

    // Add bars and colors for Net overseas migration
    barsOverseasMigration.append("rect")
        .attr("class", "bar3")
        .attr("x", function (d) { return x(d['Local Government Area']); })
        .attr("y", function (d) { return y(d3.max([0, d['Net internal migration'], d['Net overseas migration'], d['Natural increase']])); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return Math.abs(y(d['Net overseas migration']) - y(0)); })
        .attr("fill", colorScale('Net overseas migration'));

    // Add bars and colors for Natural increase
    barsNaturalIncrease.append("rect")
        .attr("class", "bar1")
        .attr("x", function (d) { return x(d['Local Government Area']); })
        .attr("y", function (d) {
            return Math.min(y(d['Natural increase']), y(0));
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return Math.abs(y(d['Natural increase']) - y(0));
        })
        .attr("fill", colorScale('Natural increase'));

    // Create city labels
    svg.selectAll(".city-label")
        .data(data)
        .enter().append("text")
        .style("font-size", "15px")
        .style("font-weight", "bold")
        .attr("class", "city-label")
        .attr("x", function (d) { return x(d['Local Government Area']) + x.bandwidth() / 2; })
        .attr("y", height + 45)
        .attr("text-anchor", "middle")
        .text(function (d) { return d['Local Government Area']; })
        .attr("transform", "translate(0, 2)");

    // Create tooltip
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("text-align", "left")
        .style("padding", "8px")
        .style("font", "12px sans-serif")
        .style("background", "#fff")
        .style("border", "1px solid #aaa")
        .style("border-radius", "5px")
        .style("pointer-events", "none");

    // Add mouseover and mouseout events for Net internal migration bars
    barsInternalMigration.selectAll("rect")
        .on("mouseover", function (d) {
            barsInternalMigration.selectAll("rect")
                .classed("highlight", true);
            barsOverseasMigration.selectAll("rect")
                .classed("fade", true); 
            barsNaturalIncrease.selectAll("rect")
                .classed("fade", true);
            // Show tooltip and highlight the cell being hovered over
            d3.select(this).classed("highlight", true);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<strong>City:</strong> " + d['Local Government Area'] + "<br/>" +
                "<strong>Target:</strong> Net internal migration<br/>" +
                "<strong>Data:</strong> " + d['Net internal migration'])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            barsInternalMigration.selectAll("rect")
                .classed("highlight", false);
            barsOverseasMigration.selectAll("rect")
                .classed("fade", false);
            barsNaturalIncrease.selectAll("rect")
                .classed("fade", false);
            // Hide tooltip
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });


    // Add mouseover and mouseout events for Net overseas migration bars
    barsOverseasMigration.selectAll("rect")
        .on("mouseover", function (d) {
            barsOverseasMigration.selectAll("rect")
                .classed("highlight", true); 
            barsInternalMigration.selectAll("rect")
                .classed("fade", true); 
            barsNaturalIncrease.selectAll("rect")
                .classed("fade", true); 
            // Show tooltip and highlight the cell being hovered over
            d3.select(this).classed("highlight", true);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<strong>City:</strong> " + d['Local Government Area'] + "<br/>" +
                "<strong>Target:</strong> Net overseas migration<br/>" +
                "<strong>Data:</strong> " + d['Net overseas migration'])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            barsOverseasMigration.selectAll("rect")
                .classed("highlight", false);
            barsInternalMigration.selectAll("rect")
                .classed("fade", false);
            barsNaturalIncrease.selectAll("rect")
                .classed("fade", false);
            // Hide tooltip
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add mouseover and mouseout events for Natural increase bars
    barsNaturalIncrease.selectAll("rect")
        .on("mouseover", function (d) {
            barsNaturalIncrease.selectAll("rect")
                .classed("highlight", true);
            barsInternalMigration.selectAll("rect")
                .classed("fade", true);
            barsOverseasMigration.selectAll("rect")
                .classed("fade", true);
            // Show tooltip and highlight the cell being hovered over
            d3.select(this).classed("highlight", true);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<strong>City:</strong> " + d['Local Government Area'] + "<br/>" +
                "<strong>Target:</strong> Natural increase<br/>" +
                "<strong>Data:</strong> " + d['Natural increase'])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            barsNaturalIncrease.selectAll("rect")
                .classed("highlight", false);
            barsInternalMigration.selectAll("rect")
                .classed("fade", false);
            barsOverseasMigration.selectAll("rect")
                .classed("fade", false);
            // Hide tooltip
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });


    // Create legend for the bars
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width - 200) + ", 20)")
        .selectAll("g")
        .data(['Natural increase', 'Net internal migration', 'Net overseas migration'])
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", colorScale);

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function (d) { return d; });

    // Add title for chart
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("text-transform", "uppercase")
        .text("The resident population components and the expected number of residents in New South Wales");
});
