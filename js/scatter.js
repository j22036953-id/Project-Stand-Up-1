// js/scatter.js
function updateScatterPlot(filtered) {
        const typeColors = { h: '#3b82f6', t: '#10b981', u: '#f59e0b' };
        const housePoints = filtered.filter(d => d[COL.type] === 'h').map(d => ({ x: d[COL.distance], y: d[COL.price] }));
        const townPoints = filtered.filter(d => d[COL.type] === 't').map(d => ({ x: d[COL.distance], y: d[COL.price] }));
        const unitPoints = filtered.filter(d => d[COL.type] === 'u').map(d => ({ x: d[COL.distance], y: d[COL.price] }));
        if (scatterChart) scatterChart.destroy();
        const ctx = document.getElementById('scatterChart').getContext('2d');
        scatterChart = new Chart(ctx, {
            type: 'scatter',
            data: { datasets: [
                { 
    label: 'House',
    data: housePoints,
    backgroundColor: typeColors.h,
    pointRadius: 1.5,
    pointHoverRadius: 4
},
{
    label: 'Townhouse',
    data: townPoints,
    backgroundColor: typeColors.t,
    pointRadius: 1.5,
    pointHoverRadius: 4
},
{
    label: 'Unit',
    data: unitPoints,
    backgroundColor: typeColors.u,
    pointRadius: 1.5,
    pointHoverRadius: 4
}
            ] },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { title: { display: true, text: 'Distance (km)' } }, y: { title: { display: true, text: 'Price (AUD)' } } } }
        });
    }
