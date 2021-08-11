var vis_container = d3.select("#visualization_container");
var datapath = vis_container.attr("data-path");
var width = 800;
var height = 500;


Promise.all([
    d3.csv(datapath + "/gender_stats.csv"),
    d3.json(datapath + "/gender_stats2.json"),
    ]
).then(d => chart(d))

function chart(datasets) {
    var data = datasets[0]
    var keys = data.columns.slice(1);
    var bisectDate = d3.bisector(d => d.date).left;



    margin = {top: 5, right: 5, bottom: 15, left: 35};
    var svg = vis_container
        .append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g");

    var x = d3.scaleTime()
    .rangeRound([margin.left, width - margin.right])
    .domain(d3.extent(data, d => d.date))

    var y = d3.scaleLinear()
    .rangeRound([height - margin.bottom, margin.top]);

    // var z = d3.scaleOrdinal(d3.schemeCategory10);
    var z = d3.scaleOrdinal(["orange", "blue"]);

    var line = d3.line()
    .curve(d3.curveCardinal)
    .x(d => x(d.date))
    .y(d => y(d.degrees));

    svg.append("g")
    .attr("class","x-axis")
    .attr("transform", "translate(0," + (height * 0.9) + ")")
    .call(d3.axisBottom(x).tickFormat(d3.format('0')));

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(y).tickFormat(d3.format('s')));
    // function (d) {
    //         if (d === 0) return ''; // No label for '0'
    //         else if (d < 0) d = -d; // No nagative labels
    //         return d;
    //     }));

    // ;


    var focus = svg.append("g")
    .attr("class", "focus")
    .style("display", "none");

    focus.append("line")
    .attr("class", "lineHover")
    .style("stroke", "black")
    .style("fill", "black")
    .attr("stroke-width", 1)
    .style("shape-rendering", "crispEdges")
    .style("opacity", 0.5)
    .attr("y1", -height)
    .attr("y2",0);

    focus.append("text").attr("class", "lineHoverDate")
    .attr("text-anchor", "middle")
    .attr("font-size", 12);
    console.log("focus", focus)

    var overlay = svg.append("rect")
    .attr("class", "overlay")
    .attr("x", margin.left)
    .attr("width", width - margin.right - margin.left)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all");

    var e1 = document.getElementById("selectbox");
    update(d3.select('#selectbox').property('value'), 0);

    function update(input, speed) {
        var copy = keys.filter(f => f.includes(input))
        var cities = copy.map(function(id) {
            return {
                id: id,
                values: data.map(d => {return {date: d.date, degrees: +d[id]}})
            };
        });
        y.domain([
        d3.min(cities, d => d3.min(d.values, c => c.degrees)),
        d3.max(cities, d => d3.max(d.values, c => c.degrees))
        ]).nice();

        svg.selectAll(".y-axis").transition()
        .duration(speed)
        .call(d3.axisLeft(y).tickSize(-width + margin.right + margin.left))

        var city = svg.selectAll(".cities")
        .data(cities);
        console.log("city",city)
        city.exit().remove();

        svg.selectAll(".dots")
        .attr("cy", function(d) { return y(0); })
        // console.log(d.id, z)
        city.enter().insert("g", ".focus").append("path")
        .attr("class", "line cities")
        .style("stroke", d => z(d.id))
        .style("fill", d => z(d.id))
        .style("opacity", .3)
        .merge(city)
        .transition().duration(speed)
        .attr("d", d => line(d.values))
        tooltip(copy);
    }

    function tooltip(copy) {
        var labels = focus.selectAll(".lineHoverText")
        .data(copy)

        labels.enter().append("text")
        .attr("class", "lineHoverText")
        .style("fill", d => z(d))
        .attr("text-anchor", "start")
        .attr("font-size",12)
        .attr("dy", (_, i) => 1 + i * 2 + "em")
        .merge(labels);

        var circles = focus.selectAll(".hoverCircle")
        .data(copy)

        circles.enter().append("circle")
        .attr("class", "hoverCircle")
        .style("fill", d => z(d))
        .attr("r", 2.5)
        .merge(circles);

        svg.selectAll(".overlay")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove)
        .on("click", mouseclick)

        function mouseclick() {
            var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
            console.log("x0",x0)
            console.log("i",i)
            console.log("d0", d0)
            console.log("d1",d1)
            console.log("d",d.date)
            if(toRemove){
                d3.select(toRemove).attr("r", 4).attr("fill", "black");
            }
            toRemove = this;
            d3.select(this).attr("r", 5).attr("fill", "orange");

            m = "male"+e1.value
            f = "female"+e1.value


            var names = datasets[1][d.date][e1.value.substring(1,e1.length)];
            var keynames = d3.keys(names)
            keynames.sort()
            var label_idx = keynames.indexOf("label");
            keynames.splice(label_idx, 1);
            var numbers = []
            var female_numbers = []
            var addnumbers = []
            var bdsl_labels = []

            for (i = 0; i < keynames.length; i++) {
                bdsl_labels[i] = datasets[1][d.date][e1.value.substring(1,e1.length)][keynames[i]]["label"]
                if (d3.keys(datasets[1][d.date][e1.value.substring(1,e1.length)][keynames[i]]).includes("male")) {
                    numbers[i] = datasets[1][d.date][e1.value.substring(1, e1.length)][keynames[i]]["male"]
                    addnumbers[i] = datasets[1][d.date][e1.value.substring(1, e1.length)][keynames[i]]["male"]
                }
                else{
                    numbers[i] = 0
                    addnumbers[i] = 0
                }
                if (d3.keys(datasets[1][d.date][e1.value.substring(1,e1.length)][keynames[i]]).includes("female")){
                    female_numbers[i] = datasets[1][d.date][e1.value.substring(1,e1.length)][keynames[i]]["female"]
                    addnumbers[i] = addnumbers[i] + datasets[1][d.date][e1.value.substring(1,e1.length)][keynames[i]]["female"]
                }
                else{
                    female_numbers[i] = 0
                }
            }



            div.transition()
                .duration(1000)
                .style("opacity", .9);

            category_stats = "<ul>"
            for (j = 0; j < keynames.length; j++) {
                var label = bdsl_labels[j]
                var female_count = female_numbers[j]
                var male_count = numbers[j]
                male_ratio = Math.round(100 * (male_count / (female_count + male_count)))
                female_ratio = Math.round(100 * (female_count / (female_count + male_count)))
                category_stats +=  '<li style="background:  linear-gradient(to right, rgb(255,165,0, 0.3) ' + male_ratio + '% , rgb(0,0,255,0.3) ' + female_ratio + '%)">' + label + ": " + male_count + " | " + female_count + "</li>"
            }
            category_stats += "</ul>"

            div.html(function() {
                if (e1.value.substring(1,e1.length) == "00"){
                    return("<h3>Statistiken</h3><ul><li>Jahr:   " + d.date + "</li><li>Kategorie:  " + e1.options[e1.selectedIndex].text + "</li>"
                      //  + '<li style="background-color: rgb(255,165,0, 0.3)"> Anzahl männliche Vornamen: ' + d[m] + "</li>"
                        + '<li style="background-color: rgb(255,165,0, 0.3)"> Anzahl männliche Vornamen: ' + d[m] + "</li>"
                        + '<li style="background:  linear-gradient(to right, rgb(255,165,0, 0.3) 0%, rgb(0,0,255,0.3) 0%)">  Anzahl weibliche Vornamen: ' + (-1 * d[f]) + "</li></ul>"
                        + "<br/>" + "<br/> <b>Hauptkategorien der BDSL</b>" + "<br/><br/>"
                        + category_stats)
                }
                else{
                    return(
                        "<h3> Statistiken</h3><ul><li>Jahr:   " + d.date + "</li><li>Kategorie:  " + e1.options[e1.selectedIndex].text + "</li>"
                        + '<li style="background-color: rgb(255,165,0, 0.3)"> Anzahl männliche Vornamen: ' + d[m] + "</li>"
                        + '<li style="background-color:  rgb(0,0,255,0.3)">  Anzahl weibliche Vornamen: ' + (-1 * d[f]) + "</li></ul>"
                        + "<br/>" + "<br/> <b>Unterkategorien der BDSL</b>" + "<br/><br/>"
                        + category_stats)
                }
            });

            if(toRemove_female){
                d3.selectAll(toRemove_female).style("opacity", 0);
            }
            svg.append("line")
                .attr("id", "vertical_line")
                .attr("x1", x(d.date))  //<<== change your code here
                .attr("y1", 0)
                .attr("x2", x(d.date))  //<<== and here
                .attr("y2", height)
                .style("stroke-width", 1.8)
                .style("stroke", "orange")
                .style("fill", "none")
                .style("opacity", .8);
            toRemove_female = "#vertical_line";
        };

        function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
            focus.select(".lineHover")
                .attr("transform", "translate(" + x(d.date) + "," + height + ")");
            focus.select(".lineHoverDate")
                .attr("transform",
                "translate(" + x(d.date) + "," + (height + margin.bottom) + ")")
                .text(d.date);

            focus.selectAll(".hoverCircle")
                .attr("cy", e => y(d[e]))
                .attr("cx", x(d.date));

            focus.selectAll(".lineHoverText")
                .attr("transform",
                "translate(" + (x(d.date)) + "," + height / 2.5 + ")")
                .text(function (e) {
                    if (e.substring(0, e.length - 3) === 'male') {
                        return "Männlich: " + Math.abs(parseInt(d[e]))
                    } else {
                        return "Weiblich: " + Math.abs(parseInt(d[e]))
                    }
                })
                x(d.date) > (width - width / 4)
                ? focus.selectAll("text.lineHoverText")
                .attr("text-anchor", "end")
                .attr("dx", -10)
                : focus.selectAll("text.lineHoverText")
                .attr("text-anchor", "start")
                .attr("dx", 10)
        };
    }
    var toRemove;
    var toRemove_female;
    var div = d3.select("body").select("#stats_container");

    d3.select("#selectbox")
        .on("change", function() {
           update(this.value, 1000);
        })
}
