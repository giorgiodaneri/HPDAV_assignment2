import * as d3 from 'd3';

class ScatterplotD3 {
  margin = { top: 40, right: 50, bottom: 50, left: 85 };
  size;
  width;
  height;
  svg;
  x;
  y;
  sizeScale;
  brushedData = [];
  brushedDataParallelCoords = [];
  defaultOpacity = 0.3;
  transitionDuration = 2000;
  circleRadius = 3;

  constructor(container) {
    this.container = container;
    this.svg = d3.select(container).append("svg");
  }

  // Function to create the scatterplot, the svg element and the axes
  create({ size }) {
    this.size = size;
    this.width = this.size.width - this.margin.left - this.margin.right;
    this.height = this.size.height - this.margin.top - this.margin.bottom;

    this.svg
      .attr("width", this.width)
      .attr("height", this.height);

    this.x = d3.scaleLinear().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);

    this.svg.append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    this.svg.select("g")
      .append("g")
      .attr("class", "xAxisG")
      .attr("transform", `translate(0,${this.height})`);

    this.svg.select("g")
      .append("g")
      .attr("class", "yAxisG");
  }

  // Function to update the position of the dots and their opacity
  updateDots(selection, xAttribute, yAttribute, colorAttribute, brushedDataParallelCoords) {
    selection
        .attr("transform", (item) => {
            const xPosition = this.x(item[xAttribute]);
            const yPosition = this.y(item[yAttribute]);

            // Handle categorical attributes as discrete positions
            return `translate(${this.isCategorical(xAttribute) ? xPosition + this.x.bandwidth() / 2 : xPosition},
                            ${this.isCategorical(yAttribute) ? yPosition + this.y.bandwidth() / 2 : yPosition})`;
        })
        .style("opacity", this.defaultOpacity);
        
        if(brushedDataParallelCoords.brushedDataParallelCoords.length > 0) {
            selection
            .attr("fill", d => {
                return this.isBrushedParallelCoords(d) ? this.colorScale(d[colorAttribute]) : "grey";
            });
        }
        else {
            selection
            .attr("fill", d => this.colorScale(d[colorAttribute]));
        }
        
        if(this.brushedData.length > 0) {
            selection
            .attr("fill", d => {
                return this.isBrushed(d) ? this.colorScale(d[colorAttribute]) : "grey";
                });
        }

}

// Function to determine if the attribute is categorical
isCategorical(attribute) {
    return ['Date', 'Seasons', 'Holiday', 'FunctioningDay'].includes(attribute);
}

updateAxis(visData, xAttribute, yAttribute) {
    // Save a reference to the current context
    const self = this; 
    // Define the order of categorical attributes as done in the parallel coordinates plot
    // Date and Seasons are ordered with lexicographic order
    const categoricalOrder = {
        'Date': (a, b) => d3.ascending(a, b),
        'Seasons': (a, b) => d3.ascending(a, b),
        'Holiday': (a, b) => a === "No Holiday" ? -1 : 1, // No Holiday < Holiday
        'FunctioningDay': (a, b) => a === "No" ? -1 : 1,  // No < Yes
    };

    // Function to limit tick values to 10 equally spaced categories
    // Avoid cluttering the axis with too many ticks in the case "Date" has been selected 
    const limitTicks = (values, tickCount = 8) => {
        const tickInterval = Math.max(1, Math.floor(values.length / tickCount));
        return values.filter((_, i) => i % tickInterval === 0);
    };

    // Update x-axis scale
    if (self.isCategorical(xAttribute)) {
        // Create an ordered set of x-values based on the specified order
        const orderedXValues = Array.from(new Set(visData.map(d => d[xAttribute])))
            .sort(categoricalOrder[xAttribute]);
        const sampledXCategories = limitTicks(orderedXValues);
        // Apply d3.scaleBand() for categorical data
        self.x = d3.scaleBand()
            .domain(orderedXValues) 
            .range([0, self.width]);
        // Update x-axis accordingly
        self.svg.select(".xAxisG")
            .transition().duration(self.transitionDuration)
            .call(d3.axisBottom(self.x).tickValues(sampledXCategories));
    } else {
        self.x = d3.scaleLinear()
            .domain([d3.min(visData, (item) => item[xAttribute]), d3.max(visData, (item) => item[xAttribute])])
            .range([0, self.width]);
        self.svg.select(".xAxisG")
            .transition().duration(self.transitionDuration)
            .call(d3.axisBottom(self.x));
    }

    // Update y-axis scale in a similar way
    if (self.isCategorical(yAttribute)) {
        // Create an ordered set of y-values based on the specified order
        const orderedYValues = Array.from(new Set(visData.map(d => d[yAttribute])))
            .sort(categoricalOrder[yAttribute]);
        const sampledYCategories = limitTicks(orderedYValues);
        self.y = d3.scaleBand()
            .domain(orderedYValues) 
            .range([self.height, 0]);
        self.svg.select(".yAxisG")
            .transition().duration(self.transitionDuration)
            .call(d3.axisLeft(self.y).tickValues(sampledYCategories));
    } else {
        self.y = d3.scaleLinear()
            .domain([d3.min(visData, (item) => item[yAttribute]), d3.max(visData, (item) => item[yAttribute])])
            .range([self.height, 0]);
        self.svg.select(".yAxisG")
            .transition().duration(self.transitionDuration)
            .call(d3.axisLeft(self.y));
    }

    // Add axis labels. Ensure that the previous labels are removed before adding new ones
    self.svg.select(".xAxisG").selectAll(".axis-label").remove();
    self.svg.select(".yAxisG").selectAll(".axis-label").remove();

    // Add text to the x-axis
    self.svg.select(".xAxisG")
        .append("text")
        .attr("class", "axis-label")
        .attr("fill", "black")
        .attr("x", self.width)
        .attr("y", 40)
        .attr("text-anchor", "end")
        .text(xAttribute)
        .style("font-size", "16px");

    // Add text to the y-axis
    self.svg.select(".yAxisG")
        .append("text")
        .attr("class", "axis-label")
        .attr("fill", "black")
        .attr("transform", "rotate(-90)")
        .attr("y", -75)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text(yAttribute)
        .style("font-size", "16px");
}

    
// Function to check if a data point is inside the brushed data of the parallel coordinates plot
isBrushedParallelCoords(d) {
    // Ensure brushedDataParallelCoords is defined and contains elements before checking
    if (!this.brushedDataParallelCoords || this.brushedDataParallelCoords.length === 0) {
        return false; 
    }
    
    // Get unique identifier for the current data point
    const identifier = d.index;
    for (let i = 0; i < this.brushedDataParallelCoords.brushedDataParallelCoords.length; i++) {
        const brushed = this.brushedDataParallelCoords.brushedDataParallelCoords[i];
        if (brushed.index === identifier) {
            return true; 
        }
  }

  return false;
}

