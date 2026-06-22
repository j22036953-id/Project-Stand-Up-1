export async function loadData() {

    const data = await d3.csv("data/cleaned_data.csv");

    data.forEach(d => {

        d.YEAR = +d.YEAR;

        d.COUNT = +d.COUNT;

    });

    return data;
}