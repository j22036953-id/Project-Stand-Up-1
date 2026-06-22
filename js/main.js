// ==========================================
// CENTRAL APPLICATION STATE LOGIC
// ==========================================
let rawData = [];
let filteredData = [];

// BOOTSTRAP INITIAL DATA PARSING PROCESS
d3.csv("data/cleaned_data.csv").then(data => {
    data.forEach(d => {
        d.YEAR = +d.YEAR;
        
        // Dynamically account for varied schema setups safely across versions
        d.TESTS = +d["Sum(COUNT)"] || +d.COUNT || 0;
        d.FINES = +d["Sum(FINES)"] || +d.FINES || 0;
        d.ARRESTS = +d["Sum(ARRESTS)"] || +d.ARRESTS || 0;
        d.CHARGES = +d["Sum(CHARGES)"] || +d.CHARGES || 0;
        d.JURISDICTION = d.JURISDICTION || d.STATE || "Unknown";
    });

    rawData = data;
    filteredData = data;

    initializeFilters();
    updateDashboard();
});

function initializeFilters() {
    const years = [...new Set(rawData.map(d => d.YEAR))].sort((a, b) => a - b);
    const states = [...new Set(rawData.map(d => d.JURISDICTION))].sort();

    // Populate Selector Options
    years.forEach(year => {
        d3.select("#yearFilter").append("option").attr("value", year).text(year);
    });

    states.forEach(state => {
        d3.select("#stateFilter").append("option").attr("value", state).text(state);
    });

    // Wire Up UI Events
    d3.select("#yearFilter").on("change", applyFilters);
    d3.select("#stateFilter").on("change", applyFilters);
    d3.select("#resetBtn").on("click", resetDashboard);
}

function applyFilters() {
    const selectedYear = d3.select("#yearFilter").property("value");
    const selectedState = d3.select("#stateFilter").property("value");

    filteredData = rawData;

    if (selectedYear !== "all") {
        filteredData = filteredData.filter(d => d.YEAR == selectedYear);
    }
    if (selectedState !== "all") {
        filteredData = filteredData.filter(d => d.JURISDICTION === selectedState);
    }

    updateDashboard();
}

function resetDashboard() {
    d3.select("#yearFilter").property("value", "all");
    d3.select("#stateFilter").property("value", "all");
    filteredData = rawData;
    updateDashboard();
}

function updateDashboard() {
    // 1. Refresh textual insight metadata arrays
    updateKPIs();
    updateInsights();

    // 2. Cascade data streams to active visual script engines
    if (typeof drawLineChart === "function") drawLineChart(filteredData);
    if (typeof drawRankingChart === "function") drawRankingChart(filteredData);
    if (typeof drawHeatmap === "function") drawHeatmap(filteredData); 
    if (typeof drawMap === "function") drawMap(filteredData); 
}

function updateKPIs() {
    const totalTests = d3.sum(filteredData, d => d.TESTS);
    d3.select("#totalTests").text(totalTests.toLocaleString());

    const stateTotals = d3.rollups(filteredData, v => d3.sum(v, d => d.TESTS), d => d.JURISDICTION);
    stateTotals.sort((a, b) => b[1] - a[1]);
    d3.select("#highestState").text(stateTotals.length ? stateTotals[0][0] : "-");

    const yearTotals = d3.rollups(filteredData, v => d3.sum(v, d => d.TESTS), d => d.YEAR);
    yearTotals.sort((a, b) => b[1] - a[1]);
    d3.select("#peakYear").text(yearTotals.length ? yearTotals[0][0] : "-");

    d3.select("#growthState").text(calculateGrowthState());
}

function calculateGrowthState() {
    const grouped = d3.group(rawData, d => d.JURISDICTION);
    let maxGrowth = -Infinity;
    let bestState = "-";

    grouped.forEach((values, state) => {
        values.sort((a, b) => a.YEAR - b.YEAR);
        if (values.length > 1) {
            const first = values[0].TESTS;
            const last = values[values.length - 1].TESTS;
            const growth = last - first;
            if (growth > maxGrowth) {
                maxGrowth = growth;
                bestState = state;
            }
        }
    });
    return bestState;
}

function updateInsights() {
    const total = d3.sum(filteredData, d => d.TESTS);
    const stateTotals = d3.rollups(filteredData, v => d3.sum(v, d => d.TESTS), d => d.JURISDICTION);
    stateTotals.sort((a, b) => b[1] - a[1]);
    const topState = stateTotals.length ? stateTotals[0][0] : "-";

    d3.select("#insightBox").html(`
        <ul>
            <li>• Total Positive Tests: <strong>${total.toLocaleString()}</strong></li>
            <li>• Highest jurisdiction: <strong>${topState}</strong></li>
            <li>• Detections increased heavily post-2014.</li>
            <li>• NSW & QLD command highest volume margins.</li>
        </ul>
    `);
}