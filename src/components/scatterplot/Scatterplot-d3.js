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
  defaultOpacity = 0.3;
  transitionDuration = 500;
  circleRadius = 3;

  constructor(container) {
    this.container = container;
    this.svg = d3.select(container).append("svg");
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
      .attr("transform", (item) => `translate(${this.x(item[xAttribute])},${this.y(item[yAttribute])})`);
    this.changeBorderAndOpacity(selection);
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

    this.svg.select(".xAxisG")
      .transition().duration(1000)
      .call(d3.axisBottom(this.x));

    // add text to the x-axis
    this.svg.select(".xAxisG")
      .append("text")
      .attr("fill", "black")
      .attr("x", this.width)
      .attr("y", 30)
      .attr("text-anchor", "end")
      .text(xAttribute)
      .style("font-size", "14px");;


    this.svg.select(".yAxisG")
      .transition().duration(1000)
      .call(d3.axisLeft(this.y));

    // add text to the y-axis
    this.svg.select(".yAxisG")
      .append("text")
      .attr("fill", "black")
      .attr("transform", "rotate(-90)")
      .attr("y", -55)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text(yAttribute)
      .style("font-size", "14px");
  }

  renderScatterplot(data, xAttribute, yAttribute, colorAttribute, sizeAttribute, controllerMethods) {
    this.updateAxis(data, xAttribute, yAttribute);

    this.colorScale = d3.scaleSequential(d3.interpolateTurbo)
      .domain(d3.extent(data, (d) => d[colorAttribute]));

    this.sizeScale = d3.scaleLinear()
      .domain(d3.extent(data, (d) => d[sizeAttribute]))
      .range([1, 6]);

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
            .attr("stroke", "red")
            .attr("r", d => this.sizeScale(d[sizeAttribute]))
            .attr("fill", d => this.colorScale(d[colorAttribute]))

            // Brushing functionality
            const brush = d3.brush()
            .extent([[0, 0], [this.size.width, this.size.height]])
            .on("start brush end", (event) => {
                const selection = event.selection;

                if (selection) {
                    const [[x0, y0], [x1, y1]] = selection;

                    // Adjust opacity based on whether points fall within the brushed area
                    // So that they are easily distinguishable from the user perspective
                    itemG.attr("opacity", d => {
                        const cx = this.x(d[xAttribute]);
                        const cy = this.y(d[yAttribute]);
                        const isSelected = x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
                        return isSelected ? 0.8 : 0.3;  // 0.6 for selected points, 0.3 for others
                    });

                    // Filter data to only include points within the brushed area
                    const selectedData = data.filter(d => {
                        const cx = this.x(d[xAttribute]);
                        const cy = this.y(d[yAttribute]);
                        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
                    });

                    if (event.type === "end") {
                        // Trigger callback with the selected data only at the end of the brush
                        controllerMethods.handleOnBrush(selectedData);
                    }
                } else {
                    // Reset opacity when brush is cleared
                    itemG.attr("opacity", 0.3);  // Set all points back to 0.3
                }
            });
        // Append brush to the SVG
        this.svg.append("g").attr("class", "brush").call(brush);

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