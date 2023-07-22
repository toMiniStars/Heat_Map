const dataUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

d3.json(dataUrl).then((data) => {
		console.log(data);
  drawHeatMap(data);
});

function drawHeatMap(data) {
  const width = 1200;
  const height = 500;
  const padding = 60;
  const baseTemp = data.baseTemperature;
  const years = data.monthlyVariance.map((d) => d.year);
  const months = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];

  const svg = d3.select('#heatmap')
    .attr('width', width + padding)
    .attr('height', height + padding);

  const xScale = d3.scaleLinear()
    .domain([d3.min(years), d3.max(years)])
    .range([0, width]);

  const yScale = d3.scaleBand()
    .domain(months)
    .range([0, height]);

  const colorScale = d3.scaleQuantile()
    .domain([baseTemp + d3.min(data.monthlyVariance, d => d.variance), baseTemp + d3.max(data.monthlyVariance, d => d.variance)])
    .range(['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']);

  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format("d"));

  svg.append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(${padding}, ${height + padding - 20})`)
    .call(xAxis);

  const yAxis = d3.axisLeft(yScale)
    .tickSize(0)
    .tickPadding(8);

  svg.append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${padding - 5}, ${padding})`)
    .call(yAxis);

  svg.selectAll('.cell')
    .data(data.monthlyVariance)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('x', (d) => xScale(d.year) + padding)
    .attr('y', (d) => yScale(months[d.month - 1]) + padding)
    .attr('width', width / (d3.max(years) - d3.min(years)))
    .attr('height', height / 12)
    .attr('data-month', (d) => d.month - 1)
    .attr('data-year', (d) => d.year)
    .attr('data-temp', (d) => baseTemp + d.variance)
    .style('fill', (d) => colorScale(baseTemp + d.variance))
    .on('mouseover', (d) => {
      const tooltip = d3.select('#tooltip');
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip.html(
        `${months[d.month - 1]} ${d.year}<br />${(baseTemp + d.variance).toFixed(2)}°C<br />${d.variance.toFixed(2)}°C`
      )
        .attr('data-year', d.year)
        .style('left', `${d3.event.pageX}px`)
        .style('top', `${d3.event.pageY - 50}px`);
    })
    .on('mouseout', () => {
      d3.select('#tooltip').style('opacity', 0);
    });

  const legendWidth = 200;
  const legendHeight = 20;

  const legend = svg.append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${padding}, ${height + padding + 20})`);

  const legendScale = d3.scaleLinear()
    .domain([baseTemp + d3.min(data.monthlyVariance, d => d.variance), baseTemp + d3.max(data.monthlyVariance, d => d.variance)])
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(legendScale)
    .tickValues(colorScale.range())
    .tickFormat(d3.format(".1f"));

  legend.append('g')
    .attr('transform', `translate(0, ${legendHeight})`)
    .call(legendAxis);

  legend.selectAll('.legend-rect')
    .data(colorScale.range())
    .enter()
    .append('rect')
    .attr('class', 'legend-rect')
    .attr('x', (d, i) => i * (legendWidth / colorScale.range().length))
    .attr('y', 0)
    .attr('width', legendWidth / colorScale.range().length)
    .attr('height', legendHeight)
    .style('fill', (d) => d);
}
