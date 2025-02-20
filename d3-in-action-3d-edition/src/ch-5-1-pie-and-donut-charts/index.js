import * as d3 from "d3";
console.log("pie and donut charts");

const root = d3.select("#root");

d3.csv("./src/ch-5-1-pie-and-donut-charts/data/data.csv", d3.autoType).then(
  handleData
);

const width = 800;
const height = 400;
const margin = { top: 20, right: 20, bottom: 20, left: 80 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
const formatsInfo = [
  { id: "vinyl", label: "Vinyl", color: "#76B6C2" },
  { id: "eight_track", label: "8-Track", color: "#4CDDF7" },
  { id: "cassette", label: "Cassette", color: "#20B9BC" },
  { id: "cd", label: "CD", color: "#2F8999" },
  { id: "download", label: "Download", color: "#E39F94" },
  { id: "streaming", label: "Streaming", color: "#ED7864" },
  { id: "other", label: "Other", color: "#ABABAB" },
];

const xScale = d3.scaleBand();
const yScale = d3.scaleLinear();
const colorScale = d3.scaleOrdinal();

function handleData(data) {
  console.log({ data });
  defineScales(data);
  //   drawDonuts(data);
  drawStackedBars(data);
}

function defineScales(data) {
  xScale.domain(data.map((d) => d.year)).range([0, innerWidth]);
  colorScale
    .domain(formatsInfo.map((f) => f.id))
    .range(formatsInfo.map((f) => f.color));
}

function drawDonuts(data) {
  const svg = root
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("border", "1px solid var(--border)");

  const innerChart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const years = [1975, 1995, 2013];

  years.forEach((year) => {
    const pieGenerator = d3
      .pie()
      .value((d) => d.sales)
      .sort(null);

    const arcGenerator = d3
      .arc()
      .innerRadius(100)
      .outerRadius(60)
      .padAngle(0.02)
      .cornerRadius(5);

    const donut = innerChart
      .append("g")
      .attr("transform", `translate(${xScale(year)}, ${innerHeight / 2})`);

    const yearData = data.find((d) => d.year === year);
    const formattedData = Object.entries(yearData)
      .map(([format, sales]) => ({
        format,
        sales,
      }))
      .filter((d) => d.format !== "year");

    const annotatedData = pieGenerator(formattedData);

    const arcs = donut
      .selectAll(`.arc-${year}`)
      .data(annotatedData)
      .join("g")
      .attr("class", (d) => `arc-${year} arc `);

    arcs
      .append("path")
      .attr("d", arcGenerator)
      .attr("fill", (d) => colorScale(d.data.format));

    arcs
      .append("text")
      .text((d) => {
        d["percentage"] = (d.endAngle - d.startAngle) / (2 * Math.PI);
        return d3.format(".0%")(d.percentage);
      })
      .attr("x", (d) => {
        d["centroid"] = arcGenerator
          .startAngle(d.startAngle)
          .endAngle(d.endAngle)
          .centroid();
        return d.centroid[0];
      })
      .attr("y", (d) => d.centroid[1])
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "currentColor")
      .attr("fill-opacity", (d) => (d.percentage < 0.05 ? 0 : 1))
      .style("font-size", "16px")
      .style("font-weight", 700);

    donut
      .append("text")
      .text(year)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "currentColor")
      .style("font-size", "24px")
      .style("font-weight", 600)
      .style("letter-spacing", "0.1em");
  });
}

function drawStackedBars(data) {
  const svg = root
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("border", "1px solid var(--border)");

  const stackGenerator = d3.stack().keys(formatsInfo.map((f) => f.id));
  const annotatedData = stackGenerator(data);
  const maxUpperBound = d3.max(
    annotatedData[annotatedData.length - 1],
    (d) => d[1]
  );

  const yScale = d3
    .scaleLinear()
    .domain([0, maxUpperBound])
    .range([innerHeight, 0])
    .nice();

  const innerChart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  annotatedData.forEach((series) => {
    innerChart
      .selectAll(`.bar-${series.key}`)
      .data(series)
      .join("rect")
      .attr("class", (d) => `bar-${series.key}`)

      .attr("x", (d) => xScale(d.data.year))
      .attr("width", xScale.bandwidth())
      .attr("y", (d) => yScale(d[1]))
      .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
      .attr("fill", colorScale(series.key));
  });

  const bottomAxis = d3
    .axisBottom(xScale)
    .tickSize(0)
    .tickValues(d3.range(1975, 2020, 5));
  innerChart
    .append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(bottomAxis);

  const lefAxis = d3.axisLeft(yScale).ticks(5);
  innerChart.append("g").call(lefAxis);
}
