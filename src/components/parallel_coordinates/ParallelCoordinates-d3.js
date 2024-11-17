import * as d3 from 'd3';
import { setBrushedDataParallelCoords } from '../../redux/BrushedDataSliceSecond'; // Import the Redux action


class ParallelCoordinates {
    constructor(container, data, brushedData, firstAxis, secondAxis, thirdAxis, invertX, invertY, invertZ, dispatch) {
        this.container = container;
        this.data = data;
        this.brushedData = brushedData || []; // Initialize to an empty array if undefined
        this.firstAxis = firstAxis || "Temperature";
        this.secondAxis = secondAxis || "RentedBikeCount";
        this.thirdAxis = thirdAxis || "Rainfall";
        this.margin = { top: 30, right: 10, bottom: 25, left: 10 };
        this.dispatch = dispatch;
        this.invertX = invertX || false;
        this.invertY = invertY || false;
        this.invertZ = invertZ || false;

        // Get the width and height from the container's bounding box
        const containerRect = container.getBoundingClientRect();
        this.width = containerRect.width - this.margin.left - this.margin.right;
        this.height = containerRect.height - this.margin.top - this.margin.bottom;

        this.drawParallelCoordinates();
    }

    drawParallelCoordinates(firstAxis, secondAxis, thirdAxis, invertX, invertY, invertZ) {
        // Update the axes based on the selected attributes
        if (firstAxis && secondAxis && thirdAxis && invertX && invertY && invertZ) {
            this.firstAxis = firstAxis;
            this.secondAxis = secondAxis;
            this.thirdAxis = thirdAxis;
            this.invertX = invertX;
            this.invertY = invertY;
            this.invertZ = invertZ;
        }

        const attributes = [this.firstAxis, this.secondAxis, this.thirdAxis];
        const colorScale = d3.scaleSequential(d3.interpolatePlasma)
            .domain(d3.extent(this.data, d => d.Humidity));

        // Create SVG or reuse the existing one
        let svg = d3.select(this.container).selectAll("svg")
            .data([null]); // Bind single data point for the container
        svg = svg.enter()
            .append("svg")
            .merge(svg)
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

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
            yScales[attr] = d3.scaleLinear()
                .domain(d3.extent(this.data, d => d[attr]))
                .range(
                    (attr === this.firstAxis && this.invertX) ||
                    (attr === this.secondAxis && this.invertY) ||
                    (attr === this.thirdAxis && this.invertZ)
                        ? [0, this.height] // Inverted range for the axis
                        : [this.height, 0] // Default range
                );
        });

        const xScale = d3.scalePoint()
            .range([0, this.width])
            .padding(0.5)
            .domain(attributes);

        // Handle axes (enter, update, exit)
        const axes = mainGroup.selectAll(".axis")
            .data(attributes);

        axes.enter()
            .append("g")
            .attr("class", "axis")
            .merge(axes)
            .attr("transform", d => `translate(${xScale(d)},0)`)
            .each(function (d) {
                if (d === this.thirdAxis) {
                    d3.select(this).call(d3.axisRight(yScales[d])); // Right-aligned axis for third axis
                } else {
                    d3.select(this).call(d3.axisLeft(yScales[d]));
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
            .style("stroke", d => colorScale(d.Humidity))
            .style("opacity", d => {
                return this.isBrushed(d) ? 0.4 : 0.02;
            });

        lines.exit().remove();

        // Brushing remains untouched
        let brushSelections = {
            firstAxis: null,
            thirdAxis: null,
        };

        // Update the function to handle multiple brushes
        const handleBrush = (axis, event, yScale, data) => {
            const selection = event.selection;
            brushSelections[axis] = selection;

            if (brushSelections.firstAxis || brushSelections.thirdAxis) {
                const brushedData = data.filter(d => {
                    const firstBrushValid = !brushSelections.firstAxis ||
                        (yScale[this.firstAxis](d[this.firstAxis]) >= brushSelections.firstAxis[0] &&
                        yScale[this.firstAxis](d[this.firstAxis]) <= brushSelections.firstAxis[1]);
                    const thirdBrushValid = !brushSelections.thirdAxis ||
                        (yScale[this.thirdAxis](d[this.thirdAxis]) >= brushSelections.thirdAxis[0] &&
                        yScale[this.thirdAxis](d[this.thirdAxis]) <= brushSelections.thirdAxis[1]);

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

        const brushThirdAxis = d3.brushY()
            .extent([[xScale(this.thirdAxis) - 5, 0], [xScale(this.thirdAxis) + 5, this.height]])
            .on("start brush end", (event) => handleBrush("thirdAxis", event, yScales, this.data));

        // Append brushes to the respective axes
        mainGroup.selectAll(".brush").remove();

        mainGroup.append("g")
            .attr("class", "brush")
            .call(brushFirstAxis);

        mainGroup.append("g")
            .attr("class", "brush")
            .call(brushThirdAxis);
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