// js/line.js
function updateLineChart(filtered) {
        const { labels, values } = computeMonthlyAvg(filtered);
        if (lineChart) lineChart.destroy();
        const ctx = document.getElementById('lineChart').getContext('2d');
        lineChart = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets: [{ label: 'Average monthly price (AUD)', data: values, borderColor: '#e11d48', fill: false, tension: 0.1 }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
