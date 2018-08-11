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
  geoPath,
  get event() { return event; },
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

//First step is to use d3 to parse the csv they give us and then 
//Pass it to C3 to generate the right plot. 
//We need to separate the first value of each row and put it into 
//It's own array to act as the time series x column

//Are we splitting new construction and new construction wood

//Do we have the data fields at the top

let testData3 = d3.csv('../data/average_issue_creation.csv').then((data) => {
  console.log(data);

  //Get the time series into it's own array, separate by new construction or not
  let timeSeries = ['x'];

  let monthly = ['Monthly'];
  let quarterly = ['Moving Avg Quarterly'];
  let yearly = ['Moving Avg Yearly'];
  let fiveyearly = ['Moving Avg 5 Year'];

  let monthlyWF = ['Monthly WF'];
  let quarterlyWF = ['Moving Avg Quarterly WF'];
  let yearlyWF = ['Moving Avg Yearly WF'];
  let fiveyearlyWF = ['Moving Avg 5 Year WF'];

  data.forEach((row) => {
    timeSeries.push(row['Date']);
    if(row['Permit Type Definition'] === 'new construction') {
      monthly.push(row.delta_monthly);
      quarterly.push(row.delta_quarterly);
      yearly.push(row.delta_yearly);
      fiveyearly.push(row.delta_fiveyearly);
    } else if(row['Permit Type Definition'] === 'new construction wood frame') {
      monthlyWF.push(row.delta_monthly);
      quarterlyWF.push(row.delta_quarterly);
      yearlyWF.push(row.delta_yearly);
      fiveyearlyWF.push(row.delta_fiveyearly);
    }
  })

  // timeSeries = [... new Set(timeSeries)];

  //Chart
  var chart = c3.generate({
    bindto: '#chart',
    data: {
      x: 'x',
      // xFormat: '%m/%d/%Y', // 'xFormat' can be used as custom format of 'x'
      columns: [
        timeSeries,
        monthly,
        quarterly,
        yearly,
        fiveyearly,
        monthlyWF,
        quarterlyWF,
        yearlyWF,
        fiveyearlyWF
      ]
    },
    axis: {
        x: {
          type: 'timeseries',
          tick: {
              format: '%Y-%m'
          }
        },
        y: {
          label: {
            text: 'Avg Days from Filing to Issue',
            position: 'outer-middle'
          }
        }
      }
  });
});


d3.selectAll("path").each(function(d, i) {
  d3.select(this).style("data-asdf", d.id);
});

function redraw(year, permit_type) {
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
    .attr("class", d => d == year && "selected")
    .on("click", function(d) {
      redraw(d, permit_type);
    });

  var propertyTypeButtons = d3
    .select(".permit-type-selector")
    .selectAll("button")
    .data(permitTypes);

  propertyTypeButtons
    .enter()
    .append("button")
    .attr("data-prop-type", d => d)
    .text(d => d)
    .attr("class", d => d == permit_type && "selected")
    .on("click", function(d) {
      redraw(year, d);
    });

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
}
redraw("2017", "total");
