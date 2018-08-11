import { scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { select, selectAll, event } from "d3-selection";
import { transition } from "d3-transition";
import { csv } from "d3-fetch";
import { nest } from "d3-collection";
import { easeLinear } from "d3-ease";
import { geoMercator, geoPath } from "d3-geo";
import neighborhoodsData from "../data/sf-neighborhoods.json";
import c3 from "c3";


const d3 = {
  scaleLinear,
  line,
  select,
  selectAll,
  transition,
  csv,
  nest,
  easeLinear,
  geoMercator,
  geoPath,
  get event() { return event; },
};

var width = 600,
  height = 600;

var svg = d3
  .select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

  // Define 'div' for tooltips
var div = d3.select("body")
.append("div")  // declare the tooltip div 
.attr("class", "mdl-tooltip mdl-tooltip--fancy")              // apply the 'tooltip' class
.style("position", "absolute")
.style("opacity", 0);                  // set the opacity to nil

var projection = d3
  .geoMercator()
  .scale(1)
  .translate([0, 0])
  .precision(0);
var path = d3.geoPath().projection(projection);
var bounds = path.bounds(neighborhoodsData);

var xScale = width / Math.abs(bounds[1][0] - bounds[0][0]);
var yScale = height / Math.abs(bounds[1][1] - bounds[0][1]);
var scale = xScale < yScale ? xScale : yScale;

var transl = [
  (width - scale * (bounds[1][0] + bounds[0][0])) / 2,
  (height - scale * (bounds[1][1] + bounds[0][1])) / 2
];
projection.scale(scale).translate(transl);



svg
  .selectAll("path")
  .data(neighborhoodsData.features)
  .enter()
  .append("path")
  .attr("d", path)
  .attr("data-id", function(d) {
    return d.id;
  })
  .attr("data-name", function(d) {
    return d.properties.name;
  })
  .style("fill", "#FB5B1F")
  .style("stroke", "#ffffff")
  .on('mouseover', function(d){
    var nodeSelection = d3.select(this).style("opacity" , 0.2);
    div.transition()
      .duration(200)
      .style("opacity", .9);
    div.html(
      '<p style="color:white;padding:7px;">' + // The first <a> tag
      d.properties.id +
      "</p>")
      .style("left", (d3.event.pageX + 30) + "px")
      .style("top", (d3.event.pageY + 30) + "px");
  })
  .on('mousemove', function(d){
    var nodeSelection = d3.select(this).style("opacity" , 0.2);
    div.transition()
      .duration(1)
      .style("opacity", .9)
      .style("left", (d3.event.pageX + 30) + "px")
      .style("top", (d3.event.pageY + 30) + "px");
  })
  .on('mouseout', function(d){
    var nodeSelection = d3.select(this).style("opacity" , 1);
    div.transition()
    .duration(500)
    .style("opacity", 0);
  })


//Chart
var chart = c3.generate({
  bindto: '#chart',
  data: {
    columns: [
      ['data1', 30, 200, 100, 400, 150, 250],
      ['data2', 50, 20, 10, 40, 15, 25]
    ]
  }
});