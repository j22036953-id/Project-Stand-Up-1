export function createTreemap(data){

    const svg = d3.select("#treemapChart");

    svg.selectAll("*").remove();

    svg.append("text")
        .attr("x",100)
        .attr("y",100)
        .text("Treemap Placeholder");
}