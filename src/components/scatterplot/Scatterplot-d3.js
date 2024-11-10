import * as d3 from 'd3';

class ScatterplotD3 {
    constructor(container) {
        this.container = container;
        this.svg = d3.select(container).append("svg");
    }

    create({ size }) {
        this.size = size;
        this.svg.attr("width", this.size.width)
            .attr("height", this.size.height);
    }

    renderScatterplot(data, xAttribute, yAttribute, colorAttribute, sizeAttribute, controllerMethods) {
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = this.size.width - margin.left - margin.right;
        const height = this.size.height - margin.top - margin.bottom;

        const x = d3.scaleLinear().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

        // Create a color scale based on WindSpeed (may change this to a generic variable later on)
        const createColorScale = (data) => {
            const windSpeeds = data.map(d => d.WindSpeed);
            const minWindSpeed = d3.min(windSpeeds);
            const maxWindSpeed = d3.max(windSpeeds);
        
            // Create a color scale based on WindSpeed
            return d3.scaleSequential(d3.interpolateTurbo)
                .domain([minWindSpeed, maxWindSpeed]); // Adjust the color range here
        };
        
        // Create a size scale based on Visibility
        const createSizeScale = (data) => {
            const visibilityValues = data.map(d => d.Visibility);
            const minVisibility = d3.min(visibilityValues);
            const maxVisibility = d3.max(visibilityValues);
        
            // Create a scale for circle radius based on Visibility
            return d3.scaleLinear()
                .domain([minVisibility, maxVisibility])  // Input: Visibility values
                .range([2, 6]);                         // Output: Radius size range
        };

        const svg = this.svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Set the domains of the axes based on the data
        x.domain([
            d3.min(data, d => d[xAttribute]) - 1,  // Add a little padding
            d3.max(data, d => d[xAttribute]) + 1   // Add a little padding
        ]);

        y.domain([
            d3.min(data, d => d[yAttribute]) - 10,  // Add a little padding
            d3.max(data, d => d[yAttribute]) + 10   // Add a little padding
        ]);

        // Define color scale based on WindSpeed
        const colorScale = createColorScale(data);

        // Define size scale based on Visibility
        const sizeScale = createSizeScale(data);

        const defs = this.svg.append("defs");

        // Right-pointing arrow for the x-axis
        defs.append("marker")
            .attr("id", "arrow-x")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 0)  // Position the arrow at the end of the x-axis line
            .attr("refY", 10)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto-start")  // No rotation needed for x-axis
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 Z")
            .style("fill", "black");
        
        // Upward-pointing arrow for the y-axis
        defs.append("marker")
            .attr("id", "arrow-y")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 0)
            .attr("refY", 10)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto-start")  // Rotates to point upward for y-axis
            .append("path")
            .attr("d", "M 0 10 L 5 0 L 10 10 Z")
            .style("fill", "black");

        // Create X and Y axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .call(g => g.select(".domain")
                .attr("marker-end", "url(#arrow-x)")       // Add arrow at the end
                .attr("stroke-width", 2)                 // Make axis line thicker
                .attr("stroke", "black"));               // Set axis line color


        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain")
                .attr("marker-end", "url(#arrow-y)")       // Add arrow at the end
                .attr("stroke-width", 2)                 // Make axis line thicker
                .attr("stroke", "black"));               // Set axis line color


        // Create scatterplot points
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", d => sizeScale(d[sizeAttribute])) // Radius based on Visibility
            .attr("cx", d => x(d[xAttribute]))
            .attr("cy", d => y(d[yAttribute]))
            .attr("fill", d => colorScale(d[colorAttribute])) // Color based on WindSpeed
            .attr("opacity", 0.5) // Lower opacity for overlapping points
            .on("mouseover", function(event, d) {
                d3.select(this).style("fill", "red").attr("opacity", 1.0);
                controllerMethods.handleOnMouseEnter(d);
            })
            .on("mouseout", function(event, d) {
                d3.select(this).style("fill", colorScale(d[colorAttribute])).attr("opacity", 0.5);
                controllerMethods.handleOnMouseLeave();
            })
            .on("click", function(event, d) {
                controllerMethods.handleOnClick(d);
            });

        this.svg.append("defs")
            .append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 5)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto-start-reverse")  // Ensures correct orientation for both axes
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 Z")  // Triangle shape for arrow
            .style("fill", "black");              // Color of the arrowhead
    }

    clear() {
        this.svg.selectAll("*").remove();
    }
}

export default ScatterplotD3;