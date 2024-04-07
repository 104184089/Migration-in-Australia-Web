// Width and height
var w = 1060;
var h = 720;
var padding = 180;

// Color Scale function
var color = d3.scaleOrdinal()
    .range(['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#6a3d9a']);

// Defines a geographic projection
var projection = d3.geoMercator()
    .center([135, -25])
    .translate([w / 2, (h + 60) / 2])
    .scale(1200);

// Defines a path generator
var path = d3.geoPath()
    .projection(projection);

// SVG Container
var svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", w + padding)
    .attr("height", h + padding);

// Define tooltip for city circles
var cityTooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "rgba(0, 0, 0, 0.8)")
    .style("color", "white")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("pointer-events", "none");

// Define tooltip for state paths
var stateTooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "rgba(0, 0, 0, 0.8)")
    .style("color", "white")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("pointer-events", "none");


// Add titlte for map 
svg.append("text")
    .attr("x", (w + padding) / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Migration Data in Australia");


//=============================================== Loading data from .json file and .csv file ===============================================//  
//======================= Loading data from .json file ==================================//
//Loads GeoJSON data from "aus.json"
d3.json("australia.json").then(function (json) {

    // Rendering GeoJSON Features 
    svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("stroke", "dimgray")
        .attr("fill", function (d, i) { return color(i) })
        .attr("d", path)
        .on("mouseover", function (d) {
            d3.select(this).classed("highlighted", true);
            d3.selectAll("path").classed("faded", true);
            d3.select(this).classed("faded", false);

            // Show tooltip for the state
            stateTooltip.transition()
                .duration(200)
                .style("opacity", .9);
            var stateInfo = getStateData(d.properties.name);
            stateTooltip.html("<strong>" + d.properties.name + "</strong><br>" +
                "Skilled: " + stateInfo.skilled + "<br>" +
                "Family: " + stateInfo.family + "<br>" +
                "Humanitarian: " + stateInfo.humanitarian + "<br>" +
                "Total: " + stateInfo.total)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY + 10) + "px")
                .style("transform", "translate(-50%, -50%)");
        })
        .on("mousemove", function (d) {
            // Update tooltip position on mousemove
            stateTooltip.style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY + 10) + "px")
                .style("transform", "translate(-50%, -50%)");
        })
        .on("mouseout", function () {
            d3.select(this).classed("highlighted", false);
            d3.selectAll("path").classed("faded", false);

            // Hide tooltip for the state
            stateTooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });


    // Render state labels
    var stateLabels = svg.selectAll(".state-label")
        .data(json.features)
        .enter()
        .append("text")
        .attr("class", "state-label")
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .attr("x", function (d) {
            var centroid = path.centroid(d);
            return centroid[0];
        })
        .attr("y", function (d) {
            var centroid = path.centroid(d);
            var yOffset = 0;
            // Adjust y offset based on state name
            if (d.properties.name === "Northern Territory") {
                yOffset = 45;
            } else if (d.properties.name === "Victoria") {
                yOffset = 10;
            } else if (centroid[1] > h / 2) {
                yOffset = -15;

            } else {
                yOffset = 14;
            }
            return centroid[1] + yOffset;
        })
        .text(function (d) { return d.properties.name; });


});


//======================= Loading data from .csv file ==================================//
//Loads additional CSV data from "city_data.csv"
d3.csv("city_data.csv", function (d) {
    return {
        city: d.City,
        skilled: +d.Skilled,
        family: +d.Family,
        humanitarian: +d.Humanitarian,
        total: +d.Total
    };
}).then(function (data) {
    cityData = data; // Assign data to cityData variable

    //Loads additional CSV data from "aus_city.csv"
    d3.csv("aus_city.csv", function (d) {
        return {
            place: d.place,
            lat: +d.lat,
            lon: +d.lon
        };
    }).then(function (locationData) {

        //Rendering Additional Data (Cities) and Labels
        // Render city labels
        var cityLabels = svg.selectAll(".city-label")
            .data(locationData)
            .enter()
            .append("text")
            .attr("class", "city-label")
            .attr("x", function (d) {
                return projection([d.lon, d.lat])[0] - 25;
            })
            .attr("y", function (d) {
                return projection([d.lon, d.lat])[1] + 14;
            })
            .style("fill", "black")
            .style("font-size", "12px")
            .style("z-index", 1)
            .text(function (d) {
                return d.place;
            });

        //Rendering Additional Data (Cities) and Labels
        svg.selectAll(".city-circle")
            .data(locationData)
            .enter()
            .append("circle")
            .attr("class", "city-circle")
            .attr("cx", function (d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr("cy", function (d) {
                return projection([d.lon, d.lat])[1];
            })
            .attr("r", 4)
            .on("click", function (d, i) {
                // Call drawCityPieChart with city name when clicked
                drawCityPieChart(d.place);
            })
            .on("mouseover", function (d, i) {
                d3.select(this)
                    .attr("r", 6);
                // Show city tooltip
                cityTooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                cityTooltip.html("<strong>" + d.place + "</strong><br>" +
                    "Skilled: " + cityData[i].skilled + "<br>" +
                    "Family: " + cityData[i].family + "<br>" +
                    "Humanitarian: " + cityData[i].humanitarian + "<br>" +
                    "Total: " + cityData[i].total)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY + 10) + "px");
            })
            .on("mouseout", function () {
                d3.select(this)
                    .attr("r", 5);
                // Hide city tooltip
                cityTooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })

        // Create a div element for the tooltip
        var tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("pointer-events", "none");

    });
});

