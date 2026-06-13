// js/bar.js
function updateBarChart(filtered) {
        const { labels, values } = computeRegionAvg(filtered);
        if (barChart) barChart.destroy();
        const ctx = document.getElementById('barChart').getContext('2d');
        barChart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets: [{ label: 'Average price (AUD)', data: values, backgroundColor: '#3b82f6' }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
    }
