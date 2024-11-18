import * as d3 from 'd3';
import { setBrushedDataParallelCoords } from '../../redux/BrushedDataSliceSecond'; // Import the Redux action


class ParallelCoordinates {
    constructor(container, data, brushedData, firstAxis, secondAxis, color, invertX, invertY, dispatch) {
        this.container = container;
        this.data = data;
        this.brushedData = brushedData || []; // Initialize to an empty array if undefined
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

    drawParallelCoordinates(firstAxis, secondAxis, color, invertX, invertY) {
        // Update the axes based on the selected attributes
        if (firstAxis && secondAxis && color && invertX && invertY) {
            this.firstAxis = firstAxis;
            this.secondAxis = secondAxis;
            this.color = color;
            this.invertX = invertX;
            this.invertY = invertY;
        }

        const attributes = [this.firstAxis, this.secondAxis];
        // Categorical sorting (lexicographic for Date, Season and binary for Holiday and FunctioningDay)
        const categoricalOrder = {
            'Date': (a, b) => d3.ascending(a, b), // Lexicographic sort
            'Seasons': (a, b) => d3.ascending(a, b),
            'Holiday': (a, b) => a === "No Holiday" ? -1 : 1, // No Holiday < Yes Holiday
            'FunctioningDay': (a, b) => a === "No" ? -1 : 1, // No < Yes
        };
        
        // Handle color scale: check if color is categorical or continuous
        if (this.isCategorical(this.color)) {
            const orderedColorValues = Array.from(new Set(this.data.map(d => d[this.color])))
            .sort();  // Sort the categorical values as needed
            
            this.colorScale = d3.scaleOrdinal()
            .domain(orderedColorValues)
            .range(d3.schemeCategory10);  // Use a color scale (like d3.schemeCategory10)
        } else {
            this.colorScale = d3.scaleSequential(d3.interpolatePlasma)
            .domain(d3.extent(this.data, d => d[this.color]));
        }
        
        // Create SVG or reuse the existing one
        let svg = d3.select(this.container).selectAll("svg")
            .data([null]); // Bind single data point for the container
        svg = svg.enter()
            .append("svg")
            .merge(svg)
            .attr("width", this.width)
            .attr("height", this.height);

        const g = svg.selectAll("g.main-group")
            .data([null]); // Bind a single group
            
        const mainGroup = g.enter()
            .append("g")
            .attr("class", "main-group")
            .merge(g)
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        // Create or update yScales for each attribute
        const yScales = {};
        attributes.forEach(attr => {
            if (categoricalOrder[attr]) {
                // For categorical variables, use an ordinal scale
                const uniqueCategories = Array.from(new Set(this.data.map(d => d[attr])));
                uniqueCategories.sort(categoricalOrder[attr]);
                yScales[attr] = d3.scalePoint()
                    .domain(uniqueCategories)
                    .range([this.height, 0]);
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

        const xScale = d3.scalePoint()
            .range([0, this.width])
            .padding(0.5)
            .domain(attributes);

        // Handle axes (enter, update, exit)
        const axes = mainGroup.selectAll(".axis")
            .data(attributes);

            const self = this; // Capture the class context

            axes.enter()
                .append("g")
                .attr("class", "axis")
                .merge(axes)
                .attr("transform", d => `translate(${xScale(d)},0)`)
                .each(function (attr) {
                    if (categoricalOrder[attr]) {
                        // Handle categorical attributes
                        const uniqueCategories = Array.from(new Set(self.data.map(d => d[attr]))); // Use self.data
                        uniqueCategories.sort(categoricalOrder[attr]);
            
                        // Limit to 10 equally spaced tick values
                        const tickCount = 10;
                        const tickInterval = Math.max(1, Math.floor(uniqueCategories.length / tickCount));
                        const sampledCategories = uniqueCategories.filter((_, i) => i % tickInterval === 0);
            
                        // Create a scale with full categories for data points
                        const scale = d3.scalePoint()
                            .domain(uniqueCategories)
                            .range([self.height, 0]); // Use self.height
            
                        // Axis with limited ticks
                        const axis = d3.axisLeft(scale)
                            .tickValues(sampledCategories); // Show only sampled categories as ticks

                        if (attr == self.secondAxis) {
                            // shift the tick values to the right
                            axis.tickSizeOuter(0);
                            axis.tickSizeInner(0);
                            axis.tickPadding(-10);
                        }
                            
            
                        d3.select(this).call(axis);
                    }
                    else {
                        if (attr === self.secondAxis) {
                            d3.select(this).call(d3.axisRight(yScales[attr])); // Right-aligned axis for third axis
                        } else {
                            d3.select(this).call(d3.axisLeft(yScales[attr]));
                        }
                    }
                });
            


        axes.exit().remove();

        // Handle axis labels (enter, update, exit)
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

        // Line generator for paths
        const lineGenerator = d3.line()
            .curve(d3.curveBasis)
            .x((d, i) => xScale(attributes[i]))
            .y((d, i) => yScales[attributes[i]](d));

        // Handle lines (enter, update, exit)
        const lines = mainGroup.selectAll(".line")
            .data(this.data);

        lines.enter()
            .append("path")
            .attr("class", "line")
            .merge(lines)
            .attr("d", d => lineGenerator(attributes.map(attr => d[attr])))
            .style("fill", "none")
            .style("stroke", d => this.colorScale(d[this.color]))
            .style("opacity", d => {
                return this.isBrushed(d) ? 0.4 : 0.02;
            });

        lines.exit().remove();

        // Brushing remains untouched
        let brushSelections = {
            firstAxis: null,
            secondAxis: null,
        };

        // Update the function to handle multiple brushes
        const handleBrush = (axis, event, yScale, data) => {
            const selection = event.selection;
            brushSelections[axis] = selection;

            if (brushSelections.firstAxis || brushSelections.secondAxis) {
                const brushedData = data.filter(d => {
                    const firstBrushValid = !brushSelections.firstAxis ||
                        (yScale[this.firstAxis](d[this.firstAxis]) >= brushSelections.firstAxis[0] &&
                        yScale[this.firstAxis](d[this.firstAxis]) <= brushSelections.firstAxis[1]);
                    const thirdBrushValid = !brushSelections.secondAxis ||
                        (yScale[this.secondAxis](d[this.secondAxis]) >= brushSelections.secondAxis[0] &&
                        yScale[this.secondAxis](d[this.secondAxis]) <= brushSelections.secondAxis[1]);

                    return firstBrushValid && thirdBrushValid;
                });

                mainGroup.selectAll(".line")
                    .style("opacity", d => brushedData.includes(d) ? 0.4 : 0.02);

                if (event.type === "end") {
                    this.dispatch(setBrushedDataParallelCoords(brushedData));
                }
            } else {
                // Reset if both brushes are cleared
                mainGroup.selectAll(".line").style("opacity", 0.02);
                if (event.type === "end") {
                    this.dispatch(setBrushedDataParallelCoords([]));
                }
            }
        };

        // Add brushes to both the first and third axes
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

    // Check if a data point is inside the brushed data by iterating over brushedData explicitly
    isBrushed(d) {
        // Ensure brushedData is defined and contains elements before checking
        if (!this.brushedData || this.brushedData.length === 0) {
            return false; // No brushed data, all points will be shown with default opacity
        }

        // Get unique identifier for the current data point
        const identifier = d.index;
        // Iterate over the brushedData and compare the uniqueIds
        for (let i = 0; i < this.brushedData.brushedData.length; i++) {
            const brushed = this.brushedData.brushedData[i];
            if (brushed.index === identifier) {
                return true; // If a match is found, return true
            }
        }
        return false; // If no match is found, return false
    }
}

export default ParallelCoordinates;