//======================= Loading data from .csv file ==================================//
//Loads additional CSV data from "state_data.csv"
d3.csv("state_data.csv", function (d) {
    return {
        state: d.State,
        skilled: +d.Skilled,
        family: +d.Family,
        humanitarian: +d.Humanitarian,
        total: +d.Total
    };
}).then(function (data) {
    stateData = data; // Assign data to stateData variable
});

// Function to get state data by name
function getStateData(stateName) {
    return stateData.find(function (d) {
        return d.state === stateName;
    });
}


//======================================================================================= Drawing Chart ====================================================================//
//=========================== Drawing Pie Chart ==================================//
// Function to draw pie chart for city data
function drawCityPieChart(cityName) {
    // Define margin
    var margin = { top: 50, right: 10, bottom: 50, left: 50 };

    // Filter data for the selected city
    var selectedCityData = cityData.filter(function (d) {
        return d.city === cityName;
    });

    // If no data found for the selected city, return
    if (selectedCityData.length === 0) {
        console.error("No data found for the selected city.");
        return;
    }

    // Remove any existing pie charts
    d3.select(".city-pie-chart").remove();

    // Create an array of years for x-axis
    var years = Object.keys(selectedCityData[0]).filter(function (key) {
        return key !== "city" && key !== "total";
    });

    // Create an array of data values for y-axis
    var dataValues = years.map(function (year) {
        return selectedCityData[0][year];
    });

    // Define the dimensions for the pie chart
    var chartWidth = 600;
    var chartHeight = 400;
    var radius = Math.min(chartWidth, chartHeight) / 2;

    // Create SVG for pie chart
    var chartSvg = d3.select("#chart-container")
        .append("svg")
        .attr("class", "city-pie-chart")
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + 20 + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (margin.left + chartWidth / 2) + "," + (margin.top + 20 + chartHeight / 2) + ")");

    // Define color scale
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    // Define pie layout
    var pie = d3.pie()
        .sort(null)
        .value(function (d) { return d; });

    // Generate pie slices
    var arcs = chartSvg.selectAll(".arc")
        .data(pie(dataValues))
        .enter().append("g")
        .attr("class", "arc");

    // Mouseover function
    var mouseover = function (d, i) {
        tooltip.style("opacity", 1)
            .html(years[i] + ": " + d.data)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .style("transform", "translate(-50%, -100%)");
    };

    // Mousemove function
    var mousemove = function (d, i) {
        tooltip.style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    };

    // Mouseout function
    var mouseout = function (d) {
        tooltip.style("opacity", 0);
    };

    // Bind mousemove event to update tooltip position
    chartSvg.on("mousemove", mousemove);

    // Draw pie slices
    arcs.append("path")
        .attr("d", d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
        )
        .attr("fill", function (d, i) { return color(i); })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    // Define tooltip
    var tooltip = d3.select("#chart-container")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none");

    // Add title to the pie chart
    chartSvg.append("text")
        .attr("x", 0)
        .attr("y", -chartHeight / 2 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("font-size", "18px")
        .style("text-transform", "uppercase")
        .text(cityName + " Migration Data");

    // Create a rectangle for border
    chartSvg.append("rect")
        .attr("x", -chartWidth / 2 - margin.left)
        .attr("y", -chartHeight / 2 - margin.top)
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + margin.bottom)
        .style("fill", "none")
        .style("stroke", "#695b54")
        .style("stroke-width", 6);

    // Add legend
    var legend = chartSvg.selectAll(".legend")
        .data(years)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(-" + chartWidth / 2 + "," + (i * 20 - chartHeight / 2) + ")"; });

    legend.append("rect")
        .attr("x", chartWidth - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function (d, i) { return color(i); });

    legend.append("text")
        .attr("x", chartWidth - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) { return d; })
        .style("text-transform", "uppercase");
}


