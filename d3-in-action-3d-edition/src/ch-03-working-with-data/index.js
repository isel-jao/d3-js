import * as d3 from "d3";
console.log("working with data");

const root = d3.select("#root");

d3.csv("./src/ch-03-working-with-data/data/data.csv", (d) => ({
  technology: d.technology,
  count: +d.count,
})).then(handleData);

function handleData(data) {
  data.sort((a, b) => d3.descending(a.count, b.count));
  const width = 600;
  const height = 1600;
  const labelFontSize = 16;
  const margin = {
    top: 10,
    right: (data[0].count.toString().length * labelFontSize) / 2 + 20,
    bottom: 10,
    left: (d3.max(data, (d) => d.technology.length) * labelFontSize) / 2 + 20,
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = root
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("border", "1px solid currentColor");

  const innerChart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const max = d3.max(data, (d) => d.count);
  // define scales
  const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d.technology))
    .range([0, innerHeight])
    .padding(0.1);

  const xScale = d3.scaleLinear().domain([0, max]).range([0, innerWidth]);
  // draw bars
  innerChart
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", 0)
    .attr("y", (d) => yScale(d.technology))
    .attr("width", (d) => xScale(d.count))
    .attr("height", yScale.bandwidth())
    .attr("fill", "steelblue")
    .attr("rx", 5)
    .attr("ry", 5);

  // add labels
  innerChart
    .selectAll("text.count")
    .data(data)
    .join("text")
    .text((d) => d.count.toString())
    .attr("x", (d) => xScale(d.count) + 10)
    .attr("y", (d) => yScale(d.technology) + yScale.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "start")
    .attr("fill", "steelblue")
    .attr("font-size", labelFontSize)
    .attr("font-weight", 900);

  innerChart
    .selectAll("text.category")
    .data(data)
    .join("text")
    .text((d) => d.technology)
    .attr("x", (d) => -10)
    .attr("y", (d) => yScale(d.technology) + yScale.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "end")
    .attr("fill", "currentColor")
    .attr("font-size", labelFontSize);
}
