import { scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { select, selectAll } from "d3-selection";
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
  geoPath
};

var width = 600,
  height = 600;

var svg = d3
  .select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

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
  .style("stroke", "#ffffff");



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