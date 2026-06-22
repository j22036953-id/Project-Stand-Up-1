export function createStackedBar(data){

    const svg = d3.select("#stackedBarChart");

    svg.selectAll("*").remove();

    svg.append("text")
        .attr("x",100)
        .attr("y",100)
        .text("Stacked Bar Placeholder");
}