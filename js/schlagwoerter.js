// set the dimensions and margins of the graph
// var margin = {top: 60, right: 230, bottom: 50, left: 50},
var width = 1500;// - margin.left - margin.right;
var height = 500;// - margin.top - margin.bottom;
var vis_container = d3.select("#visualization_container");
var datapath = vis_container.attr("data-path");
// var legend_svg = d3.select("#legend")
// Adds the svg canvas
var svg = vis_container
    .append("svg")
    .attr("viewBox", "-50 0 " + (width+80) + " " + (height+50))
    .attr("preserveAspectRatio", "xMidYMid")
    .append("g");
var parseDate = d3.time.format("%Y").parse;

// Get the data
d3.csv(datapath + "/keyword_data_alt.csv", function(error, data) {
    data.forEach(function (d) {
        d.date = parseDate(d.date);
        d.price = +d.price;
    });
    // axis
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);
    x.domain(d3.extent(data, function (d) {
        return d.date;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.price;
    })]);
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(10);
    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(10);
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .attr("font-size", 20)
        // .attr("stroke", "grey")
        // .attr("fill", "none")
        // .attr("stroke-width",1)
        // .attr("shape-rendering", "crispEdges")
        .call(xAxis);
    svg.append("g")
        .attr("class", "y axis")
        .attr("font-size", 20)
        .call(yAxis);

    // Define the line
    var priceline = d3.svg.line()
        .x(function (d) {
            return x(d.date);
        })
        .y(function (d) {
            return y(d.price);
        });

    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("y", height + 40)
        .attr("x", width / 2)
        .attr("font-size", 25)
        .text("Jahr");





    // Nest the entries by symbol
    var dataNest = d3.nest()
        .key(function (d) {
            return d.symbol;
        })
        .entries(data);
    console.log(dataNest[0])

    var color = d3.scale.category10();   // set the colour scale

    legendSpace = width / dataNest.length; // spacing for the legend

    ////////////////////////
    var ul_all = d3.select("#legend_div").append('ul').attr("id", "all");
    ul_all.append("li").html('<input type="checkbox" id="visibility_all" unchecked> <input type="checkbox" id="highlight_all"> Alle')
        .style("list-style", "none")
    var ul = d3.select("#legend_div").append('ul').attr("id", "words");
    ul.selectAll('li')
        .data(dataNest)
        .enter()
        .append('li')
        .attr("class", "keywords")
        .html(function (d) {
            return '<input type="checkbox" class="visibility" unchecked> <input type="checkbox" class="highlight"> ' + d.key
        })
        .style("list-style", "none")
        .style("color", function (d) { // Add the colours dynamically
            return d.color = color(d.key);
        });
    d3.selectAll(".visibility")[0][0].checked = true
    d3.selectAll(".highlight")[0][0].checked = true
    d3.selectAll(".visibility")[0][1].checked = true
    d3.selectAll(".visibility")[0][2].checked = true


    // Loop through each symbol / key
    dataNest.forEach(function (d, i) {
        //
        svg.append("path")
            .attr("class", "line")
            .style("stroke", function () { // Add the colours dynamically
                return d.color = color(d.key);
            })
            .style("stroke-width", 3)
            .attr("id", 'tag' + d.key.replace(/\s+/g, '')) // assign ID
            .attr("d", priceline(d.values))
            .attr("fill", "none")
            .style("opacity", 0);
    });

    d3.select("#tag" + dataNest[0].key.replace(/\s+/g, ''))
        .transition().duration(100)
        .style("opacity", 1)
        .style("stroke-width", 10);
    d3.select("#tag" + dataNest[1].key.replace(/\s+/g, ''))
        .transition().duration(100)
        .style("opacity", 1);
    d3.select("#tag" + dataNest[2].key.replace(/\s+/g, ''))
        .transition().duration(100)
        .style("opacity", 1);


    d3.selectAll(".visibility").on("change",update_h);
    function update_h(d,i) {
        console.log("this",this,d,i)
        cb = d3.selectAll(".visibility")[0][i];
        obj = dataNest[i]
        if (cb.checked) {
            newOpacity = 1
            d3.select("#tag" + obj.key.replace(/\s+/g, ''))
                .transition().duration(100)
                .style("opacity", newOpacity);
        } else {
            d3.selectAll(".highlight")[0][i].checked = false
            newOpacity = 0
            d3.select("#tag" + obj.key.replace(/\s+/g, ''))
                .transition().duration(100)
                .style("opacity", newOpacity)
                .style("stroke-width", 3);

        }
    };

    d3.selectAll("#visibility_all").on("change",update_v_all);
    function update_v_all(d,i) {
        vis_checkboxes = d3.selectAll(".visibility")
        high_checkboxes = d3.selectAll(".highlight")
        if (this.checked) {

            newOpacity = 1
            for (j = 0; j < dataNest.length; j++) {
                vis_checkboxes[0][j].checked = true
                d3.select("#tag" + dataNest[j].key.replace(/\s+/g, ''))
                    .transition().duration(100)
                    .style("opacity", newOpacity)
            }
        } else {
            d3.select("#highlight_all")[0][0].checked = false
            newOpacity = 0
            for (j = 0; j < dataNest.length; j++) {
                vis_checkboxes[0][j].checked = false
                high_checkboxes[0][j].checked = false
                d3.select("#tag" + dataNest[j].key.replace(/\s+/g, ''))
                    .transition().duration(100)
                    .style("opacity", newOpacity)
                    .style("stroke-width", 3);
            }
        }
    };

    d3.selectAll("#highlight_all").on("change",update_h_all);
    function update_h_all(d,i) {
        vis_checkboxes = d3.selectAll(".visibility")
        high_checkboxes = d3.selectAll(".highlight")
        if (this.checked) {
            d3.select("#visibility_all")[0][0].checked = true
            console.log(d3.select("#visibility_all")[0][0].checked)
            for (j = 0; j < dataNest.length; j++) {
                high_checkboxes[0][j].checked = true
                vis_checkboxes[0][j].checked = true
                d3.select("#tag" + dataNest[j].key.replace(/\s+/g, ''))
                    .transition().duration(100)
                    .style("stroke-width", 10)
                    .style("opacity", 1)
            }
        } else {
            // d3.selectAll(".highlight").checked = false
            newOpacity = 0
            for (j = 0; j < dataNest.length; j++) {
                // vis_checkboxes[0][j].checked = false
                high_checkboxes[0][j].checked = false
                d3.select("#tag" + dataNest[j].key.replace(/\s+/g, ''))
                    .transition().duration(100)
                    .style("stroke-width", 3);
            }
        }
    };

    d3.selectAll(".highlight").on("change",update_v);
    function update_v(d,i) {
        console.log("this",this,d,i)
        cb = d3.selectAll(".highlight")[0][i];
        obj = dataNest[i]
        console.log("datanest",obj)
        console.log("highlight check", cb.checked)
        if (cb.checked) {
            d3.selectAll(".visibility")[0][i].checked = true
            // this.checked = true
            newOpacity = 10
            d3.select("#tag" + obj.key.replace(/\s+/g, ''))
                .transition().duration(100)
                .style("opacity", 1)
                .style("stroke-width", newOpacity);
        } else {
            newOpacity = 3
            d3.select("#tag" + obj.key.replace(/\s+/g, ''))
                .transition().duration(100)
                .style("stroke-width", newOpacity);
        }
    };
})
