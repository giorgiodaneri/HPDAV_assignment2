import * as d3 from 'd3';

class ParallelCoordinates {
    constructor(container, data, brushedData, firstAxis, secondAxis, thirdAxis) {
        this.container = container;
        this.data = data;
        this.brushedData = brushedData || []; // Initialize to an empty array if undefined
        this.firstAxis = firstAxis;
        this.secondAxis = secondAxis;
        this.thirdAxis = thirdAxis;
        this.margin = { top: 30, right: 10, bottom: 25, left: 10 };

        // Get the width and height from the container's bounding box
        const containerRect = container.getBoundingClientRect();
        this.width = containerRect.width - this.margin.left - this.margin.right;
        this.height = containerRect.height - this.margin.top - this.margin.bottom;

        this.drawParallelCoordinates();
    }

    drawParallelCoordinates() {  
        const attributes = ["RentedBikeCount", "Temperature", "Rainfall"];

        // Define the color scale using the Turbo colormap
        const colorScale = d3.scaleSequential(d3.interpolatePlasma)
            .domain(d3.extent(this.data, d => d.Humidity));

        // Remove any existing SVG before appending a new one
        d3.select(this.container).selectAll("svg").remove();

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
            yScales[attr] = d3.scaleLinear()
                .domain(d3.extent(this.data, d => d[attr]))
                .range(attr === "None" ? [0, this.height] : [this.height, 0]);
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
            .attr("y", this.height + 20)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text(d => d);

        // Line generator for each data point
        const lineGenerator = d3.line()
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
            .style("stroke", d => colorScale(d.Humidity))
            .style("opacity", d => {
                // If the data point is in the brushedData, set opacity to 0.4, else 0.02
                return this.isBrushed(d) ? 0.4 : 0.02;
            });
    }

    // Generate a unique identifier for each data point
    getUniqueId(d) {
        // print current date and hour
        return `${d.Date}-${d.Hour}`;  // Use key attributes to create a unique ID
    }

    // Check if a data point is inside the brushed data by iterating over brushedData explicitly
    isBrushed(d) {
        // Ensure brushedData is defined and contains elements before checking
        if (!this.brushedData || this.brushedData.length === 0) {
            return false; // No brushed data, all points will be shown with default opacity
        }

        // if brushData is not empty, print it
        if(this.brushedData.brushedData.length > 0)
        {
            console.log("Brushed data:", this.brushedData);
        }
        const uniqueId = this.getUniqueId(d);  // Get unique identifier for the current data point

        // Iterate over the brushedData and compare the uniqueIds
        for (let i = 0; i < this.brushedData.brushedData.length; i++) {
            const brushed = this.brushedData.brushedData[i];
            if (this.getUniqueId(brushed) === uniqueId) {
                console.log("Match found for:", uniqueId);
                return true; // If a match is found, return true
            }
        }

        return false; // If no match is found, return false
    }
}

export default ParallelCoordinates;