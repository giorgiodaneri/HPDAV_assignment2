import * as d3 from 'd3';

class ScatterplotD3 {
  margin = { top: 40, right: 50, bottom: 50, left: 85 };
  size;
  width;
  height;
  svg;
  x;
  y;
  colorAttribute;
  colorScale;
  sizeScale;
  brushedDataParallelCoords;
  defaultOpacity = 0.3;
  transitionDuration = 1000;
  circleRadius = 3;

  constructor(container) {
    this.container = container;
    this.svg = d3.select(container).append("svg");
    this.brushedDataParallelCoords = [];
  }

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

  changeBorderAndOpacity(selection) {
    selection.style("opacity", (item) => item.selected ? 1 : this.defaultOpacity)
      .select(".dotCircle")
      .attr("stroke-width", (item) => item.selected ? 2 : 0);
  }

  updateDots(selection, xAttribute, yAttribute) {
    selection
        .transition().duration(this.transitionDuration)
        .attr("transform", (item) => {
            const xPosition = this.x(item[xAttribute]);
            const yPosition = this.y(item[yAttribute]);

            // Handle categorical attributes as discrete positions
            return `translate(${xPosition},${yPosition})`;
        })
        .style("opacity", d => {
            return this.isBrushed(d) ? 0.8 : 0.3;
        });
}

// Helper function to determine if the attribute is categorical
isCategorical(attribute) {
    return ['Date', 'Seasons', 'Holiday', 'FunctioningDay'].includes(attribute);
}

updateAxis(visData, xAttribute, yAttribute) {
    const self = this;  // Capture the correct `this` context
    
    const categoricalOrder = {
        'Date': (a, b) => d3.ascending(a, b),
        'Seasons': (a, b) => d3.ascending(a, b),
        'Holiday': (a, b) => a === "No Holiday" ? -1 : 1,
        'FunctioningDay': (a, b) => a === "No" ? -1 : 1,
    };

    // Function to limit tick values to 10 equally spaced categories
    const limitTicks = (values, tickCount = 8) => {
        const tickInterval = Math.max(1, Math.floor(values.length / tickCount));
        return values.filter((_, i) => i % tickInterval === 0);
    };

    // Update x-axis scale
    if (self.isCategorical(xAttribute)) {
        // Create an ordered set of x-values based on the specified order
        const orderedXValues = Array.from(new Set(visData.map(d => d[xAttribute])))
            .sort(categoricalOrder[xAttribute]);

        // Limit to 10 equally spaced ticks
        const sampledXCategories = limitTicks(orderedXValues);

        // Apply d3.scaleBand() for categorical data
        self.x = d3.scaleBand()
            .domain(orderedXValues)  // domain directly from data values
            .range([0, self.width]);

        // Update x-axis with the correct scale and limited ticks
        self.svg.select(".xAxisG")
            .transition().duration(self.transitionDuration)
            .call(d3.axisBottom(self.x).tickValues(sampledXCategories));
    } else {
        // Use d3.scaleLinear() for continuous data
        self.x = d3.scaleLinear()
            .domain([d3.min(visData, (item) => item[xAttribute]), d3.max(visData, (item) => item[xAttribute])])
            .range([0, self.width]);

        // Update x-axis with correct scale
        self.svg.select(".xAxisG")
            .transition().duration(self.transitionDuration)
            .call(d3.axisBottom(self.x));
    }

    // Update y-axis scale
    if (self.isCategorical(yAttribute)) {
        // Create an ordered set of y-values based on the specified order
        const orderedYValues = Array.from(new Set(visData.map(d => d[yAttribute])))
            .sort(categoricalOrder[yAttribute]);

        // Limit to 10 equally spaced ticks
        const sampledYCategories = limitTicks(orderedYValues);

        // Apply d3.scaleBand() for categorical data
        self.y = d3.scaleBand()
            .domain(orderedYValues)  // domain directly from data values
            .range([self.height, 0]);

        // Update y-axis with the correct scale and limited ticks
        self.svg.select(".yAxisG")
            .transition().duration(self.transitionDuration)
            .call(d3.axisLeft(self.y).tickValues(sampledYCategories));
    } else {
        // Use d3.scaleLinear() for continuous data
        self.y = d3.scaleLinear()
            .domain([d3.min(visData, (item) => item[yAttribute]), d3.max(visData, (item) => item[yAttribute])])
            .range([self.height, 0]);

        // Update y-axis with correct scale
        self.svg.select(".yAxisG")
            .transition().duration(self.transitionDuration)
            .call(d3.axisLeft(self.y));
    }

    // Add axis labels (ensure only one is present)
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

    
// Check if a data point is inside the brushed data by iterating over brushedData explicitly
isBrushed(d) {
    // Ensure brushedData is defined and contains elements before checking
    if (!this.brushedDataParallelCoords || this.brushedDataParallelCoords.length === 0) {
        return false; // No brushed data, all points will be shown with default opacity
    }
    // Get unique identifier for the current data point
    const identifier = d.index;
    // Iterate over the brushedData and compare the uniqueIds
    for (let i = 0; i < this.brushedDataParallelCoords.brushedDataParallelCoords.length; i++) {
        const brushed = this.brushedDataParallelCoords.brushedDataParallelCoords[i];
        if (brushed.index === identifier) {
            return true; // If a match is found, return true
        }
  }

  return false; // If no match is found, return false
}

clearBrush() {
  this.svg.select(".brush").call(d3.brush().move, null); // Clear the brush programmatically
  this.svg.selectAll(".dotG").style("opacity", this.defaultOpacity); // Reset dot opacity
}

renderScatterplot(data, xAttribute, yAttribute, colorAttribute, sizeAttribute, brushedDataParallelCoords, controllerMethods) {
    // Create a tooltip element if it doesn't already exist
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
        // Clear the scatter plot brush if external brushing occurs
        this.clearBrush();
    }

    this.updateAxis(data, xAttribute, yAttribute);

    // Handle color scale: check if colorAttribute is categorical or continuous
    if (this.isCategorical(colorAttribute)) {
        const orderedColorValues = Array.from(new Set(data.map(d => d[colorAttribute])))
            .sort();  // Sort the categorical values as needed

        this.colorScale = d3.scaleOrdinal()
            .domain(orderedColorValues)
            .range(d3.schemeCategory10);  // Use a color scale (like d3.schemeCategory10)
    } else {
        this.colorScale = d3.scaleSequential(d3.interpolateTurbo)
            .domain(d3.extent(data, (d) => d[colorAttribute]));
    }

    this.sizeScale = d3.scaleLinear()
        .domain(d3.extent(data, (d) => d[sizeAttribute]))
        .range([1, 6]);

    // Clear previous brush and create a new brush layer
    this.svg.select(".brush-layer").remove();
    const brushLayer = this.svg.append("g")
        .attr("class", "brush-layer")
        .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    const brush = d3.brush()
        .extent([[0, 0], [this.width, this.height]])
        .on("start brush end", (event) => {
            const selection = event.selection;
            if (selection) {
                const [[x0, y0], [x1, y1]] = selection;

                const selectedData = data.filter(d => {
                    const cx = this.x(d[xAttribute]);
                    const cy = this.y(d[yAttribute]);
                    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
                });

                this.svg.selectAll(".dotG")
                    .style("opacity", d => {
                        const cx = this.x(d[xAttribute]);
                        const cy = this.y(d[yAttribute]);
                        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1 ? 0.8 : 0.3;
                    });

                if (event.type === "end") {
                    controllerMethods.handleOnBrush(selectedData);
                }
            } else {
                this.svg.selectAll(".dotG")
                    .style("opacity", 0.3);

                if (event.type === "end") {
                    controllerMethods.handleOnBrush([]);
                }
            }
        });

    // Apply the brush to the brush layer
    brushLayer.call(brush);

    // remove previous dots layer and create a new one
    this.svg.select(".dots-layer").remove();
    const dotsLayer = this.svg.append("g")
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
                .on("mouseenter", (event, itemData) => {
                    tooltipDiv
                        .style("opacity", 1)
                        .html(
                            `<strong>${xAttribute}:</strong> ${itemData[xAttribute]}<br>
                            <strong>${yAttribute}:</strong> ${itemData[yAttribute]}<br>
                            <strong>${colorAttribute}:</strong> ${itemData[colorAttribute]}<br>`
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
                .attr("fill", d => this.colorScale(d[colorAttribute]));

            this.updateDots(itemG, xAttribute, yAttribute);
        },
        (update) => {
            update
                .select("circle")
                .transition()
                .duration(this.transitionDuration)
                .attr("r", d => this.sizeScale(d[sizeAttribute]))
                .attr("fill", d => this.colorScale(d[colorAttribute]));

            this.updateDots(update, xAttribute, yAttribute);
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