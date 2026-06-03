// config.js
const CONFIG = {
    // Chart dimensions
    width: "container",
    height: 400,
    
    // Colour schemes
    colours: {
        regionScheme: "tableau10",   // categorical for regions
        priceGradient: "blues",      // sequential for bar chart
        trendLine: "#e6550d"         // orange for line chart
    },
    
    // File paths
    dataPath: "data/melbourne_cleaned.csv",
    
    // Price formatting
    priceFormat: "$,.0f",
    
    // Axis labels
    labels: {
        scatterX: "Distance from CBD (km)",
        scatterY: "Price (AUD)",
        barX: "Region",
        barY: "Median Price (AUD)",
        lineX: "Sale Date (Year-Month)",
        lineY: "Median Price (AUD)"
    }
};