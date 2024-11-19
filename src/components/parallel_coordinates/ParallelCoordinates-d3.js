import * as d3 from 'd3';
import { setBrushedDataParallelCoords } from '../../redux/BrushedDataSliceSecond'; 

class ParallelCoordinates {
    constructor(container, data, brushedData, firstAxis, secondAxis, color, invertX, invertY, dispatch) {
        this.container = container;
        this.data = data;
        this.brushedData = brushedData || [];
        this.firstAxis = firstAxis || "Temperature";
        this.secondAxis = secondAxis || "RentedBikeCount";
        this.color = color || "Humidity";
        this.margin = { top: 30, right: 10, bottom: 25, left: 10 };
        this.dispatch = dispatch;
        this.invertX = invertX || false;
        this.invertY = invertY || false;
        this.colorscale = null;
        // Get the width and height from the container's bounding box
        const containerRect = container.getBoundingClientRect();
        this.width = containerRect.width - this.margin.left - this.margin.right;
        this.height = containerRect.height - this.margin.top - this.margin.bottom;
        this.drawParallelCoordinates();
    }

    // Helper function to determine if the attribute is categorical
    isCategorical(attribute) {
        return ['Date', 'Seasons', 'Holiday', 'FunctioningDay'].includes(attribute);
    }

    // Main function used to draw the chart
    drawParallelCoordinates(firstAxis, secondAxis, color, invertX, invertY) {
        // Update the axes based on the selected attributes
        if (firstAxis && secondAxis && color && invertX && invertY) {
            this.firstAxis = firstAxis;
            this.secondAxis = secondAxis;
            this.color = color;
            this.invertX = invertX;
            this.invertY = invertY;
        }

        // Extract the selected attributes corresponding to the axes
        const attributes = [this.firstAxis, this.secondAxis];
        // Categorical sorting (lexicographic for Date, Season and binary for Holiday and FunctioningDay)
        // Necessary in order to correctly display the axes and the colorscale
        const categoricalOrder = {
            'Date': (a, b) => d3.ascending(a, b), 
            'Seasons': (a, b) => d3.ascending(a, b),
            'Holiday': (a, b) => a === "No Holiday" ? -1 : 1, // No Holiday < Yes Holiday
            'FunctioningDay': (a, b) => a === "No" ? -1 : 1, // No < Yes
        };
        
        // Handle color scale by check whether color is categorical or not
        if (this.isCategorical(this.color)) {
            const orderedColorValues = Array.from(new Set(this.data.map(d => d[this.color])))
            .sort();  
            // Use an ordinal scale with the ordered color values
            this.colorScale = d3.scaleOrdinal()
            .domain(orderedColorValues)
            .range(d3.schemeCategory10);
        } else {
            // Normal color scale
            this.colorScale = d3.scaleSequential(d3.interpolatePlasma)
            .domain(d3.extent(this.data, d => d[this.color]));
        }
        
        // Create SVG or reuse the existing one
        let svg = d3.select(this.container).selectAll("svg")
            .data([null]);
        svg = svg.enter()
            .append("svg")
            .merge(svg)
            .attr("width", this.width)
            .attr("height", this.height);

        // Create the main group
        const g = svg.selectAll("g.main-group")
            .data([null]);
        const mainGroup = g.enter()
            .append("g")
            .attr("class", "main-group")
            .merge(g)
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        // Create the scales for each selected attribute
        const yScales = {};
        attributes.forEach(attr => {
            if (categoricalOrder[attr]) {
                // For categorical variables, use an ordinal scale (as previously done for the color scale)
                const uniqueCategories = Array.from(new Set(this.data.map(d => d[attr])));
                uniqueCategories.sort(categoricalOrder[attr]);
                yScales[attr] = d3.scalePoint()
                    .domain(uniqueCategories)
                    .range(
                        (attr === this.firstAxis && this.invertX) ||
                        (attr === this.secondAxis && this.invertY) 
                            ? [0, this.height] // Inverted range for the axis
                            : [this.height, 0] // Default range
                    );
            } else {
                // For continuous variables, use a linear scale
                yScales[attr] = d3.scaleLinear()
                    .domain(d3.extent(this.data, d => d[attr]))
                    .range(
                        (attr === this.firstAxis && this.invertX) ||
                        (attr === this.secondAxis && this.invertY) 
                            ? [0, this.height] // Inverted range for the axis
                            : [this.height, 0] // Default range
                    );
            }
        });

        // Define the x axis and add some padding to its borders
        const xScale = d3.scalePoint()
            .range([0, this.width])
            .padding(0.3)
            .domain(attributes);
 
        // Get a reference to the axes
        const axes = mainGroup.selectAll(".axis")
            .data(attributes);

        // Get a reference to the current object to make sure modifications are applied
        const self = this; 
        axes.enter()
            .append("g")
            .attr("class", "axis")
            .merge(axes)
            .attr("transform", d => `translate(${xScale(d)},0)`)
            .each(function (attr) {
                if (categoricalOrder[attr]) {
                    // Handle categorical attributes, which otherwise would not be displayed, breaking the chart
                    // Sort them accordingly
                    const uniqueCategories = Array.from(new Set(self.data.map(d => d[attr])));
                    uniqueCategories.sort(categoricalOrder[attr]);
        
                    // Limit the displayed axes ticks to 10 equally spaced tick values
                    // This is fundamental for the "Date" attribute, which would otherwise display all the dates
                    // Making the chart unreadable
                    const tickCount = 10;
                    const tickInterval = Math.max(1, Math.floor(uniqueCategories.length / tickCount));
                    const sampledCategories = uniqueCategories.filter((_, i) => i % tickInterval === 0);
                    // Create a scale with full categories for data points
                    const scale = d3.scalePoint()
                        .domain(uniqueCategories)
                        .range([self.height, 0]); 
                    const axis = d3.axisLeft(scale)
                        .tickValues(sampledCategories); 

                    // Reverse the tick labels if the axis is inverted
                    if ((attr === self.firstAxis && self.invertX) || (attr === self.secondAxis && self.invertY)) {
                        axis.scale(scale.copy().range([0, self.height]));  
                        d3.select(this).call(axis);
                        d3.select(this).selectAll(".tick text")
                            .attr("transform", "scale(1, 1)");
                    } else {
                        d3.select(this).call(axis);
                    }

                    // Adjust the axis appearance, adding some padding to avoid
                    // The text to overlap with the axis line and the plot
                    if (attr === self.secondAxis) {
                        axis.tickSizeOuter(0);
                        axis.tickSizeInner(0);
                        axis.tickPadding(-10);
                    }
                    d3.select(this).call(axis);
                }
                else {
                    if (attr === self.secondAxis) {
                        // Align the text to the right for the second axis
                        d3.select(this).call(d3.axisRight(yScales[attr])); 
                    } else {
                        // Align the text to the left for the first axis
                        d3.select(this).call(d3.axisLeft(yScales[attr]));
                    }
                }
            });

        axes.exit().remove();

        // Handle axis labels
        const labels = mainGroup.selectAll(".axis-label")
            .data(attributes);
        labels.enter()
            .append("text")
            .attr("class", "axis-label")
            .merge(labels)
            .attr("x", d => xScale(d))
            .attr("y", this.height + 20)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(d => d);
        labels.exit().remove();

        // Adjust tick size
        mainGroup.selectAll(".axis").selectAll("text").style("font-size", "14px");
        
        // Generate the lines corresponding to the data values
        const lineGenerator = d3.line()
            .curve(d3.curveBasis)
            .x((d, i) => xScale(attributes[i]))
            .y((d, i) => yScales[attributes[i]](d));
        const lines = mainGroup.selectAll(".line")
            .data(this.data);
        lines.enter()
            .append("path")
            .attr("class", "line")
            .merge(lines)
            .attr("d", d => lineGenerator(attributes.map(attr => d[attr])))
            .style("fill", "none")
            .style("stroke", d => this.colorScale(d[this.color]))
            // Use a very low opacity to preserve readability of the plot, if nothing is brushed
            .style("opacity", d => {
                return this.isBrushed(d) ? 0.4 : 0.02;
            });
        lines.exit().remove();
        // Add the brush to the chart, use two 1D brushes, one for each axis
        let brushSelections = {
            firstAxis: null,
            secondAxis: null,
        };

        // Handle the brush event
        const handleBrush = (axis, event, yScale, data) => {
            const selection = event.selection;
            brushSelections[axis] = selection;
            if (brushSelections.firstAxis || brushSelections.secondAxis) {
                const brushedData = data.filter(d => {
                    // Check if the data point is within the brush selection
                    const firstBrushValid = !brushSelections.firstAxis ||
                        (yScale[this.firstAxis](d[this.firstAxis]) >= brushSelections.firstAxis[0] &&
                        yScale[this.firstAxis](d[this.firstAxis]) <= brushSelections.firstAxis[1]);
                    const secondBrushValid = !brushSelections.secondAxis ||
                        (yScale[this.secondAxis](d[this.secondAxis]) >= brushSelections.secondAxis[0] &&
                        yScale[this.secondAxis](d[this.secondAxis]) <= brushSelections.secondAxis[1]);
                    return firstBrushValid && secondBrushValid;
                });

                // Update the opacity of the lines that correspond to the brushed data
                mainGroup.selectAll(".line")
                    .style("opacity", d => brushedData.includes(d) ? 0.4 : 0.02);
                if (event.type === "end") {
                    // Dispatch the brushed data to the store, so that scatter plot is updated accordingly
                    this.dispatch(setBrushedDataParallelCoords(brushedData));
                }
            } else {
                // Reset if both brushes are cleared
                mainGroup.selectAll(".line").style("opacity", 0.02);
                if (event.type === "end") {
                    // Dispatch empty brushed data to the store, so that opacity is updated to default also on scatter plot
                    this.dispatch(setBrushedDataParallelCoords([]));
                }
            }
        };

        // Add brushes to both axes
        const brushFirstAxis = d3.brushY()
            .extent([[xScale(this.firstAxis) - 5, 0], [xScale(this.firstAxis) + 5, this.height]])
            .on("start brush end", (event) => handleBrush("firstAxis", event, yScales, this.data));
        const brushsecondAxis = d3.brushY()
            .extent([[xScale(this.secondAxis) - 5, 0], [xScale(this.secondAxis) + 5, this.height]])
            .on("start brush end", (event) => handleBrush("secondAxis", event, yScales, this.data));

        // Append brushes to the respective axes
        mainGroup.selectAll(".brush").remove();
        mainGroup.append("g")
            .attr("class", "brush")
            .call(brushFirstAxis);
        mainGroup.append("g")
            .attr("class", "brush")
            .call(brushsecondAxis);
    }

    // Function to check if a data point is inside the brushed data
    isBrushed(d) {
        if (!this.brushedData || this.brushedData.length === 0) {
            return false; 
        }
        // Get unique identifier for the current data point
        const identifier = d.index;
        // Iterate over brushedData and compare the index
        for (let i = 0; i < this.brushedData.brushedData.length; i++) {
            const brushed = this.brushedData.brushedData[i];
            if (brushed.index === identifier) {
                return true; 
            }
        }
        return false; 
    }
}

export default ParallelCoordinates;