function DrawBar(state,year){
    d3.select("#barGraph svg").remove();
// set the dimensions and margins of the graph
var margin = { top: 10, right: 20, bottom: 20, left: 40 },
    width = 560 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#barGraph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

d3.csv('data/2007-2016-Homelessnewss-USA_cleaned.csv', function (err, data) {

    var subgroups = ["Chronically Homeless Individuals", "Homeless Individuals", "Homeless People in Families"]
    var filtered = data.filter(function (d) {
        return d["Year"] === year && d["State"] === state && subgroups.indexOf(d["Measures"]) >= 0
    });
    var groups = d3.map(filtered, function (d) { return (d["CoC Name"]) }).keys();
   
    groupByCounty = d3.nest()
    .key(function(d) { return d["CoC Name"]; })
    .entries(filtered);

    let newfilterData = [];
    for (let i = 0; i < groupByCounty.length; i++) {
        newfilterData.push(groupByCounty[i].values[0]);
        groupByCounty[i].values.forEach(element => {
            newfilterData[i][element["Measures"]] = +element.Count
        });
    }
    // Add X axis
    var x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2])
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 1260])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#e41a1c', '#377eb8', '#4daf4a'])

    //stack the data? --> stack per subgroup
    var stackedData = d3.stack()
        .keys(subgroups)
        (newfilterData)

    // Show the bars
    svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
        .attr("fill", function (d) { return color(d.key); })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function (d) { return d; })
        .enter().append("rect")
        .attr("x", function (d) { return x(d.data.group); })
        .attr("y", function (d) { return y(d[1]); })
        .attr("height", function (d) { return y(d[0]) - y(d[1]); })
        .attr("width", x.bandwidth())
        .on("click", function (d) {
            DrawPie(d.data.State,d.data.Year, d.data["CoC Number"]);
        });
});

}
function ClearBar(data) {
    d3.select("#barGraph svg").remove();
}