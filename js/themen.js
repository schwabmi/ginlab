// https://www.d3-graph-gallery.com/graph/streamgraph_template.html

var datearray = [];



// FIXME: select meaningful values
var width = 800;
var height = 500;

var vis_container = d3.select("#visualization_container");
var datapath = vis_container.attr("data-path")
console.log(datapath)
var svg = vis_container
    .append("svg")
    .attr("viewBox", "-10 0 " + (width+10) + " " + height)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g");

// Parse the Data
var stats = d3.select("#stats_container")

a = ["Autor*innen"]

d3.select("#selectButton")
    .selectAll('myOptions')
    .data(a)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button


d3.queue()
    .defer(d3.csv, datapath + "/data.csv")
    .defer(d3.json, datapath + "/streamgraph_author_stats.json")
    .defer(d3.json, datapath + "/streamgraph_bsdl_author_stats.json")
    .defer(d3.json, datapath + "/streamgraph_bsdl_author_urls_advanced.json")
    .await(function(error, data, streamgraph_author_stats, streamgraph_bsdl_author_stats, urls) {
        // List of groups = header of the csv files
        var keys = data.columns.slice(1)

        // x axis
        var x = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d.year; }))
            .range([ 0, width - 20]);
        svg.append("g")
            .attr("transform", "translate(0," + height * 0.90 + ")")
            .call(d3.axisBottom(x).tickSize(-height * .7).tickValues([1985, 1995, 2005, 2015]).tickFormat(d3.format("d")))
            .select(".domain").remove()

        // x axis label
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("y", height - 20)
            .attr("x", width / 2)
            .text("Jahr");

        // y axis
        var y = d3.scaleLinear()
            .domain([-12000, 12000])
            .range([ height, 10 ]);

        // palette
        var color = d3.scaleOrdinal()
            .domain(keys)
            .range(d3.schemeDark2);

        // stack the data?
        var stackedData = d3.stack()
            .offset(d3.stackOffsetSilhouette)
            .keys(keys)(data);

        var div = d3.select(".stats")
        var div_background = d3.select(".tooltip_bg")

        // Three functions that change the tooltip when user hover / move / leave a cell
        var mouseover = function(d,i) {// Tooltip.style("opacity", 1)
        }

        var clearbutton = function(d,i) {
            d3.select("#selectButton").selectAll("option").remove();
            d3.select("#url_p").html("<h2>Publikationen zur ausgewählten Autor*in</h2>").style("opacity", 0.5)
        }


        var mouseclick = function(d,i) {
            frozen = !frozen;
            if (frozen == false) clearbutton(d,i);
            grp = keys[i]
            mousex = d3.mouse(this);
            mousex = mousex[0];
            text_color = color(d.key)
            var invertedx = parseInt(x.invert(mousex));

            div_background.style("background-color", text_color)

            stats.html(function () {
                var result = ""
                for (var key in streamgraph_bsdl_author_stats[invertedx][grp]) {
                    // s = "<li>" + key + ":\t" + streamgraph_author_stats[invertedx][key] + "</li>"
                    s_bdsl = "<li class='authors'> <a href='#'>" + key + ":\t" + streamgraph_bsdl_author_stats[invertedx][grp][key] + "</a></li>"
                    result = result.concat(s_bdsl)
                }
                return "<h2>Anzahl Publikationen</h2><ul>"
                    + "<li>Jahr:\t" + invertedx + "</li>"
                    + "<li>BDSL-Kategorie: " + grp + "</li>"
                    + "<li>Anzahl Publikationen:\t" + d[invertedx - 1984]["data"][grp] + "</li></ul>"
                    + "<h2>Top 10 Primärautor*innen</h2><ul>" + result + "</ul>"
            })
            author_keys = Object.keys(streamgraph_bsdl_author_stats[invertedx][grp])
            console.log("ak", author_keys)
            d3.selectAll('.authors')
            .on("click", function(d,i ) {
                update(author_keys[i])
                d3.selectAll('.authors').style("opacity", .5)
                d3.select(this).style("opacity", 1)
            })


            d3.selectAll(".myArea").style("opacity", .2)
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
            d3.selectAll(".myDots").style("opacity", .2)
            d3.selectAll(".myDots_label").style("opacity", .3)
            j=i+1
            labels = d3.selectAll(".myDots_label")
            // console.log(labels["_groups"][0][1])
            d3.select("circle:nth-child("+j+")").style("opacity", 1)
            d3.select(labels["_groups"][0][i]).style("opacity", 1)


        }


        var mouseenter = function(d,i) {
            if (frozen == true) {
                frozen = false;
            }
            clearbutton(d,i);
        }


        var mousemove = function(d,i) {
            grp = keys[i]
            mousex = d3.mouse(this);
            mousex = mousex[0];
            text_color = color(d.key)
            var invertedx = parseInt(x.invert(mousex));
            if(!frozen) {
                div_background.style("background-color", text_color)
                // div.html("<h3>Statistiken</h3>"
                //          + "Jahr:\t" + invertedx + "</br>"
                //          + "Anzahl Publikationen:\t" + d[invertedx - 1980]["data"][grp] + "</br>"
                //          + "BDSL-Kategorie: " + grp
                //         )

                stats.html(function () {
                    var result = ""
                    for (var key in streamgraph_bsdl_author_stats[invertedx][grp]) {
                        // s = "<li>" + key + ":\t" + streamgraph_author_stats[invertedx][key] + "</li>"
                        s_bdsl = "<li class='authors'> <a href='#'>" + key + ":\t" + streamgraph_bsdl_author_stats[invertedx][grp][key] + "</a></li>"
                        result = result.concat(s_bdsl)

                    }
                    return "<h2>Anzahl Publikationen</h2><ul>"
                        + "<li>Jahr:\t" + invertedx + "</li>"
                        + "<li>BDSL-Kategorie: " + grp + "</li>"
                        + "<li>Anzahl Publikationen:\t" + d[invertedx - 1984]["data"][grp] + "</li></ul>"
                        + "<h2>Top 10 Primärautor*innen</h2><ul>" + result + "</ul>"
                    })
                    .style("opacity", 1)

                author_keys = Object.keys(streamgraph_bsdl_author_stats[invertedx][grp])
                d3.selectAll(".myArea").style("opacity", .2)
                d3.select(this)
                    .style("stroke", "black")
                    .style("opacity", 1)
                d3.selectAll(".myDots").style("opacity", .2)
                d3.selectAll(".myDots_label").style("opacity", .3)
                j=i+1
                labels = d3.selectAll(".myDots_label")
                // console.log(labels["_groups"][0][1])
                d3.select("circle:nth-child("+j+")").style("opacity", 1)
                d3.select(labels["_groups"][0][i]).style("opacity", 1)
            }
        }

        function update(selectedGroup) {
            text = d3.select("#stats_container").text()
            year = text.match("[0-9]{4}")[0];
            category = text.match(".*BDSL-Kategorie: (.*)Anzahl")[text.match(".*BDSL-Kategorie: (.*)Anzahl").length -1];
            d3.select("#url_p")
                .html(function () {
                    var result = "<h2>Publikationen zur ausgewählten Autor*in</h2><ul>"
                    for (i = 0; i < urls[year][category][selectedGroup].length; i++) {
                        url = "http://www.bdsl-online.de/BDSL-DB/suche/Titelaufnahme.xml?erg=0&Anzeige=10&Sprache=de&contenttype=text/html&Skript=titelaufnahme&Publikation_ID=" + urls[year][category][selectedGroup][i][0]
                        title = urls[year][category][selectedGroup][i][1]
                        author = urls[year][category][selectedGroup][i][2]
                        link = '<li><a href=' + url + '>' + title + "</a> - " + author + '</li>'
                        result += link
                    }
                    return result + "</ul>"
                })
                .style("opacity", 1)
        }
        d3.select("#selectButton").on("change", function() {
            // recover the option that has been chosen
            var selectedOption = d3.select(this).property("value")
            // run the updateChart function with this selected option
            update(selectedOption)
        })


        var mouseleave = function(d) {
            if (!frozen) {
                d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
                d3.selectAll(".myDots").style("opacity", 1)
                d3.selectAll(".myDots_label").style("opacity", 1)
                d3.select(".tooltip_bg").style("background-color", "white")
            }
        }

        // Area generator
        var area = d3.area()
            .x(function(d) { return x(d.data.year); })
            .y0(function(d) { return y(d[0]); })
            .y1(function(d) { return y(d[1]); })

        // Show the areas
        var frozen = false;
        svg
            .selectAll("mylayers")
            .data(stackedData)
            .enter()
            .append("path")
            .attr("class", "myArea")
            .style("fill", function(d) { return color(d.key); })
            .attr("d", area)
            .on("click", mouseclick)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
        svg.on("mouseenter", mouseenter);

        var legend = d3.select("#legend")

        legend.selectAll("mydots")
            .data(keys)
            .enter()
            .append("circle")
            .attr("class", "myDots")
            .attr("cx", 10)
            .attr("cy", function(d,i){ return (keys.length-i-1)*25+10}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", function(d){ return color(d)})
        legend.selectAll("mydots")
            .data(keys)
            .enter()
            .append("text")
            .attr("class", "myDots_label")
            .attr("x", 20)
            .attr("y", function(d,i){
                return (keys.length-i-1)*25+15}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return color(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
    })
