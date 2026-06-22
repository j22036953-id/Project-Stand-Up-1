function drawLineChart(data) {
    const svgNode = document.getElementById("lineChart");
    if (!svgNode) return;
    
    const container = svgNode.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select("#lineChart")
        .attr("width", width)
        .attr("height", height);
        
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 35, left: 55 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const yearlyData = d3.rollups(data, v => d3.sum(v, d => d.TESTS), d => d.YEAR)
        .map(d => ({ year: d[0], total: d[1] }))
        .sort((a, b) => a.year - b.year);

    if (yearlyData.length === 0) return;

    const x = d3.scaleLinear()
        .domain(d3.extent(yearlyData, d => d.year))
        .range([0, chartWidth]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(yearlyData, d => d.total)]).nice()
        .range([chartHeight, 0]);

    // X-Axis
    chart.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(Math.min(yearlyData.length, 10)));

    // Y-Axis
    chart.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format("~s")));

    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.total));

    chart.append("path")
        .datum(yearlyData)
        .attr("fill", "none")
        .attr("stroke", "#2563eb")
        .attr("stroke-width", 3)
        .attr("d", line);

    chart.selectAll(".dot")
        .data(yearlyData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.total))
        .attr("r", 4)
        .attr("fill", "#2563eb")
        .on("mouseover", function(event, d) {
            d3.select("#tooltip")
                .style("opacity", 1)
                .html(`<strong>Year:</strong> ${d.year}<br/><strong>Positives:</strong> ${d.total.toLocaleString()}`);
        })
        .on("mousemove", function(event) {
            d3.select("#tooltip")
                .style("left", (event.pageX + 12) + "px")
                .style("top", (event.pageY - 12) + "px");
        })
        .on("mouseout", function() {
            d3.select("#tooltip").style("opacity", 0);
        });
}