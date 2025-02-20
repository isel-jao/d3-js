import * as d3 from "d3";
console.log("Drawing a line chart");

d3.csv(
  "./src/ch-04-2-drawing-a-line-chart/data/weekly_temperature.csv",
  d3.autoType
).then(handleData);

const root = d3.select("#root");

function handleData(data) {
  const maxTemp = d3.max(data, (d) => d.max_temp_F);
  const extentTime = d3.extent(data, (d) => d.date);

  const width = 900;
  const height = 600;
  const margin = {
    top: 20,
    left: maxTemp.toString().length * 2 + 10,
    bottom: 40,
    right: 20,
  };

  const svg = root
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("border", "1px solid var(--border");

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const innerChart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // define the scales
  const yScale = d3.scaleLinear().domain([0, maxTemp]).range([innerHeight, 0]);

  const xScale = d3.scaleTime().domain(extentTime).range([0, innerWidth]);

  // draw scatter plot
  innerChart
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", (d) => xScale(d.date))
    .attr("cy", (d) => yScale(d.avg_temp_F))
    .attr("r", 4)
    .attr("fill", "var(--primary)");

  // draw the line
  const line = d3
    .line()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.avg_temp_F))
    .curve(d3.curveCatmullRom);

  innerChart
    .append("path")
    .datum(data)
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "var(--primary)")
    .attr("stroke-width", 2);

  // draw the area

  const area = d3
    .area()
    .x((d) => xScale(d.date))
    .y0((d) => yScale(d.max_temp_F))
    .y1((d) => yScale(d.min_temp_F))
    .curve(d3.curveCatmullRom);

  innerChart
    .append("path")
    .datum(data)
    .attr("d", area)
    .attr("fill", "none")
    .attr("fill", "var(--primary)")
    .attr("fill-opacity", 0.2)
    .attr("stroke-width", 2);

  // add bottom axis
  const bottomAxis = d3.axisBottom(xScale);

  innerChart
    .append("g")
    .call(bottomAxis)
    .attr("transform", `translate(0, ${innerHeight})`);

  // add left axis
  const leftAxis = d3.axisLeft(yScale);
  innerChart.append("g").call(leftAxis);
}
