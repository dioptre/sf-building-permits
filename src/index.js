import { scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { select, selectAll } from "d3-selection";
import { transition } from "d3-transition";
import { csv } from "d3-fetch";
import { nest } from "d3-collection";
import { easeLinear } from "d3-ease";
import { geoMercator, geoPath } from "d3-geo";
import neighborhoodsData from "../data/sf-neighborhoods.json";
import input_data from "../data/Permits_Completed_By_Year_Zip-2.json";

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

var years = [2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010];
var permitTypes = [
  "total",
  "additions alterations or repairs",
  "demolitions",
  "grade or quarry or fill or excavate",
  "new construction",
  "new construction wood frame",
  "otc alterations permit",
  "sign - erect",
  "wall or painted sign"
];
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

console.log(path);

var neighborhoods = svg
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
  .style("stroke", "#aaaaaa");

d3.selectAll("path").each(function(d, i) {
  d3.select(this).style("data-asdf", d.id);
});

function redraw(year, permit_type) {
  // Normalization
  var permit_values = []; // for every given permit type
  for (var zipcode in input_data[year]) {
    permit_values.push(input_data[year][zipcode][permit_type]);
  }
  var max_permits = Math.max.apply(null, permit_values);
  var min_permits = Math.min.apply(null, permit_values);
  // .reduce((a, b) => a + b, 0);

  // Filter input by year first
  var aggregated = {};
  for (var zipcode in input_data[year]) {
    aggregated[zipcode] =
      (input_data[year][zipcode][permit_type] - min_permits) / max_permits; //normalization
  }

  d3.selectAll("path").each(function(d, i) {
    var new_color = aggregated[d.id];
    console.log(new_color);
    d3.select(this).style("fill", `rgba(255,91,72,${new_color})`);
  });
  d3.select(".current-year").text(year);
  d3.select(".current-permit-type").text(permit_type);
}
let currentPermitType = "total";
let currentYear = "2017";

redraw(currentYear, currentPermitType);

// Add year buttons
var yearButtons = d3
  .select(".year-selector")
  .selectAll("button")
  .data(years);

yearButtons
  .enter()
  .append("button")
  .attr("data-year", d => d)
  .text(d => d)
  .classed("my-selector", true)
  // .attr("class", d => d == year && "selected")
  .on("click", function(d) {
    currentYear = d;
    redraw(d, currentPermitType);
  });
// yearButtons.exit().attr("class", d => d == year && "selected");

var propertyTypeButtons = d3
  .select(".permit-type-selector")
  .selectAll("button")
  .data(permitTypes);

propertyTypeButtons
  .enter()
  .append("button")
  .attr("data-prop-type", d => d)
  .text(d => d)
  // .attr("class", d => d == permit_type && "selected")
  .on("click", function(d) {
    currentPermitType = d;
    redraw(currentYear, d);
  });
