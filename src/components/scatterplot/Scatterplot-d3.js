import * as d3 from 'd3';

class ScatterplotD3 {
  margin = { top: 40, right: 40, bottom: 50, left: 85 };
  size;
  width;
  height;
  svg;
  x;
  y;
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
      .attr("width", this.size.width)
      .attr("height", this.size.height);

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
      .attr("transform", (item) => `translate(${this.x(item[xAttribute])},${this.y(item[yAttribute])})`)
      .style("opacity", d => {
        // If the data point is in the brushedData, set opacity to 0.4, else 0.02
        return this.isBrushed(d) ? 0.8 : 0.3;
    });
    // this.changeBorderAndOpacity(selection);
  }

  highlightSelectedItems(selectedItems) {
    this.svg.select("g").selectAll(".dotG")
      .data(selectedItems, (itemData) => itemData.index)
      .join(
        (enter) => enter,
        (update) => this.changeBorderAndOpacity(update),
        (exit) => exit.remove()
      );
  }

  updateAxis(visData, xAttribute, yAttribute) {
    this.x.domain([d3.min(visData, (item) => item[xAttribute]), d3.max(visData, (item) => item[xAttribute])]);
    this.y.domain([d3.min(visData, (item) => item[yAttribute]), d3.max(visData, (item) => item[yAttribute])]);

    // Update the x-axis
    this.svg.select(".xAxisG")
        .transition().duration(this.transitionDuration)
        .call(d3.axisBottom(this.x));

    // Remove the old x-axis label
    this.svg.select(".xAxisG").selectAll(".axis-label").remove();

    // Add text to the x-axis
    this.svg.select(".xAxisG")
        .append("text")
        .attr("class", "axis-label") // Add a class for easy selection for text removal upon axis update
        .attr("fill", "black")
        .attr("x", this.width)
        .attr("y", 30)
        .attr("text-anchor", "end")
        .text(xAttribute)
        .style("font-size", "16px");

    // Update the y-axis
    this.svg.select(".yAxisG")
        .transition().duration(this.transitionDuration)
        .call(d3.axisLeft(this.y));

    // Remove the old y-axis label
    this.svg.select(".yAxisG").selectAll(".axis-label").remove();

    // Add text to the y-axis
    this.svg.select(".yAxisG")
        .append("text")
        .attr("class", "axis-label") // Add a class for easy selection
        .attr("fill", "black")
        .attr("transform", "rotate(-90)")
        .attr("y", -65)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text(yAttribute)
        .style("font-size", "16px");

    // make the axes ticks bigger
    this.svg.selectAll(".xAxisG").selectAll("text").style("font-size", "14px");
    this.svg.selectAll(".yAxisG").selectAll("text").style("font-size", "14px");
}

// Generate a unique identifier for each data point
getUniqueId(d) {
  // print current date and hour
  return `${d.Date}-${d.Hour}`;  // Use key attributes to create a unique ID
}

// Check if a data point is inside the brushed data by iterating over brushedData explicitly
isBrushed(d) {
  // Ensure brushedData is defined and contains elements before checking
  if (!this.brushedDataParallelCoords || this.brushedDataParallelCoords.length === 0) {
      return false; // No brushed data, all points will be shown with default opacity
  }

  console.log("Brushed data from Parallel Coords:", this.brushedDataParallelCoords);
  // if brushData is not empty, print it
  if(this.brushedDataParallelCoords.brushedDataParallelCoords.length > 0)
  {
    console.log("Brushed data:", this.brushedDataParallelCoords);
  }
  const uniqueId = this.getUniqueId(d);  // Get unique identifier for the current data point

  // Iterate over the brushedData and compare the uniqueIds
  for (let i = 0; i < this.brushedDataParallelCoords.brushedDataParallelCoords.length; i++) {
      const brushed = this.brushedDataParallelCoords.brushedDataParallelCoords[i];
      if (this.getUniqueId(brushed) === uniqueId) {
          console.log("Match found for:", uniqueId);
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
  // if brushedDataParallelCoords is not empty, then update the opacity of the dots
  if (brushedDataParallelCoords) {
      this.brushedDataParallelCoords = brushedDataParallelCoords;
      // Clear the scatter plot brush if external brushing occurs
      this.clearBrush();
  }

  this.updateAxis(data, xAttribute, yAttribute);

  this.colorScale = d3.scaleSequential(d3.interpolateTurbo)
      .domain(d3.extent(data, (d) => d[colorAttribute]));

  this.sizeScale = d3.scaleLinear()
      .domain(d3.extent(data, (d) => d[sizeAttribute]))
      .range([1, 6]);

      const brush = d3.brush()
      .extent([[0, 0], [this.size.width, this.size.height]]) // Define the extent of the brush
      .on("start brush end", (event) => {
          const selection = event.selection;
          if (selection) {
              const [[x0, y0], [x1, y1]] = selection;

              // Adjust coordinates for the margin
              const adjustedX0 = x0 - this.margin.left;
              const adjustedX1 = x1 - this.margin.left;
              const adjustedY0 = y0 - this.margin.top;
              const adjustedY1 = y1 - this.margin.top;
    
              const selectedData = data.filter(d => {
                  const cx = this.x(d[xAttribute]);
                  const cy = this.y(d[yAttribute]);
                  return adjustedX0 <= cx && cx <= adjustedX1 && adjustedY0 <= cy && cy <= adjustedY1;
              });
    
              this.svg.selectAll(".dotG")
                  .style("opacity", d => {
                      const cx = this.x(d[xAttribute]);
                      const cy = this.y(d[yAttribute]);
                      return adjustedX0 <= cx && cx <= adjustedX1 && adjustedY0 <= cy && cy <= adjustedY1 ? 0.8 : 0.3;
                    });
    
              if (event.type === "end") {
                  controllerMethods.handleOnBrush(selectedData);
              }
          } else {
              this.svg.selectAll(".dotG")
                  .style("opacity", 0.3);
    
              if (event.type === "end") {
                  // Dispatch an empty array to clear the brushed data
                  controllerMethods.handleOnBrush([]);
              }
          }
      });
    
    // Apply the brush to the scatterplot (styling is done in the CSS file, fine-grained control)
    this.svg.append("g").attr("class", "brush").call(brush);
      // this.svg.select("g").selectAll(".brush")
      // .call(brush);  

  this.svg.select("g").selectAll(".dotG")
      .data(data, (itemData) => itemData.index)
      .join(
          (enter) => {
              const itemG = enter.append("g")
                  .attr("class", "dotG")
                  .style("opacity", this.defaultOpacity)
                  .on("click", (event, itemData) => {
                      controllerMethods.handleOnClick(itemData);
                  });

              itemG.append("circle")
                  .attr("class", "dotCircle")
                  .attr("r", this.circleRadius)
                  .attr("r", d => this.sizeScale(d[sizeAttribute]))
                  .attr("fill", d => this.colorScale(d[colorAttribute]));

              this.updateDots(itemG, xAttribute, yAttribute);
          },
          (update) => {
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