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
