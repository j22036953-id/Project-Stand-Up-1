function updatePieChart() {
        if (pieChart) pieChart.destroy();
        const labels = areaData.map(d => Object.values(d)[0]);
        const values = areaData.map(d => Object.values(d)[1]);
        const ctx = document.getElementById('pieChart').getContext('2d');
        pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6']
                }]
            },
            options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom'
        },
        datalabels: {
            color: '#fff',
            font: {
                weight: 'bold',
                size: 10
            },
            formatter: (value, ctx) => {
                return ctx.chart.data.labels[ctx.dataIndex];
            }
        }
    }
}
        });
    }