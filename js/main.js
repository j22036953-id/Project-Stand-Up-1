// js/main.js
let fullData = null;
let currentFilters = {
    type: "All",
    maxPrice: 7000000,
    region: "All"
};

function formatPrice(p) {
    return "$" + p.toLocaleString();
}

async function loadData() {
    try {
        const data = await d3.csv(CONFIG.dataPath, d => {
            return {
                Price: +d.Price,
                Distance: +d.Dist,       // note: your CSV uses 'Dist'
                Regionname: d.Regionname,
                Date: d.Date,
                Type: d.Type,
                Suburb: d.Suburb,
                Rooms: +d.Rooms
            };
        });
        fullData = data.filter(d => !isNaN(d.Price) && !isNaN(d.Distance) && d.Regionname && d.Date);
        
        // Populate region dropdown
        const regions = [...new Set(fullData.map(d => d.Regionname))].sort();
        const regionSelect = document.getElementById("region-filter");
        regions.forEach(r => {
            const opt = document.createElement("option");
            opt.value = r;
            opt.textContent = r;
            regionSelect.appendChild(opt);
        });
        
        // Set up event listeners
        document.getElementById("type-filter").addEventListener("change", (e) => {
            currentFilters.type = e.target.value;
            updateAllCharts();
        });
        document.getElementById("price-slider").addEventListener("input", (e) => {
            const val = parseInt(e.target.value);
            currentFilters.maxPrice = val;
            document.getElementById("price-value").innerText = formatPrice(val);
            updateAllCharts();
        });
        document.getElementById("region-filter").addEventListener("change", (e) => {
            currentFilters.region = e.target.value;
            updateAllCharts();
        });
        document.getElementById("reset-filters").addEventListener("click", () => {
            document.getElementById("type-filter").value = "All";
            document.getElementById("price-slider").value = "7000000";
            document.getElementById("price-value").innerText = "$7,000,000";
            document.getElementById("region-filter").value = "All";
            currentFilters = { type: "All", maxPrice: 7000000, region: "All" };
            updateAllCharts();
        });
        
        updateAllCharts();
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

function getFilteredData() {
    let filtered = fullData;
    if (currentFilters.type !== "All") {
        filtered = filtered.filter(d => d.Type === currentFilters.type);
    }
    filtered = filtered.filter(d => d.Price <= currentFilters.maxPrice);
    if (currentFilters.region !== "All") {
        filtered = filtered.filter(d => d.Regionname === currentFilters.region);
    }
    return filtered;
}

function updateAllCharts() {
    const filtered = getFilteredData();
    if (!filtered.length) {
        const emptyMsg = { data: { values: [] }, mark: "text", encoding: { text: { value: "No data matches filters" } } };
        vegaEmbed("#scatter-plot", emptyMsg, { actions: false });
        vegaEmbed("#bar-chart", emptyMsg, { actions: false });
        vegaEmbed("#line-chart", emptyMsg, { actions: false });
        return;
    }
    renderScatter(filtered);
    renderBar(filtered);
    renderLine(filtered);
}

// Start everything when page loads
window.addEventListener("DOMContentLoaded", loadData);