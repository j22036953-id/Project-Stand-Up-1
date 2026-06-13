function updateDonutChart() {
        if (donutChart) donutChart.destroy();
        const labels = regionSalesData.map(d => Object.values(d)[0]);
        const values = regionSalesData.map(d => Object.values(d)[1]);
        const ctx = document.getElementById('donutChart').getContext('2d');
        donutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: ['#2c6e9e', '#10b981', '#f43f5e', '#f59e0b', '#6366f1', '#a855f7']
                }]
            },
            options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
    legend: {
        display: true,
        position: 'bottom',
        labels: {
            boxWidth: 10,
            font: {
                size: 8
            }
        }
    },
        datalabels: {
    color: '#333',
    anchor: 'end',
    align: 'end',
    offset: 5,
    font: {
        size: 8   // try 7, 8, or 9
    },
    formatter: function(value, context) {
        return context.chart.data.labels[context.dataIndex];
    }
}
        }
    }
        });
    }