// Function to check if a data point is inside the brushed data of this plot
isBrushed(d) {
    // Ensure brushedData is defined and contains elements before checking
    if (!this.brushedData || this.brushedData.length === 0) {
        return false;
    }
    // Get unique identifier for the current data point
    const identifier = d.index;
    for (let i = 0; i < this.brushedData.length; i++) {
        const brushed = this.brushedData[i];
        if (brushed.index === identifier) {
            return true;
        }
    }
    return false;
}

clearBrush() {
  this.svg.select(".brush").call(d3.brush().move, null);
  this.svg.selectAll(".dotG").style("opacity", this.defaultOpacity); 
}

renderScatterplot(data, xAttribute, yAttribute, colorAttribute, sizeAttribute, brushedDataParallelCoords, controllerMethods) {
    // Create a tooltip element if it doesn't already exist
    // It will be used to display information about the data points when the cursor hovers over them
    const tooltip = d3.select(this.container)
        .select(".scatterplot-tooltip");
    if (tooltip.empty()) {
        d3.select(this.container)
            .append("div")
            .attr("class", "scatterplot-tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px")
            .style("padding", "8px")
            .style("pointer-events", "none")
            .style("opacity", 0);
    }
    const tooltipDiv = d3.select(".scatterplot-tooltip");

    // If brushedDataParallelCoords is not empty, update opacity of dots
    if (brushedDataParallelCoords) {
        this.brushedDataParallelCoords = brushedDataParallelCoords;
        // Clear the scatter plot brush if external brushing occurs from the other plot
        this.clearBrush();
    }

    this.updateAxis(data, xAttribute, yAttribute);

    // Handle color scale: check if colorAttribute is categorical
    if (this.isCategorical(colorAttribute)) {
        // First select the unique values by building a set from the attribute values
        // Then construct an array from it and sort the values to ensure consistent color assignment
        const orderedColorValues = Array.from(new Set(data.map(d => d[colorAttribute])))
            .sort();  
        this.colorScale = d3.scaleOrdinal()
            .domain(orderedColorValues)
            .range(d3.schemeCategory10);
    } else {
        this.colorScale = d3.scaleSequential(d3.interpolateTurbo)
            .domain(d3.extent(data, (d) => d[colorAttribute]));
    }
    // do the same for the size scale
    if(this.isCategorical(sizeAttribute)){
        const orderedSizeValues = Array.from(new Set(data.map(d => d[sizeAttribute])))
            .sort();  

        this.sizeScale = d3.scaleOrdinal()
            .domain(orderedSizeValues)
            .range([1, 7]);
    } else {
        this.sizeScale = d3.scaleLinear()
            .domain(d3.extent(data, (d) => d[sizeAttribute]))
            .range([1, 7]);
    }

    // Clear previous brush and create a new brush layer
    this.svg.select(".dots-layer").remove();
    this.svg.select(".brush-layer").remove();
    const brushLayer = this.svg.append("g")
        .attr("class", "brush-layer")
        .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
    
        const brush = d3.brush()
        .extent([[0, 0], [this.width, this.height]])
        .on("start brush end", (event) => {
            const selection = event.selection;
            if (selection) {
                // Get currently selected area
                const [[x0, y0], [x1, y1]] = selection;
                // Get corresponding selected data points
                const selectedData = data.filter(d => {
                    const cx = this.x(d[xAttribute]);
                    const cy = this.y(d[yAttribute]);
                    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
                });

                // Remove all items inside brushedData
                this.brushedData = [];
                // Add the selected data to the brushedData array
                selectedData.forEach(d => this.brushedData.push(d));
                
                // Change the fill color of the selected data points with the color scale
                // While all the others are gray
                this.svg.selectAll(".dotG")
                    .attr("fill", d => {
                        return x0 <= this.x(d[xAttribute]) && this.x(d[xAttribute]) <= x1 && y0 <= this.y(d[yAttribute]) && this.y(d[yAttribute]) <= y1 
                        ? this.colorScale(d[colorAttribute]) : "grey";
                    });

                // Dispatch the selected data to the controller, which will update the store
                // And therefore also the other plot
                if (event.type === "end") {
                    controllerMethods.handleOnBrush(selectedData);
                }
            } else {
                // If no selection, reset opacity and dispatch empty array to the controller
                this.svg.selectAll(".dotG")
                    .attr("fill", "grey");

                if (event.type === "end") {
                    controllerMethods.handleOnBrush([]);
                    this.svg.selectAll(".dotG")
                    .attr("fill", d  => this.colorScale(d[colorAttribute]));
                }
            }
        });
    // Apply the brush to the its layer
    brushLayer.call(brush);

    // Create ad hoc layer for the dots
    this.svg.append("g")
            .attr("class", "dots-layer")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
    // Render dots
    const dots = this.svg.select(".dots-layer").selectAll(".dotG")
        .data(data, (itemData) => itemData.index);
    dots.join(
        (enter) => {
            const itemG = enter.append("g")
                .attr("class", "dotG")
                .style("opacity", this.defaultOpacity)
                // Handle mouse hover events and display the tooltip
                // Which shows the values of the selected attributes
                .on("mouseenter", (event, itemData) => {
                    tooltipDiv
                        .style("opacity", 1)
                        .html(
                            `<strong>${xAttribute}:</strong> ${itemData[xAttribute]}<br>
                            <strong>${yAttribute}:</strong> ${itemData[yAttribute]}<br>
                            <strong>${colorAttribute}:</strong> ${itemData[colorAttribute]}<br>
                            <strong>${sizeAttribute}:</strong> ${itemData[sizeAttribute]}`
                        );
                })
                .on("mousemove", (event) => {
                    const svgRect = this.container.getBoundingClientRect();
                    tooltipDiv
                        .style("left", `${event.clientX - svgRect.left + 10}px`)
                        .style("top", `${event.clientY - svgRect.top - 20}px`);
                })
                .on("mouseleave", () => {
                    tooltipDiv.style("opacity", 0);
                });

            itemG.append("circle")
                .attr("class", "dotCircle")
                .attr("r", this.circleRadius)
                .attr("r", d => this.sizeScale(d[sizeAttribute]))
                // If brushedDataParallelCoords is not empty, set the fill color to grey
                if(brushedDataParallelCoords.brushedDataParallelCoords.length === 0) {
                    itemG
                    .attr("fill", d => this.colorScale(d[colorAttribute]));
                }
                else {
                    // Make sure that all previously brushed data points are not highlighted anymore
                    this.brushedData = [];
                }

            this.updateDots(itemG, xAttribute, yAttribute, colorAttribute, brushedDataParallelCoords);
        },
        (update) => {
            update
                .select("circle")
                .attr("r", d => this.sizeScale(d[sizeAttribute]))
                if(brushedDataParallelCoords.brushedDataParallelCoords.length === 0) {
                    update
                    .attr("fill", d => this.colorScale(d[colorAttribute]));
                }

            this.updateDots(update, xAttribute, yAttribute, colorAttribute, brushedDataParallelCoords);
        },
        (exit) => {
            exit.remove();
        }
    );
}


  clear() {
    this.svg.selectAll("*").remove();
  }
}

export default ScatterplotD3;