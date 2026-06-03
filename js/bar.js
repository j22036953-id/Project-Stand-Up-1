// js/bar.js
function renderBar(data) {
    const spec = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        description: "Median price by region",
        data: { values: data },
        width: CONFIG.width,
        height: CONFIG.height,
        mark: "bar",
        encoding: {
            x: { 
                field: "Regionname", 
                type: "nominal", 
                title: CONFIG.labels.barX,
                sort: "-y"
            },
            y: { 
                field: "Price", 
                type: "quantitative", 
                title: CONFIG.labels.barY,
                aggregate: "median",
                axis: { format: CONFIG.priceFormat }
            },
            color: { 
                field: "Price", 
                type: "quantitative", 
                aggregate: "median",
                title: "Median Price",
                scale: { scheme: CONFIG.colours.priceGradient }
            },
            tooltip: [
                { field: "Regionname", title: "Region" },
                { field: "Price", title: "Median Price", aggregate: "median", format: CONFIG.priceFormat }
            ]
        }
    };
    vegaEmbed("#bar-chart", spec, { actions: false });
}