// https://observablehq.com/@hadi/demographic-map-of-germany@797

var width = 600;
var height = 800;
var vis_container = d3.select("#visualization_container");
var datapath = vis_container.attr("data-path");
var svg = vis_container
    .append("svg")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .style("background", "radial-gradient(#081f2b 0%, #061616 50%)");

// Parse the Data
export default function define(runtime, observer) {
    const main = runtime.module();
    const fileAttachments = new Map([
        ["germany.json",new URL(datapath + "/bubble_map/germany.json", import.meta.url)],
        ["Merged_City_geo_pubnumber.csv",new URL(datapath + "/bubble_map/city_data.csv",import.meta.url)],
        ["urls_per_city.json",new URL(datapath + "/bubble_map/urls_per_city.json",import.meta.url)],
        ["urls_per_keyword.json",new URL(datapath + "/bubble_map/urls_per_keyword.json",import.meta.url)]
    ]);
    main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
    main.variable(observer("State_chart_bubble")).define("State_chart_bubble", ["d3","width","height","topojson","germany","path","State_data","radius","urls_per_city"], function(d3,width,height,topojson,germany,path,State_data,radius,urls_per_city, urls_per_keyword)
{
  svg // area's background color
      .append("path")
      .datum(topojson.feature(germany, germany.objects.states))
      .attr("fill", '#E7E7E8')
      .attr("d", path);

  svg // Borders
    .append("path")
    .datum(topojson.mesh(germany, germany.objects.states, (a, b) => a == b))
    .attr("fill", "none")
    .attr("stroke", "#808080")
    .attr("stroke-width", 0.6)
    .attr("stroke-linejoin", "round")
    .attr("d", path);

  const a = ["Schlagwörter"]

  d3.select("#selectButton")
      .selectAll('myOptions')
      .data(a)
      .enter()
      .append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button


  svg
    .append("g")
    .attr("fill", "#A04173")
    .attr("fill-opacity", 0.5)
    .attr("stroke", "#A04173")
    .attr("stroke-width", 0.9)
    .selectAll("circle")
    .data(
      topojson
        .feature(germany, germany.objects.places)
        .features.map(d => ((d.value = State_data.get(d.properties.name)), d))
        .sort((a, b) => b.value - a.value)
    )
    .join("circle")
    .attr("transform", d => `translate(${path.centroid(d)})`)
    .attr("r", d => radius(d.value))
    .append("title")

  return svg.node();
}
);
  main.variable(observer("tooltip")).define("tooltip", ["State_chart_bubble","urls_per_city","urls_per_keyword", "d3","format"], function(State_chart_bubble,urls_per_city,urls_per_keyword, d3,format)
{
  State_chart_bubble;
  const tooltip = d3
    .select("body")
    .append("h3")
    .attr("class", "svg-tooltip")
    .style("background", "#fff")
    .style("position", "absolute")
    .style("visibility", "hidden")//
    .style("width", "200px")
    .style("height", "130px")
    .style("margin-left", "30px")
    .style("margin-top", "40px")
    .style("opacity", 0.8);
  // select all rect

  function update(selectedGroup) {
    let text = d3.select("#keyword_container").html()
    let cityname = text.match("<h3>(.*?)</h3>")[text.match("<h3>(.*?)</h3>").length -1];
    d3.select("#keyword_links_container")
        // .html("§test")
        .html(function () {
          var result = "<b>Publikationen/Hochschulschriften am ausgewählten Standort nach Schlagwörtern</b><br><br><ul>"
          // console.log("prop name",properties.name)
          // console.log(urls_per_keyword[year][category][selectedGroup])
          for (let i = 0; i < urls_per_keyword[cityname][selectedGroup]["urls"].length; i++) {
            let url = "http://www.bdsl-online.de/BDSL-DB/suche/Titelaufnahme.xml?erg=0&Anzeige=10&Sprache=de&contenttype=text/html&Skript=titelaufnahme&Publikation_ID=" + urls_per_keyword[cityname][selectedGroup]["urls"][i][0]
            let title = urls_per_keyword[cityname][selectedGroup]["urls"][i][1]
            let author = urls_per_keyword[cityname][selectedGroup]["urls"][i][2]
            let link = '<li><a href=' + url + '>' + title + "</a> - " + author + '</li>'
            result += link
            // result = result.concat(s_bdsl)
          }
          return result + "</ul>"
        })
  }



  d3.select("#selectButton").on("change", function() {
    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value")
    console.log("selectedOption", selectedOption)
    // console.log("prop name",d.properties.name)
    // run the updateChart function with this selected option
    update(selectedOption)
  })

  let frozen = false;

  d3.selectAll("circle")
    .on("mouseover", function(d) {
      // change the selection style
      d3.select(this)
        .attr('stroke-width', '1')
        .attr("stroke", "black");
      // make the tooltip visible and update its text
      tooltip
        .style("visibility", "visible")
          .style("background", "none")
          .style("font-size", "20px")
          .html(
              `${d.properties.name}: ${format(d.value)}`
          )

    })
    .on("mousemove", function() {
      tooltip
        .style("top", d3.event.pageY - 10 + "px")
        .style("left", d3.event.pageX + 10 + "px");
    })
    .on("mouseout", function() {
      // change the selection style
      d3.select(this).attr('stroke-width', '0');

      tooltip.style("visibility", "hidden");

    })

  //


    .on("click", function(d) {
      console.log("test")
      const cityname=d.properties.name
      d3.select("#links_container")
      .selectAll("*").remove();
      d3.select("#links_container")
      .append('div')
      .html(function(){
        let result="<b>Alle Publikationen/Hochschulschriften am ausgewählten Standort</b><br><br><ul>"
          for (let i = 0; i < urls_per_city[cityname].length; i++) {
            let url = "http://www.bdsl-online.de/BDSL-DB/suche/Titelaufnahme.xml?erg=0&Anzeige=10&Sprache=de&contenttype=text/html&Skript=titelaufnahme&Publikation_ID=" +urls_per_city[cityname][i][0]
            let link = '<li><a href=' + url + '>' + urls_per_city[cityname][i][1] + "</a> - " + urls_per_city[cityname][i][2] + '</li>'
            result += link
          }
          return result+ "</ul>"
      });
      d3.select("#keyword_container")
          .html("test")
          .html(function(){
            console.log("test2")
            console.log(urls_per_keyword[cityname])
            let keys = Object.keys(urls_per_keyword[cityname])
            console.log(keys)
            let result="<h3>" + cityname + "</h3><b>Top 10 Schlagwörter</b><br><ul>"
            for (let i = 0; i < keys.length; i++) {
              let key = '<li>'+ keys[i] + ': ' + urls_per_keyword[cityname][keys[i]]['count'] + '</li>'
              result += key
            }
            return result+ "</ul>"
          });
      let keywords_keys = Object.keys(urls_per_keyword[cityname])
      keywords_keys.unshift("Schlagwörter")
      // keywords_keys
      d3.select("#selectButton")
          .selectAll("option").remove();
      d3.select("#selectButton")
          .selectAll('myOptions')
          .data(keywords_keys)
          .enter()
          .append('option')
          .text(function (d) {
            return d;
          }) // text showed in the menu
          .attr("value", function (d) {
            return d;
          }) // corresponding value returned by the button

      d3.select("#keyword_links_container")
          .html("")
    })
}
);
  main.variable(observer("State_data")).define("State_data", ["d3","FileAttachment"], async function(d3,FileAttachment){return(
new Map(
  d3.csvParse(
    await FileAttachment('Merged_City_geo_pubnumber.csv').text(),
    ({ City, Latitude,Longitude,Number_publish }) => [City, Number_publish]
  )
)
)});
main.variable(observer("urls_per_city")).define("urls_per_city", ["FileAttachment"], function(FileAttachment){return(
FileAttachment('urls_per_city.json').json()
)});
  main.variable(observer("urls_per_keyword")).define("urls_per_keyword", ["FileAttachment"], function(FileAttachment){return(
FileAttachment('urls_per_keyword.json').json()
)});
  main.variable(observer("germany")).define("germany", ["FileAttachment"], function(FileAttachment){return(
FileAttachment('germany.json').json()
)});
  main.variable(observer("format")).define("format", ["d3"], function(d3){return(
d3.format(",.0f")
)});
  main.variable(observer("radius")).define("radius", ["d3","State_data"], function(d3,State_data){return(
d3.scaleSqrt([0, d3.quantile( [...State_data.values()], 0.985)], [0, 1.2])
)});
  main.variable(observer("path")).define("path", ["d3","projection"], function(d3,projection){return(
d3.geoPath().projection(projection)
)});
  main.variable(observer("projection")).define("projection", ["d3"], function(d3){return(
d3
  .geoConicConformal()
  .scale(4000)
  .center([14.02, 53.02])
)});
    main.variable(observer("width")).define("width", function(){return(
        550
)});
    main.variable(observer("height")).define("height", function(){return(
        650
)});
  main.variable(observer("topojson")).define("topojson", ["require"], function(require){return(
require("topojson-client@3")
)});
  main.variable(observer("annotations")).define("annotations", function(){return(
[
  {
    note: {
      label: "356 Fälle"
    },
    connector: {
      end: "dot",
      type: "line"
      //can also add a curve type, e.g. curve: d3.curveStep
      //points: [[30, 4], [50, 6]]
    },
    x: 128,
    y: 429,
    dy: -100,
    dx: -80
  }
].map(d => {
  d.color = "#E8336D";
  return d;
})
)});
  main.variable(observer("makeAnnotations")).define("makeAnnotations", ["d3_annotation","annotations"], function(d3_annotation,annotations){return(
d3_annotation
  .annotation()
  .type(d3_annotation.annotationLabel)
  .annotations(annotations)
)});
  main.variable(observer("d3_annotation")).define("d3_annotation", ["require"], function(require){return(
require("https://cdnjs.cloudflare.com/ajax/libs/d3-annotation/2.5.1/d3-annotation.min.js")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