//=========================== Drawing column Chart ==================================//
// Function to draw age group column chart
function drawAgeGroupColumnChart() {
    // Data for age groups
    var ageGroupsData = [
        { ageGroup: '14 and under', skilled: 193300, family: 40800, humanitarian: 31700 },
        { ageGroup: '15-19', skilled: 100500, family: 29800, humanitarian: 24800 },
        { ageGroup: '20-24', skilled: 94200, family: 40700, humanitarian: 29300 },
        { ageGroup: '25-29', skilled: 108800, family: 84600, humanitarian: 29500 },
        { ageGroup: '30-34', skilled: 232700, family: 151300, humanitarian: 30400 },
        { ageGroup: '35-39', skilled: 319100, family: 163700, humanitarian: 30600 },
        { ageGroup: '40-44', skilled: 262200, family: 131200, humanitarian: 25600 },
        { ageGroup: '45-49', skilled: 189800, family: 92600, humanitarian: 22100 },
        { ageGroup: '50-54', skilled: 129700, family: 58800, humanitarian: 17900 },
        { ageGroup: '55-59', skilled: 76600, family: 39400, humanitarian: 13700 },
        { ageGroup: '60-64', skilled: 33800, family: 34000, humanitarian: 10000 },
        { ageGroup: '65 and over', skilled: 20300, family: 95500, humanitarian: 18000 }
    ];

    // Define dimensions for column chart
    var chartWidth = 800;
    var chartHeight = 400;
    var margin = { top: 50, right: 50, bottom: 50, left: 50 };

    // Create SVG for column chart
    var chartSvg = d3.select("#chart-container")
        .append("svg")
        .attr("class", "age-group-column-chart")
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define scales for x and y axes
    var xScale = d3.scaleBand()
        .domain(ageGroupsData.map(function (d) { return d.ageGroup; }))
        .range([0, chartWidth])
        .padding(0.2);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(ageGroupsData, function (d) { return d3.max([d.skilled, d.family, d.humanitarian]); })])
        .nice()
        .range([chartHeight, 0]);

    // Create x-axis
    chartSvg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(d3.axisBottom(xScale))
        .style("font-weight", "bold")
        .style("font-size", "13px")
        .style("text-transform", "uppercase");

    // Create y-axis with number format
    chartSvg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).tickFormat(d3.format(".2s")))
        .style("font-weight", "bold")
        .style("font-size", "13px")
        .style("text-transform", "uppercase");

    // Create groups for each age group
    var groups = chartSvg.selectAll(".age-group")
        .data(ageGroupsData)
        .enter()
        .append("g")
        .attr("class", "age-group")
        .attr("transform", function (d) { return "translate(" + xScale(d.ageGroup) + ",0)"; });


    // Define tooltip
    var tooltip = d3.select("#chart-container")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none");


    // Draw bars for skilled migrants
    groups.append("rect")
        .attr("class", "skilled-bar")
        .attr("x", function (d) { return xScale.bandwidth() / 4; })
        .attr("y", function (d) { return yScale(d.skilled); })
        .attr("width", xScale.bandwidth() / 4)
        .attr("height", function (d) { return chartHeight - yScale(d.skilled); })
        .attr("fill", "#1f78b4")
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<strong>" + d.ageGroup + "</strong><br>" +
                "Skilled: " + d.skilled + "<br>" +
                "Family: " + d.family + "<br>" +
                "Humanitarian: " + d.humanitarian)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Draw bars for family migrants
    groups.append("rect")
        .attr("class", "family-bar")
        .attr("x", function (d) { return xScale.bandwidth() / 2; })
        .attr("y", function (d) { return yScale(d.family); })
        .attr("width", xScale.bandwidth() / 4)
        .attr("height", function (d) { return chartHeight - yScale(d.family); })
        .attr("fill", "#b2df8a")
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<strong>" + d.ageGroup + "</strong><br>" +
                "Skilled: " + d.skilled + "<br>" +
                "Family: " + d.family + "<br>" +
                "Humanitarian: " + d.humanitarian)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Draw bars for humanitarian migrants
    groups.append("rect")
        .attr("class", "humanitarian-bar")
        .attr("x", function (d) { return 3 * xScale.bandwidth() / 4; })
        .attr("y", function (d) { return yScale(d.humanitarian); })
        .attr("width", xScale.bandwidth() / 4)
        .attr("height", function (d) { return chartHeight - yScale(d.humanitarian); })
        .attr("fill", "#33a02c")
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<strong>" + d.ageGroup + "</strong><br>" +
                "Skilled: " + d.skilled + "<br>" +
                "Family: " + d.family + "<br>" +
                "Humanitarian: " + d.humanitarian)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add legend of the information displayed each color represents
    var legend = chartSvg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (chartWidth - 120) + "," + (margin.top / 2) + ")");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#1f78b4");

    legend.append("text")
        .attr("x", 30)
        .attr("y", 10)
        .text("Skilled");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 30)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#b2df8a");

    legend.append("text")
        .attr("x", 30)
        .attr("y", 40)
        .text("Family");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 60)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#33a02c");

    legend.append("text")
        .attr("x", 30)
        .attr("y", 70)
        .text("Humanitarian");

    // Add title
    chartSvg.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .style("text-transform", "uppercase")
        .text("Migrants by Age Group");


    // Create a rectangle for border
    chartSvg.append("rect")
        .attr("x", -margin.left)
        .attr("y", -margin.top)
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + margin.bottom)
        .style("fill", "none")
        .style("stroke", "#695b54")
        .style("stroke-width", 6);

}

// Call the function to draw age group column chart
drawAgeGroupColumnChart();