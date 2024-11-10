import * as d3 from 'd3';

class ParallelCoordinates {
    constructor(container, data, brushedData) {
        this.container = container;
        this.data = data;
        this.brushedData = brushedData || [];
        this.margin = { top: 30, right: 40, bottom: 25, left: 40 };
        this.width = 1300 - this.margin.left - this.margin.right;
        this.height = 400 - this.margin.top - this.margin.bottom;

        this.drawParallelCoordinates();
    }

    drawParallelCoordinates() {
        const attributes = ["RentedBikeCount", "Temperature", "Rainfall"];

        // Define the color scale using the Turbo colormap
        const colorScale = d3.scaleSequential(d3.interpolatePlasma)
        .domain(d3.extent(this.data, d => d.Humidity)); // Use SolarRadiation to define color scale domain
    

        // Append the SVG for the parallel coordinates
        const svg = d3.select(this.container)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        // Set up scales for each attribute
        const yScales = {};
        attributes.forEach(attr => {
            // if the attribute is RentedBikeCount, invert the scale
            if (attr === "None") {
                yScales[attr] = d3.scaleLinear()
                    .domain(d3.extent(this.data, d => d[attr]))
                    .range([0, this.height]);
            } else {
            yScales[attr] = d3.scaleLinear()
                .domain(d3.extent(this.data, d => d[attr]))
                .range([this.height, 0]);
            }
        });

        // X scale for attribute positions
        const xScale = d3.scalePoint()
            .range([0, this.width])
            .padding(0.5)
            .domain(attributes);

        // Draw the axes for each attribute
        svg.selectAll(".axis")
            .data(attributes)
            .enter()
            .append("g")
            .attr("class", "axis")
            .attr("transform", d => `translate(${xScale(d)},0)`)
            .each(function(d) {
                d3.select(this).call(d3.axisLeft(yScales[d]));
            });

        // Draw the axis labels below each axis
        svg.selectAll(".axis-label")
        .data(attributes)
        .enter()
        .append("text")
        .attr("class", "axis-label")
        .attr("x", d => xScale(d))
        .attr("y", this.height + 20)  // Position the labels below the axes
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text(d => d);  // Display the attribute name as the label


        // Line generator for each data point
        const lineGenerator = d3.line()
            // Curved lines to bundle edges together
            .curve(d3.curveBasis)  
            .x((d, i) => xScale(attributes[i]))
            .y((d, i) => yScales[attributes[i]](d));

        // Draw the lines for each data point
        svg.selectAll(".line")
            .data(this.data)
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("d", d => lineGenerator(attributes.map(attr => d[attr])))
            .style("fill", "none")
            .style("stroke", d => {
                // Check if the line is in the brushed data
                if (this.brushedData.includes(d)) {
                    return "red";  // Highlight brushed data in red
                } else {
                    return colorScale(d.Humidity);  // Set the stroke color based on Humidity
                }
            })
            .style("opacity", d => this.brushedData.includes(d) ? 1.0 : 0.02);  // Full opacity for brushed lines, low opacity for others
   
    }
}

export default ParallelCoordinates;
