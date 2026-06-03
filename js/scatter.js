// js/scatter.js
function renderScatter(data) {
    const spec = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        description: "Price vs Distance coloured by region",
        data: { values: data },
        width: CONFIG.width,
        height: CONFIG.height,
        mark: { type: "circle", opacity: 0.6, size: 40 },
        encoding: {
            x: { 
                field: "Distance", 
                type: "quantitative", 
                title: CONFIG.labels.scatterX,
                scale: { zero: false }
            },
            y: { 
                field: "Price", 
                type: "quantitative", 
                title: CONFIG.labels.scatterY,
                axis: { format: CONFIG.priceFormat }
            },
            color: { 
                field: "Regionname", 
                type: "nominal", 
                title: "Region",
                scale: { scheme: CONFIG.colours.regionScheme }
            },
            tooltip: [
                { field: "Suburb", title: "Suburb" },
                { field: "Price", title: "Price", format: CONFIG.priceFormat },
                { field: "Rooms", title: "Rooms" },
                { field: "Distance", title: "Distance (km)" }
            ]
        }
    };
    vegaEmbed("#scatter-plot", spec, { actions: false });
}