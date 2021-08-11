// set the dimensions and margins of the graph
var margin = {top: 60, right: 230, bottom: 50, left: 50},
width = 2000 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;
var vis_container = d3.select("#visualization_container");
var datapath = vis_container.attr("data-path");
// append the svg object to the body of the page
var svg = d3.select("#visualization_container")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
"translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv(datapath + "/keyword_data.csv", function(data) {


    // List of groups = header of the csv files
    var keys = data.columns.slice(1)

    // color palette
    var color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeSet2);

    //stack the data?
    var stackedData = d3.stack()
    .keys(keys)
    (data)



    //////////
    // AXIS //
    //////////

    // Add X axis
    var x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.year; }))
    .range([ 0, width ]);
    var xAxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(5))

    // Add X axis label:
    svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height+40 )
    .text("Time (year)");

    // Add Y axis label:
    svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", 0)
    .attr("y", -20 )
    .text("# of baby born")
    .attr("text-anchor", "start")

    // Add Y axis
    var y = d3.scaleLinear()
    .domain([0, 10000])
    .range([ height, 0 ]);
    svg.append("g")
    .call(d3.axisLeft(y).ticks(5))



    //////////
    // BRUSHING AND CHART //
    //////////

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width )
    .attr("height", height )
    .attr("x", 0)
    .attr("y", 0);

    // Add brushing
    var brush = d3.brushX()                 // Add the brush feature using the d3.brush function
    .extent( [ [0,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function

    // Create the scatter variable: where both the circles and the brush take place
    var areaChart = svg.append('g')
    .attr("clip-path", "url(#clip)")

    // Area generator
    var area = d3.area()
    .x(function(d) { return x(d.data.year); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); })

    // Show the areas
    areaChart
    .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", function(d) {
            console.log("d in mylayers", d.key)
            return "myArea " + d.key })
        .style("fill", function(d) { return color(d.key); })
        .attr("d", area)

    // Add the brushing
    areaChart
    .append("g")
    .attr("class", "brush")
    .call(brush);

    var idleTimeout
    function idled() { idleTimeout = null; }

    // A function that update the chart for given boundaries
    function updateChart() {

    extent = d3.event.selection

    // If no selection, back to initial coordinate. Otherwise, update X axis domain
    if(!extent){
    if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
    x.domain(d3.extent(data, function(d) { return d.year; }))
    }else{
    x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
    areaChart.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
    }

    // Update axis and area position
    xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(5))
    areaChart
    .selectAll("path")
    .transition().duration(1000)
    .attr("d", area)
    }


    // What to do when one group is hovered
    var highlight = function(d){
        // console.log("d",".myArea " + d)
        d = d.replaceAll(" ", ".")
        // reduce opacity of all groups
        d3.selectAll(".myArea").style("opacity", .1)
        console.log(d3.selectAll(".myArea"))
        // expect the one that is hovered
        d3.select("."+d).style("opacity", 1)
    }

    // And when it is not hovered anymore
    var noHighlight = function(d){
        d3.selectAll(".myArea").style("opacity", 1)
    }
        // .on('mousemove', drawTooltip)
        // .on('mouseout', removeTooltip);
    // var focus = svg.append("g")
    //     .attr("class", "focus")
    //     .style("display", "red")
    //     .append("circle")
    //     .attr("r", 5);
    //
    // focus.append("rect")
    //     .attr("class", "tooltip")
    //     .attr("width", 100)
    //     .attr("height", 50)
    //     .attr("x", 10)
    //     .attr("y", -22)
    //     .attr("rx", 4)
    //     .attr("ry", 4);
    //
    // focus.append("text")
    //     .attr("class", "tooltip-date")
    //     .attr("x", 18)
    //     .attr("y", -2);
    //
    // focus.append("text")
    //     .attr("x", 18)
    //     .attr("y", 18)
    //     .text("Likes:");
    //
    // focus.append("text")
    //     .attr("class", "tooltip-likes")
    //     .attr("x", 60)
    //     .attr("y", 18);
    // svg.append("rect")
    //     .attr("class", "overlay")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .style("fill", "red")
    //     // .on("mouseover", function() { focus.style("display", null); })
    //     // .on("mouseout", function() { focus.style("display", "none"); })
    //     .on("mousemove", mousemove);
    // function mousemove() {
    //     var x0 = x.invert(d3.mouse(this)[0]),
    //         i = bisectDate(data, x0, 1),
    //         d0 = data[i - 1],
    //         d1 = data[i],
    //         d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    //     focus.attr("transform", "translate(" + x(d.date) + "," + "y(d.likes)" + ")");
    //     focus.select(".tooltip-date").text("dateFormatter(d.date)");
    //     focus.select(".tooltip-likes").text("formatValue(d.likes)");
    // }

    // Add one dot in the legend for each name.
    var size = 20
    svg.selectAll("myrect")
        .data(keys)
        .enter()
        .append("rect")
        .attr("x", 1400)
        .attr("y", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", 1400 + size*1.2)
        .attr("y", function(d,i){ return 10 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

})