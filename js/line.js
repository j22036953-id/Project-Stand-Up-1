// js/line.js
function renderLine(data) {
    const spec = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        description: "Median price over time",
        data: { values: data },
        transform: [
            { calculate: "datetime(datum.Date)", as: "dateObj" },
            { timeunit: "yearmonth", field: "dateObj", as: "yearmonth" }
        ],
        width: CONFIG.width,
        height: CONFIG.height,
        mark: { type: "line", point: { filled: false, size: 30 } },
        encoding: {
            x: { 
                field: "yearmonth", 
                type: "temporal", 
                title: CONFIG.labels.lineX,
                axis: { labelAngle: -45, format: "%b %Y" }
            },
            y: { 
                field: "Price", 
                type: "quantitative", 
                title: CONFIG.labels.lineY,
                aggregate: "median",
                axis: { format: CONFIG.priceFormat }
            },
            color: { value: CONFIG.colours.trendLine },
            tooltip: [
                { field: "yearmonth", title: "Month", type: "temporal", format: "%B %Y" },
                { field: "Price", title: "Median Price", aggregate: "median", format: CONFIG.priceFormat }
            ]
        }
    };
    vegaEmbed("#line-chart", spec, { actions: false });
}