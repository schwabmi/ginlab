// TODO: need to resize force-directed graph
var width = 800,
height = 800;
var vis_container = d3.select("#visualization_container");
var datapath = vis_container.attr("data-path");
var margin = {top: 5, right: 25, bottom: 20, left: 25};
var color = d3.scale.category20();
var force = d3.layout.force()
    .charge(-820)
    .linkDistance(500)
    .size([width, height]);
var x = d3.scale.linear()
    .domain([0, 12000])
    .range([550, 80])
    .clamp(true);

var brush = d3.svg.brush()
    .y(x)
    .extent([0, 0]);

var svg = vis_container.append("svg")
    .attr("width", width)
    .attr("height", height);

var links_g = svg.append("g");
var nodes_g = svg.append("g");
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + (50)  + ",0)")
    .call(d3.svg.axis()
    .scale(x)
    .orient("left")
    .tickFormat(function(d) { return d; })
    .tickSize(0)
    .tickPadding(18))
    .select(".domain")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "halo");

var slider = svg.append("g")
    .attr("class", "slider")
    .call(brush);

slider.selectAll(".extent,.resize")
    .remove();

var handle = slider.append("circle")
    .attr("class", "handle")
    .attr("transform", "translate(" + (50) + ",0)")
    .attr("r", 5);

svg.append("text")
    .attr("x", 120)
    .attr("y", 60)
    .attr("text-anchor", "end")
    .attr("font-size", "16px")
    .style("opacity", 0.5)
    .text("Schwellenwert")

d3.json(datapath + "/communities.json", function(error, graph) {
    if (error) throw error;
    graph.links.forEach(function(d,i){ d.i = i; });
    function brushed() {
        var value = brush.extent()[0];

        if (d3.event.sourceEvent) {
            value = x.invert(d3.mouse(this)[1]);
            brush.extent([value, value]);
        }
        handle.attr("cy", x(value));
        var threshold = value;
        var thresholded_links = graph.links.filter(function(d){ return (d.value > threshold);});

        force.links(thresholded_links);

        var link = links_g.selectAll(".link")
            .data(thresholded_links, function(d){ return d.i; });

        link.enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) { return Math.sqrt(d.value)/3; });

        link.exit().remove();

        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            texts.attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; });
        });
    force.start();
    }

    force.nodes(graph.nodes);

    var node = nodes_g.selectAll(".node")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", function(d) { return Math.sqrt(d.value) ; })
        .style("fill", function(d) { return color(d.group); })
        .call(force.drag);


    var texts  =svg.selectAll(".texts")
        .data(graph.nodes)
        .enter()
        .append("text")
        .attr("dx", 12)
        .attr("dy", "0.35em")
        .text(function(d){ return d.name; });

    brush.on("brush", brushed);

    slider
        .call(brush.extent([50 , 50]))
        .call(brush.event);

});
