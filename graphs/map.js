function DrawMap(data, year) {
    d3.select("#mapGraph svg").remove();
    //Width and height of map
    var margin = {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5
    },
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    var lowColor = '#ccccff'
    var highColor = '#660066'
    // D3 Projection
    var projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2]) // translate to center of screen
        .scale([900]); // scale things down so see entire US
    // Define path generator
    var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
        .projection(projection); // tell path generator to use albersUsa projection
    //Create SVG element and append map to the SVG
    // Define Tooltip
    var tooltip = d3.select("#mapGraph").append("div")
        .attr("class", "tooltip")
    var svg = d3.select("#mapGraph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    // Load in my states data!

    var dataArray = [];
    for (var d = 0; d < data.length; d++) {
        dataArray.push(parseFloat(data[d].population))
    }
    var minVal = d3.min(dataArray)
    var maxVal = d3.max(dataArray)
    var ramp = d3.scaleLinear().domain([minVal, maxVal]).range([lowColor, highColor])
    // Load GeoJSON data and merge with states data
    d3.json("data/us-states.json", function (json) {
        // Loop through each state data value in the .csv file
        for (var i = 0; i < data.length; i++) {
            // Grab State Name
            var dataState = data[i].state;
            // Grab data value
            var dataValue = data[i].population;
            // Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j].properties.name;
                if (dataState == jsonState) {
                    // Copy the data value into the JSON
                    json.features[j].properties.population = dataValue;
                    // Stop looking through the JSON
                    break;
                }
            }
        }
        // Bind the data to the SVG and create one path per GeoJSON feature
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", function (d) {
                return ramp(d.properties.population)
            })
            .on("mouseover", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("<strong>" + d.properties.name + "</strong>" + "<br/>" + "Population: " + (d.properties.population))
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);

                svg.append("g")
                    .attr("class", "bubble")
                    .selectAll("circle")
                    .data(topojson.feature(us, us.objects.states).features)
                    .enter().append("circle")
            })
            .on("click", function (d) {
                d3.csv('data/state_abbrivatons.csv', function (err, data) {
                    var State = data.filter(function (de) {
                        return de["State"] === d.properties.name
                    });
                    DrawBar(State[0].Abbreviation, year);
                    ClearPie();
                });
            });
    });
}