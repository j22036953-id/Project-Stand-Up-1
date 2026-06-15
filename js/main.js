// js/main.js
let fullData = [];
let areaData = [];
let regionSalesData = [];
let barChart, scatterChart, lineChart, pieChart, donutChart;

const COL = {
    price: 'Price',
    distance: 'Distance',
    type: 'Type',
    suburb: 'Suburb',
    region: 'Regionname',
    date: 'SaleDate'
};

// Helper method to parse individual CSVs securely via Promise mapping
function parseCSV(url) {
    return fetch(url)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error ${res.status} on ${url}`);
            return res.text();
        })
        .then(text => {
            return new Promise((resolve) => {
                Papa.parse(text, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data)
                });
            });
        });
}

function loadAllData() {
    Promise.all([
        parseCSV('data/cleaned_melbourne.csv').catch(e => { console.warn(e); return null; }),
        parseCSV('data/properties_by_area.csv').catch(e => { console.warn(e); return null; }),
        parseCSV('data/sales_by_region.csv').catch(e => { console.warn(e); return null; })
    ]).then(([mainData, parsedArea, parsedRegion]) => {
        
        if (!mainData || mainData.length === 0) {
            console.log("Main CSV not discovered, fallback to static mock data structures.");
            loadMockData();
            return;
        }

        fullData = mainData.filter(row => 
            row[COL.price] && !isNaN(row[COL.price]) &&
            row[COL.distance] && !isNaN(row[COL.distance]) &&
            row[COL.type] && ['h','t','u'].includes(row[COL.type]) &&
            row[COL.suburb]
        );

        areaData = parsedArea || [];
        regionSalesData = parsedRegion || [];

        populateSuburbs();
        applyFiltersAndRender();
    });
}

function loadMockData() {
    fullData = [
        { Price: 1000000, Distance: 5, Type: 'h', Suburb: 'Abbotsford', Regionname: 'Northern Metropolitan', SaleDate: '01/04/2017' },
        { Price: 800000, Distance: 10, Type: 't', Suburb: 'Airport West', Regionname: 'Western Metropolitan', SaleDate: '15/06/2017' },
        { Price: 600000, Distance: 20, Type: 'u', Suburb: 'Melton', Regionname: 'Western Victoria', SaleDate: '20/12/2018' },
        { Price: 1500000, Distance: 3, Type: 'h', Suburb: 'Armadale', Regionname: 'Southern Metropolitan', SaleDate: '10/03/2016' },
        { Price: 450000, Distance: 30, Type: 'u', Suburb: 'Melton South', Regionname: 'Western Victoria', SaleDate: '05/08/2018' }
    ];
    areaData = [
        { Area: 'Northern', Count: 400 }, { Area: 'Southern', Count: 550 }, { Area: 'Western', Count: 300 }
    ];
    regionSalesData = [
        { Region: 'Northern Metropolitan', Volume: 1200 }, { Region: 'Western Metropolitan', Volume: 900 }, { Region: 'Southern Metropolitan', Volume: 1600 }
    ];
    populateSuburbs();
    applyFiltersAndRender();
}

function populateSuburbs() {
    const suburbsSet = new Set();
    fullData.forEach(d => suburbsSet.add(d[COL.suburb]));
    const sorted = Array.from(suburbsSet).sort();
    const select = document.getElementById('suburbSelect');
    select.innerHTML = '<option value="all">All suburbs</option>';
    sorted.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        select.appendChild(opt);
    });
}

function getFilteredData() {
    const suburb = document.getElementById('suburbSelect').value;
    const maxPrice = parseFloat(document.getElementById('priceSlider').value);
    const selectedTypes = Array.from(document.querySelectorAll('.checkbox-group input:checked')).map(cb => cb.value);
    const year = document.getElementById('yearSelect').value;

    return fullData.filter(row => {
        if (suburb !== 'all' && row[COL.suburb] !== suburb) return false;
        if (row[COL.price] > maxPrice) return false;
        if (!selectedTypes.includes(row[COL.type])) return false;
        if (year !== 'all') {
            const parts = row[COL.date]?.split('/');
            const rowYear = parts && parts.length === 3 ? parseInt(parts[2], 10) : null;
            if (rowYear !== parseInt(year, 10)) return false;
        }
        return true;
    });
}

function computeRegionAvg(filtered) {
    const map = new Map();
    filtered.forEach(row => {
        const region = row[COL.region];
        if (!region) return;
        if (!map.has(region)) map.set(region, { sum: 0, count: 0 });
        const entry = map.get(region);
        entry.sum += row[COL.price];
        entry.count++;
    });
    const labels = Array.from(map.keys());
    const values = labels.map(l => map.get(l).sum / map.get(l).count);
    return { labels, values };
}

function computeMonthlyAvg(filtered) {
    const monthMap = new Map();
    filtered.forEach(row => {
        if (!row[COL.date]) return;
        const parts = row[COL.date].split('/');
        if (parts.length !== 3) return;
        const year = parts[2];
        const month = parts[1];
        const key = `${year}-${month.padStart(2,'0')}`;
        if (!monthMap.has(key)) monthMap.set(key, { sum: 0, count: 0 });
        const entry = monthMap.get(key);
        entry.sum += row[COL.price];
        entry.count++;
    });
    const sortedKeys = Array.from(monthMap.keys()).sort();
    const avgPrices = sortedKeys.map(k => monthMap.get(k).sum / monthMap.get(k).count);
    return { labels: sortedKeys, values: avgPrices };
}

// SINGLE DEFINITION: Updates charts and visual text label
function applyFiltersAndRender() {
    const filtered = getFilteredData();
    updateBarChart(filtered);
    updateScatterPlot(filtered);
    updatePieChart();
    updateDonutChart();
    updateLineChart(filtered);
    
    // Updates UI label smoothly
    const currentPrice = parseInt(document.getElementById('priceSlider').value);
    document.getElementById('priceValue').innerText = `Up to $${currentPrice.toLocaleString()}`;
}

function attachEvents() {
    document.getElementById('suburbSelect').addEventListener('change', applyFiltersAndRender);
    document.getElementById('priceSlider').addEventListener('input', applyFiltersAndRender);
    document.querySelectorAll('.checkbox-group input').forEach(cb => cb.addEventListener('change', applyFiltersAndRender));
    document.getElementById('yearSelect').addEventListener('change', applyFiltersAndRender);
    
    document.getElementById('resetBtn').addEventListener('click', () => {
        document.getElementById('suburbSelect').value = 'all';
        document.getElementById('priceSlider').value = '3500000';
        document.querySelectorAll('.checkbox-group input').forEach(cb => cb.checked = true);
        document.getElementById('yearSelect').value = 'all';
        applyFiltersAndRender();
    });
}

// Safe execution wrapper ensuring DOM elements exist first
document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    attachEvents();
});
