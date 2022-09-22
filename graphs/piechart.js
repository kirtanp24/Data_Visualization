
function DrawPie(state, year, CocNumber) {


    d3.select("#pieGraph svg").remove();
    var svgWidth = 500, svgHeight = 300, radius = Math.min(svgWidth, svgHeight) / 2;
    var svg = d3.select("#pieGraph").append("svg").attr("width", svgWidth).attr("height", svgHeight);

    var g = svg.append("g").attr("transform", "translate(" + radius + "," + radius + ")");

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var pie = d3.pie().value(function (d) {
        return d.Count;
    })

    var path = d3.arc().outerRadius(radius).innerRadius(0);
    d3.csv('data/2007-2016-Homelessnewss-USA_cleaned.csv', function (err, data) {

        var filterData = data.filter(function (d) {
            return d["Year"] === year && d["State"] === state && d["CoC Number"] === CocNumber
        });
        var data = [
            {
                "Measures": "Sheltered Homeless",
                "Count": filterData.filter(function (d) { return d["Measures"] === "Sheltered Homeless" })[0].Count
            },
            {
                "Measures": "Unsheltered Homeless",
                "Count": filterData.filter(function (d) { return d["Measures"] === "Unsheltered Homeless" })[0].Count
            }
        ];

        var arc = g.selectAll("arc").data(pie(data)).enter().append("g");

        arc.append("path").attr("d", path).attr("fill", function (d) {
            return color(d.data.Count);
        });

        var label = d3.arc().outerRadius(radius).innerRadius(0);

        arc.append("text").attr("transform", function (d) {
            return "translate(" + label.centroid(d) + ")";
        })
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d.data.Measures + ":" + d.data.Count;
            })
    });
}
function ClearPie(data) {
    d3.select("#pieGraph svg").remove();
}