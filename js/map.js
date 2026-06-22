/**
 * Draws a fully responsive, maximized Australia Choropleth Map using D3.js
 * @param {Array} data - The active filtered dataset passed from main.js
 */
function drawMap(data) {
    const svgNode = document.getElementById("mapChart");
    if (!svgNode) return;

    const container = svgNode.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select("#mapChart")
        .attr("width", width)
        .attr("height", height);
        
    svg.selectAll("*").remove();

    // 1. Process and aggregate the dataset metrics
    const stateDataMap = d3.rollup(data, 
        v => d3.sum(v, d => d.TESTS), 
        d => d.JURISDICTION.toUpperCase().trim()
    );

    const maxTests = d3.max(Array.from(stateDataMap.values())) || 1;
    const colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateBlues)
        .domain([0, maxTests]);

    // Reliable public repository for Australian boundaries
    const geoJsonUrl = "https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.geojson";

    d3.json(geoJsonUrl).then(geoData => {
        // 2. Initialize projection without hardcoded centers
        const projection = d3.geoMercator();

        // 3. AUTOMATICALLY MAXIMIZE SCALE TO FILL THE BOX CLEANLY
        // Maps geometry limits directly to container box size minus a 15px pad margin
        const padding = 15;
        projection.fitExtent(
            [[padding, padding], [width - padding, height - padding]], 
            geoData
        );

        const pathGenerator = d3.geoPath().projection(projection);

        // Name translation mapping dictionary
        const stateMapping = {
            "NEW SOUTH WALES": "NSW", "VICTORIA": "VIC", "QUEENSLAND": "QLD",
            "SOUTH AUSTRALIA": "SA", "WESTERN AUSTRALIA": "WA", "TASMANIA": "TAS",
            "NORTHERN TERRITORY": "NT", "AUSTRALIAN CAPITAL TERRITORY": "ACT"
        };

        // 4. Draw geographic boundary shapes
        svg.append("g")
            .selectAll("path")
            .data(geoData.features)
            .enter()
            .append("path")
            .attr("d", pathGenerator)
            .attr("fill", d => {
                const rawName = (d.properties.STATE_NAME || d.properties.name || "").toUpperCase().trim();
                const matchedCode = stateMapping[rawName] || rawName;
                const count = stateDataMap.get(matchedCode) || 0;
                return count === 0 ? "#f1f5f9" : colorScale(count);
            })
            .style("stroke", "#ffffff")
            .style("stroke-width", "1.5")
            .style("cursor", "pointer")
            .on("mouseover", (event, d) => showMapTooltip(event, d, stateMapping, stateDataMap))
            .on("mousemove", moveTooltip)
            .on("mouseout", hideTooltip);

    }).catch(err => {
        console.warn("GeoJSON blocked or failed to load. Initiating layout grid matrix fallback...", err);
        // Fallback layout mapping coordinates simulating Australia's geography layout
        drawGridMapFallback(svg, width, height, stateDataMap, colorScale);
    });
}

// HIGH-FIDELITY GRID LAYOUT FALLBACK (Triggers only if local environment blocks GeoJSON loading)
function drawGridMapFallback(svg, width, height, dataMap, colorScale) {
    const gridData = [
        { state: "NT", row: 0, col: 1, name: "Northern Territory" },
        { state: "QLD", row: 0, col: 2, name: "Queensland" },
        { state: "WA", row: 1, col: 0, name: "Western Australia" },
        { state: "SA", row: 1, col: 1, name: "South Australia" },
        { state: "NSW", row: 1, col: 2, name: "New South Wales" },
        { state: "ACT", row: 2, col: 2, name: "Aust. Capital Territory" },
        { state: "VIC", row: 3, col: 1, name: "Victoria" },
        { state: "TAS", row: 4, col: 1, name: "Tasmania" }
    ];

    const padding = 10;
    const boxSize = Math.min((width - 60) / 3, (height - 60) / 5);
    
    const startX = (width - (boxSize * 3 + padding * 2)) / 2;
    const startY = (height - (boxSize * 5 + padding * 4)) / 2;

    const mapGroup = svg.append("g").attr("transform", `translate(${startX}, ${startY})`);

    const selection = mapGroup.selectAll("g.tile")
        .data(gridData)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.col * (boxSize + padding)}, ${d.row * (boxSize + padding)})`);

    selection.append("rect")
        .attr("width", boxSize)
        .attr("height", boxSize)
        .attr("rx", 6)
        .attr("fill", d => {
            const count = dataMap.get(d.state) || 0;
            return count === 0 ? "#f1f5f9" : colorScale(count);
        })
        .style("stroke", "#cbd5e1")
        .style("stroke-width", "1")
        .style("cursor", "pointer")
        .on("mouseover", (event, d) => {
            const count = dataMap.get(d.state) || 0;
            d3.select("#tooltip")
                .style("opacity", 1)
                .html(`<strong>${d.name} (${d.state})</strong><br/>Positive Tests: ${count.toLocaleString()}`);
        })
        .on("mousemove", moveTooltip)
        .on("mouseout", hideTooltip);

    selection.append("text")
        .attr("x", boxSize / 2)
        .attr("y", boxSize / 2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("font-size", "0.85rem")
        .style("font-weight", "700")
        .style("fill", "#1e293b")
        .style("pointer-events", "none")
        .text(d => d.state);
}

// TOOLTIP ACCESSIBILITY FUNCTIONS
function showMapTooltip(event, d, mapping, dataMap) {
    const rawName = (d.properties.STATE_NAME || d.properties.name || "").toUpperCase().trim();
    const matchedCode = mapping[rawName] || rawName;
    const count = dataMap.get(matchedCode) || 0;
    
    d3.select("#tooltip")
        .style("opacity", 1)
        .html(`<strong>${d.properties.STATE_NAME || d.properties.name}</strong><br/>Positive Tests: ${count.toLocaleString()}`);
}

function moveTooltip(event) {
    d3.select("#tooltip")
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 20) + "px");
}

function hideTooltip() {
    d3.select("#tooltip").style("opacity", 0);
}