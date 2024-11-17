import * as d3 from 'd3';
import { setBrushedDataParallelCoords } from '../../redux/BrushedDataSliceSecond'; // Import the Redux action


class ParallelCoordinates {
    constructor(container, data, brushedData, firstAxis, secondAxis, thirdAxis, dispatch) {
        this.container = container;
        this.data = data;
        this.brushedData = brushedData || []; // Initialize to an empty array if undefined
        this.firstAxis = firstAxis || "Temperature"; // Initialize to "RentedBikeCount" if undefined
        this.secondAxis = secondAxis || "RentedBikeCount"; // Initialize to "Temperature" if undefined
        this.thirdAxis = thirdAxis || "Rainfall"; // Initialize to "Rainfall" if undefined
        this.margin = { top: 30, right: 10, bottom: 25, left: 10 };
        this.dispatch = dispatch;

        // Get the width and height from the container's bounding box
        const containerRect = container.getBoundingClientRect();
        this.width = containerRect.width - this.margin.left - this.margin.right;
        this.height = containerRect.height - this.margin.top - this.margin.bottom;

        this.drawParallelCoordinates();
    }

    drawParallelCoordinates(firstAxis, secondAxis, thirdAxis) {
        
        // Update the axes based on the selected attributes
        if (firstAxis && secondAxis && thirdAxis) {
            this.firstAxis = firstAxis;
            this.secondAxis = secondAxis;
            this.thirdAxis = thirdAxis;
        }
    
        const attributes = [this.firstAxis, this.secondAxis, this.thirdAxis];
        const colorScale = d3.scaleSequential(d3.interpolatePlasma)
            .domain(d3.extent(this.data, d => d.Humidity));
    
        d3.select(this.container).selectAll("svg").remove();
    
        const svg = d3.select(this.container)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
    
        const yScales = {};
        attributes.forEach(attr => {
            yScales[attr] = d3.scaleLinear()
                .domain(d3.extent(this.data, d => d[attr]))
                .range([this.height, 0]);
        });
    
        const xScale = d3.scalePoint()
            .range([0, this.width])
            .padding(0.5)
            .domain(attributes);
    
        svg.selectAll(".axis")
            .data(attributes)
            .enter()
            .append("g")
            .attr("class", "axis")
            .attr("transform", d => `translate(${xScale(d)},0)`)
            .each(function (d) {
                d3.select(this).call(d3.axisLeft(yScales[d]));
            });
    
        svg.selectAll(".axis-label")
            .data(attributes)
            .enter()
            .append("text")
            .attr("class", "axis-label")
            .attr("x", d => xScale(d))
            .attr("y", this.height + 20)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(d => d);
    
        // make the axes ticks bigger
        svg.selectAll(".axis").selectAll("text").style("font-size", "14px");
    
        const lineGenerator = d3.line()
            .curve(d3.curveBasis)
            .x((d, i) => xScale(attributes[i]))
            .y((d, i) => yScales[attributes[i]](d));
    
        svg.selectAll(".line")
            .data(this.data)
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("d", d => lineGenerator(attributes.map(attr => d[attr])))
            .style("fill", "none")
            .style("stroke", d => colorScale(d.Humidity))
            .style("opacity", d => {
                return this.isBrushed(d) ? 0.4 : 0.02;
            });
    
        // Add a brush to the first axis on vertical orientation
        const brush = d3.brushY()
            .extent([[xScale(this.firstAxis) - 5, 0], [xScale(this.firstAxis) + 5, this.height]])
            .on("start brush end", (event) => {
                const selection = event.selection;
                if (selection) {
                    const [y0, y1] = event.selection;
                    const brushedData = this.data.filter(d => {
                        const value = yScales[this.firstAxis](d[this.firstAxis]);
                        return y0 <= value && value <= y1;
                    });
    
                    svg.selectAll(".line")
                        .style("opacity", d => {
                            return brushedData.includes(d) ? 0.4 : 0.02;
                        });
    
                    // Dispatch the brushed data to the Redux store
                    if(event.type === "end") {
                        this.dispatch(setBrushedDataParallelCoords(brushedData));
                    }
                } else {
                    // Reset if brush is cleared
                    svg.selectAll(".line").style("opacity", 0.02);
                    // call reducer to store empty brushed data
                    if(event.type === "end")
                    {
                        this.dispatch(setBrushedDataParallelCoords([]));
                    }
                }
            });
    
        // Append brush with custom styles
        svg.append("g")
            .attr("class", "brush")
            .call(brush)
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
            // console.log("Brushed data:", this.brushedData);
        }
        const uniqueId = this.getUniqueId(d);  // Get unique identifier for the current data point

        // Iterate over the brushedData and compare the uniqueIds
        for (let i = 0; i < this.brushedData.brushedData.length; i++) {
            const brushed = this.brushedData.brushedData[i];
            if (this.getUniqueId(brushed) === uniqueId) {
                return true; // If a match is found, return true
            }
        }

        return false; // If no match is found, return false
    }
}

export default ParallelCoordinates;