import * as d3 from 'd3';

class ScatterplotD3 {
    constructor(container) {
        this.container = container;
        this.svg = d3.select(container).append("svg");
    }

    // Dynamically set the SVG dimensions to fit the container size
    create({ size }) {
        this.size = size;
        this.svg.attr("width", size.width).attr("height", size.height);
    }

    renderScatterplot(data, xAttribute, yAttribute, colorAttribute, sizeAttribute, controllerMethods) {
        const margin = { top: 40, right: 40, bottom: 40, left: 85 };
        const width = this.size.width - margin.left - margin.right;
        const height = this.size.height - margin.top - margin.bottom;

        // Clear previous content
        this.svg.selectAll("*").remove();

        const x = d3.scaleLinear().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

        // Define color and size scales based on data attributes
        const colorScale = d3.scaleSequential(d3.interpolateTurbo)
            .domain(d3.extent(data, d => d[colorAttribute]));
        const sizeScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d[sizeAttribute]))
            .range([2, 6]);

        const svg = this.svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Set domains for axes
        x.domain(d3.extent(data, d => d[xAttribute])).nice();
        y.domain(d3.extent(data, d => d[yAttribute])).nice();

        // X and Y axes with labels
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .append("text")
            .attr("fill", "black")
            .attr("x", width)
            .attr("y", 25)
            .attr("text-anchor", "end")
            .text(xAttribute)
            .style("font-size", "14px");

        svg.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "black")
            .attr("transform", "rotate(-90)")
            .attr("y", -50)
            .attr("dy", "1em")
            .attr("text-anchor", "end")
            .text(yAttribute)
            .style("font-size", "14px");

        // Scatterplot circles with default opacity of 0.3
        const circles = svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", d => sizeScale(d[sizeAttribute]))
            .attr("cx", d => x(d[xAttribute]))
            .attr("cy", d => y(d[yAttribute]))
            .attr("fill", d => colorScale(d[colorAttribute]))
            .attr("opacity", 0.3)  // Set initial opacity to 0.3
            .on("mouseover", function(event, d) {
                d3.select(this).attr("fill", "red").attr("opacity", 0.8);
                controllerMethods.handleOnMouseEnter(d);
            })
            .on("mouseout", function(event, d) {
                d3.select(this).attr("fill", colorScale(d[colorAttribute])).attr("opacity", 0.3);
                controllerMethods.handleOnMouseLeave();
            })
            .on("click", function(event, d) {
                controllerMethods.handleOnClick(d);
            });

        // Brushing functionality
        const brush = d3.brush()
            .extent([[0, 0], [width, height]])
            .on("start brush end", (event) => {
                const selection = event.selection;

                if (selection) {
                    const [[x0, y0], [x1, y1]] = selection;

                    // Adjust opacity based on whether points fall within the brushed area
                    circles.attr("opacity", d => {
                        const cx = x(d[xAttribute]);
                        const cy = y(d[yAttribute]);
                        const isSelected = x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
                        return isSelected ? 0.8 : 0.3;  // 0.6 for selected points, 0.3 for others
                    });

                    // Filter data to only include points within the brushed area
                    const selectedData = data.filter(d => {
                        const cx = x(d[xAttribute]);
                        const cy = y(d[yAttribute]);
                        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
                    });

                    if (event.type === "end") {
                        // Trigger callback with the selected data only at the end of the brush
                        controllerMethods.handleOnBrush(selectedData);
                    }
                } else {
                    // Reset opacity when brush is cleared
                    circles.attr("opacity", 0.3);  // Set all points back to 0.3
                }
            });

        // Append brush to the SVG
        svg.append("g").attr("class", "brush").call(brush);
    }

    clear() {
        this.svg.selectAll("*").remove();
    }
}

export default ScatterplotD3;
