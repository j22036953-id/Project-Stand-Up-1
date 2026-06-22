function drawHeatmap(data) {
    const svgNode = document.getElementById("heatmapChart");
    if (!svgNode) return;

    const container = svgNode.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select("#heatmapChart")
        .attr("width", width)
        .attr("height", height);
        
    svg.selectAll("*").remove();

    const margin = { top: 15, right: 20, bottom: 40, left: 65 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const years = [...new Set(data.map(d => +d.YEAR))].sort((a, b) => a - b);
    const states = [...new Set(data.map(d => d.JURISDICTION))].sort();

    if (years.length === 0 || states.length === 0) return;

    const x = d3.scaleBand().domain(years).range([0, chartWidth]).padding(0.06);
    const y = d3.scaleBand().domain(states).range([0, chartHeight]).padding(0.06);

    const maxValue = d3.max(data, d => +d.TESTS) || 0;
    const color = d3.scaleSequential().interpolator(d3.interpolateBlues).domain([0, maxValue]);

    // X-Axis
    chart.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.5em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-35)");

    // Y-Axis
    chart.append("g").call(d3.axisLeft(y));

    // Render cells
    chart.selectAll("rect.cell")
        .data(data, d => `${d.JURISDICTION}-${d.YEAR}`)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", d => x(+d.YEAR))
        .attr("y", d => y(d.JURISDICTION))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("fill", d => +d.TESTS === 0 ? "#eeeeee" : color(+d.TESTS))
        .style("stroke", "#ffffff")
        .style("stroke-width", 1)
        .on("mouseover", function(event, d) {
            d3.select(this).style("stroke", "#111111").style("stroke-width", 1.5);
            d3.select("#tooltip")
                .style("opacity", 1)
                .html(`<strong>${d.JURISDICTION} (${d.YEAR})</strong><br/>Positive Tests: ${(+d.TESTS).toLocaleString()}`);
        })
        .on("mousemove", function(event) {
            d3.select("#tooltip")
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).style("stroke", "#ffffff").style("stroke-width", 1);
            d3.select("#tooltip").style("opacity", 0);
        });
}