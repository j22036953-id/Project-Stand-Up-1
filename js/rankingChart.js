function drawRankingChart(data) {
    const svgNode = document.getElementById("rankingChart");
    if (!svgNode) return;

    const container = svgNode.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select("#rankingChart")
        .attr("width", width)
        .attr("height", height);
        
    svg.selectAll("*").remove();

    const margin = { top: 15, right: 30, bottom: 30, left: 65 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const totals = d3.rollups(data, v => d3.sum(v, d => d.TESTS), d => d.JURISDICTION)
        .map(d => ({ state: d[0], total: d[1] }))
        .sort((a, b) => b.total - a.total);

    if (totals.length === 0) return;

    const x = d3.scaleLinear()
        .domain([0, d3.max(totals, d => d.total)]).nice()
        .range([0, chartWidth]);

    const y = d3.scaleBand()
        .domain(totals.map(d => d.state))
        .range([0, chartHeight])
        .padding(0.25);

    chart.append("g")
        .call(d3.axisLeft(y));

    chart.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("~s")));

    chart.selectAll("rect")
        .data(totals)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", d => y(d.state))
        .attr("height", y.bandwidth())
        .attr("width", d => x(d.total))
        .attr("fill", "#3b82f6")
        .on("mouseover", function(event, d) {
            d3.select("#tooltip")
                .style("opacity", 1)
                .html(`<strong>${d.state}</strong><br/>Total Positives: ${d.total.toLocaleString()}`);
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