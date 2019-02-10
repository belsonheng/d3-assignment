class Chart {
  constructor(opts) {
    this.margin = opts.margin;
    this.task = opts.task;
    this.element = opts.element;
    this.dataset = opts.dataset || [];
    this.width = opts.width || 1000;
    this.height = opts.height || 500;
    this.xlabel = opts.xlabel;
    this.ylabel = opts.ylabel;
    this.draw();
  }

  draw() {
    this.createContainer();
    switch (this.task) {
      case 1:
        this.createTask1();
        break;
      case 2:
        this.createTask2();
        break;
      case 3:
        this.createTask3();
        break;
      case 4:
        this.createTask4();
        break;
    }
  }

  createContainer() {
    this.svg = this.element
      .append("svg")
      .attr("width",this.width + this.margin.left + this.margin.right)
      .attr("height",this.height + this.margin.top + this.margin.bottom);
  }

  createTask1() {
    let colors = d3.scaleOrdinal()
      .domain(this.dataset[0].map(d => d.method))
      .range(d3.schemeCategory10);

    this.width = this.width;
    this.height = this.height/3;

    let x = d3.scaleLinear()
      .domain([0,d3.max(this.dataset.reduce((d1,d2) => d1.concat(d2),[]).map(d => d.avgChange))])
      .range([0,this.width]);
    let y = d3.scaleLinear()
      .domain([
        d3.min(this.dataset.reduce((d1,d2) => d1.concat(d2),[]).map(d => d.avgQuality))/2,
        d3.max(this.dataset.reduce((d1,d2) => d1.concat(d2),[]).map(d => d.avgQuality))*1.2])
      .range([this.height,0]);

    this.addCategoryLegend({
      'width': this.width,
      'rectSize': 20,
      'spacing': 5,
      'colors': colors
    });

    this.dataset.reverse().forEach((dataset,i) => {
      this.plot = this.svg.append("g")
        .attr("class","plot")
        .attr("transform","translate(" + this.margin.left + "," + (this.margin.top + (this.margin.top + this.height) * i) + ")");
      this.plot.append("g")
        .attr("class","title")
        .attr("transform","translate(" + (this.width/1.5) + "," + this.margin.top + ")")
        .append("text")
        .text("Buffer Capacity Configuration: " + dataset[0].bufSize);

      this.addAxes(d3.axisBottom(x).ticks(10),d3.axisLeft(y).ticks(10));
      this.addLabels(this.x,this.y,"inner");

      this.plot.selectAll(".dot")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("class","dot data")
        .attr("data-category",(d) => d.method)
        .style("fill",(d) => colors(d.method))
        .attr("cx",(d) => x(d.avgChange))
        .attr("cy",(d) => y(d.avgQuality))
        .attr("r","7")
        .on("mouseover",(d) => {
          this.showTooltip(
            d3.event.pageX,
            d3.event.pageY,
            "<strong>" + d.method + "</strong><br/>" +
            "Average No. of Change: <strong>" + Math.round(d.avgChange) + "</strong><br/>" +
            "Average Quality: <strong>" + Math.round(d.avgQuality) + "</strong>"
          );
        })
        .on("mouseout",() => d3.selectAll(".tooltip").remove());
    });
  }

  createTask2() {
    this.plot = this.svg.append("g")
      .attr("class","plot")
      .attr("transform","translate(" + this.margin.left + "," + this.margin.top + ")");

    let x0 = d3.scaleBand()
      .domain(this.dataset.map(d => d.bufSize).reverse())
      .rangeRound([0,this.width])
      .paddingInner(0.1);

    let x1 = d3.scaleBand()
      .domain(this.dataset.map(d => d.method))
      .rangeRound([0,x0.bandwidth()])
      .padding(0.05);

    let y = d3.scaleLinear()
      .domain([
        d3.min(this.dataset.map(d => d.avgQoe/2)),
        d3.max(this.dataset.map(d => d.avgQoe*1.2))
      ])
      .range([this.height,0]);

    let colors = d3.scaleOrdinal()
      .domain(this.dataset.map(d => d.method))
      .range(d3.schemeCategory10);

    this.addAxes(d3.axisBottom(x0).ticks(10),d3.axisLeft(y).ticks(10));
    this.addGrid(null,y);
    this.addLabels(this.x,this.y);
    this.addCategoryLegend({
      'width': this.width,
      'rectSize': 20,
      'spacing': 5,
      'colors': colors
    });

    this.plot.selectAll(".bar")
      .data(this.dataset)
      .enter()
      .append("rect")
      .attr("class","bar data")
      .attr("data-category",(d) => d.method)
      .attr("transform",(d) => "translate(" + x0(d.bufSize) + ",0)")
      .attr("x",(d) => x1(d.method))
      .attr("y",(d) => y(d.avgQoe))
      .attr("width",x1.bandwidth())
      .attr("height",(d) => this.height - y(d.avgQoe))
      .style("fill",(d) => colors(d.method))
      .on("mouseover",(d) =>
        this.showTooltip(
          d3.event.pageX,
          d3.event.pageY,
          "Buffer Size: <strong>" + d.bufSize + "</strong><br/>" +
          "Method: <strong>" + d.method + "</strong><br/>" +
          "Average QoE: <strong>" + d.avgQoe.toFixed(2) + "</strong>"
        ))
      .on("mouseout",() => d3.selectAll(".tooltip").remove());
  }

  createTask3() {
    let colors = d3.scaleOrdinal()
      .domain(this.dataset.map(d => d.method))
      .range(d3.schemeCategory10);
    let shapes = d3.scaleOrdinal()
      .domain(this.dataset.map(d => d.bufSize))
      .range([d3.symbolSquare,d3.symbolCross,d3.symbolCircle]);

    this.width = this.width;
    this.height = this.height/3;

    this.addCategoryLegend({
      'width': this.width,
      'rectSize': 20,
      'spacing': 5,
      'colors': colors
    });
    this.addShapeLegend({
      'element': "#task3 > svg > .legend",
      'width': this.width,
      'rectSize': 20,
      'spacing': 5,
      'shapes': shapes
    });

    let bufSizes = Array.from(new Set(this.dataset.map(d => d.bufSize))).reverse();
    bufSizes.forEach((bufSize,i) => {
      this.plot = this.svg.append("g")
        .attr("class","plot")
        .attr("data-category",bufSize)
        .attr("transform","translate(" + this.margin.left + "," + (this.margin.top + (this.height * i)) + ")");
      let dataset = this.dataset
        .filter(d => d.bufSize == bufSize);
      let x = d3.scaleLinear()
        .domain([0,1])
        .range([0,this.width]);
      let y = d3.scaleLinear()
        .domain([0,d3.max(dataset,(d) => d.quality)*1.1])
        .range([this.height,0]);
      let line = d3.line()
        .x(d => x(d.inefficiency))
        .y(d => y(d.quality));

      let [x1,x2,y1,y2,r,r2] = this.calculateRegression(
        0.05,
        0.95,
        dataset.map(d => d.inefficiency),
        dataset.map(d => d.quality)
      );

      this.plot.append("line")
        .attr("class","regression")
        .attr("x-domain",x.domain())
        .attr("x-range",x.range())
        .attr("y-domain",y.domain())
        .attr("y-range",y.range())
        .attr("x1",x(x1))
        .attr("x2",x(x2))
        .attr("y1",y(y1))
        .attr("y2",y(y2))
        .attr("r",r)
        .attr("r2",r2);

      this.plot.append("text")
        .attr("class","r")
        .attr("x",x(x2) + 10)
        .attr("y",y(y2))
        .text("r = " + r.toFixed(3));
      this.plot.append("text")
        .attr("class","r2")
        .attr("x",x(x2) + 10)
        .attr("y",y(y2) + 15)
        .text("r\u00B2 = " + r2.toFixed(3));

      if (i == bufSizes.length - 1) {
        this.addAxes(d3.axisBottom(x).ticks(10, "%"),d3.axisLeft(y).ticks(5));
        this.addLabels(this.x,null);
      } else {
        this.addAxes(d3.axisBottom(x).tickSize(0).tickValues([]),d3.axisLeft(y).ticks(5));
      }
      if (i == (bufSizes.length - 1) / 2) {
        this.addLabels(null,this.y);
      }

      this.plot.selectAll(".point")
        .data(dataset)
        .enter()
        .append("path")
        .attr("class","point data")
        .attr("data-x",d => d.inefficiency)
        .attr("data-y",d => d.quality)
        .attr("transform",d => "translate(" + x(d.inefficiency) + "," + y(d.quality)+ ")")
        .attr("d",d3.symbol().size([90]).type(d => shapes(d.bufSize)))
        .style("stroke",d => colors(d.method))
        .style("fill","none")
        .on("mouseover",(d,i,nodes) => {
          d3.select(nodes[i]).style("fill",colors(d.method));
          this.showTooltip(
            d3.event.pageX,
            d3.event.pageY,
            "<strong>" + d.method + "</strong><br/>" +
            "Buffer Size: <strong>" + d.bufSize + "</strong><br/>" +
            "Inefficiency: <strong>" + (d.inefficiency*100).toFixed(2) + "%</strong><br/>" +
            "Quality: <strong>" + d.quality + "</strong>"
          );
        })
        .on("mouseout",(_,i,nodes) => {
          d3.select(nodes[i]).style("fill","none");
          d3.selectAll(".tooltip").remove();
        });
    });
  }

  createTask4() {
    this.plot = this.svg.append("g")
      .attr("class","plot")
      .attr("transform","translate(" + this.margin.left + "," + this.margin.top + ")");

    let methods = Array.from(new Set(this.dataset.map(d => d.method)));
    let profiles = Array.from(new Set(this.dataset.map(d => d.profile)));
    let gridSize = Math.floor(this.width / methods.length);
    let height = gridSize * (profiles.length + 2);
    let legendWidth = this.width * 0.5;

    let x = d3.scaleLinear()
      .domain([0,d3.max(this.dataset,d => d.numStall)])
      .range([-legendWidth/2,legendWidth/2])

    let colors = d3.scaleLinear()
      .domain([0,d3.max(this.dataset,d => d.numStall)/2,d3.max(this.dataset,d => d.numStall)])
      .range(["#EFF9F3","#51B165","#046435"]);

    let countScale = d3.scaleLinear()
    	.domain([0,d3.max(this.dataset,d => d.numStall)])
    	.range([0,this.width]);

    let numStops = 5;
    let countRange = countScale.domain();
    countRange[2] = countRange[1] - countRange[0];
    let countPoint = [];
    for(let i=0;i<numStops;i++) {
    	countPoint.push(i * countRange[2]/(numStops-1) + countRange[0]);
    }

    this.legend = this.svg.append("g")
      .attr("class","legend")
      .attr("transform","translate(" + (this.margin.left + this.width / 2) + "," + (gridSize * profiles.length + this.margin.bottom) + ")");

    this.legend.append("defs")
    	.append("linearGradient")
    	.attr("id","legend-traffic")
    	.attr("x1","0%").attr("y1","0%")
    	.attr("x2","100%").attr("y2","0%")
    	.selectAll("stop")
    	.data(d3.range(5))
    	.enter()
      .append("stop")
    	.attr("offset",(d,i) => countScale(countPoint[i])/this.width)
    	.attr("stop-color",(d,i) => colors(countPoint[i]));

    this.legend.append("text")
    	.attr("class","legend-title")
    	.attr("x",0)
    	.attr("y",0)
    	.style("text-anchor","middle")
    	.text("Number of Stalls");

    this.legend.append("rect")
      .attr("class","scale-data")
      .attr("x",-legendWidth/2)
      .attr("y",10)
      .attr("width",legendWidth)
      .attr("height",10)
      .style("fill","url(#legend-traffic)")
      .style("cursor","default");

    this.legend.append("g")
      .attr("class","x-axis")
      .attr("transform","translate(0,25)")
      .call(d3.axisBottom(x).ticks(5).tickSize(0))
      .call(g => g.select(".domain").remove());

    this.plot.append("g")
      .attr("class","x-axis")
      .attr("transform","translate(" + gridSize/2 + ",-7)")
      .selectAll(".heat-label")
      .data(methods)
      .enter()
      .append("text")
      .text(d => d)
      .attr("x",(_,i) => i * gridSize)
      .attr("y",0)
      .style("text-anchor","middle")
      .style("font-weight","400");

    this.plot.append("g")
      .attr("class","y-axis")
      .attr("transform","translate(-15," + gridSize/1.7 + ")")
      .selectAll(".heat-label")
      .data(profiles)
      .enter()
      .append("text")
      .text(d => d)
      .attr("x",0)
      .attr("y",(_,i) => i * gridSize)
      .style("text-anchor","middle")
      .style("font-weight","400");

    this.plot.selectAll(".heat")
      .data(this.dataset)
      .enter()
      .append("rect")
      .attr("class","heat")
      .attr("data-category",(d) => d.method)
      .attr("data-value",(d) => d.numStall)
      .attr("x",(d) => methods.indexOf(d.method)*gridSize)
      .attr("y",(d) => profiles.indexOf(d.profile)*gridSize)
      .attr("width",gridSize)
      .attr("height",gridSize)
      .style("stroke","white")
      .style("stroke-opacity",.7)
      .style("fill",(d) => colors(d.numStall))
      .on("mouseover",(d) => {
        this.showTooltip(
          d3.event.pageX,
          d3.event.pageY,
          "<strong>" + d.method + "</strong><br/>" +
          "Profile: <strong>" + d.profile + "</strong><br/>" +
          "No. of Stalls: <strong>" + d.numStall + "</strong>"
        );
      })
      .on("mouseout",() => d3.selectAll(".tooltip").remove());
  }

  addAxes(x,y) {
    this.x = this.plot.append("g")
      .attr("class","x-axis")
      .attr("transform","translate(0," + this.height + ")")
      .call(x);
    this.y = this.plot.append("g")
      .attr("class","y-axis")
      .call(y);
  }

  addGrid(x,y) {
    this.y.append("g")
      .attr("class","grid")
      .call(d3.axisLeft(y).tickSize(-this.width).tickFormat(""));
  }

  addLabels(x,y,type) {
    if (x) {
      switch (type) {
        case "inner":
          x.append("text")
            .attr("x",this.width)
            .attr("y",-20)
            .attr("dy",".8em")
            .style("fill","black")
            .style("text-anchor","end")
            .text(this.xlabel);
          break;
        default:
          x.append("text")
            .attr("x",this.width/2)
            .attr("y",35)
            .style("fill","black")
            .style("text-anchor","middle")
            .text(this.xlabel);
          break;
      }
    }
    if (y) {
      switch (type) {
        case "inner":
          y.append("text")
            .attr("transform","rotate(-90)")
            .attr("x",0)
            .attr("y",5)
            .attr("dy",".8em")
            .style("fill","black")
            .style("text-anchor","end")
            .text(this.ylabel);
          break;
        default:
          y.append("text")
            .attr("transform","rotate(-90)")
            .attr("x",0 - (this.height/2))
            .attr("y",-80)
            .style("fill","black")
            .style("text-anchor","middle")
            .text(this.ylabel);
          break;
      }
    }
  }

  addCategoryLegend(opts) {
    this.legend = this.svg.append("g")
      .attr("class","legend")
      .attr("transform","translate(" + (this.margin.right + opts.rectSize - 5) + "," + this.margin.top + ")")
      .selectAll(".legend-data")
      .data(opts.colors.domain())
      .enter()
      .append("g")
      .attr("class","legend-data")
      .attr("transform",(d,i) => "translate(" + opts.width + "," + i * (opts.rectSize + opts.spacing) + ")")
      .on("click",(label) => {
        d3.selectAll(".legend-data,.data")
          .filter(d => (d.method) ? d.method === label : d === label)
          .attr("class",(_,i,nodes) => {
            let cls = d3.select(nodes[i]).attr("class");
            if (cls.includes("selected")) {
              if (d3.selectAll(".legend-data.selected").size() === 0) {
                d3.selectAll(".disabled").classed("disabled",false);
                return cls.replace(" selected","")
              } else {
                return cls.replace(" selected"," disabled");
              }
            } else if (cls.includes("disabled")) {
              return cls.replace(" disabled"," selected");
            } else {
              return cls + " selected";
            }
          });
          this.updateRegression();
      })
      .on("mouseover",(label) => {
        if (d3.selectAll(".selected").empty()) {
          d3.selectAll(".legend-data,.data")
            .filter(d => (d.method) ? d.method !== label : d !== label)
            .attr("class",(_,i,nodes) => {
              let cls = d3.select(nodes[i]).attr("class");
              return cls.includes("disabled")
                ? cls.replace(" disabled","")
                : cls + " disabled"
            });
          this.updateRegression();
        }
      })
      .on("mouseout",(label) => {
        if (d3.selectAll(".selected").empty()) {
          d3.selectAll(".legend-data,.data")
            .filter(d => (d.method) ? d.method !== label : d !== label)
            .attr("class",(_,i,nodes) => {
              let cls = d3.select(nodes[i]).attr("class");
              if (cls.includes("disabled")) {
                return cls.replace(" disabled","");
              } else {
                return cls;
              }
            });
        }
        this.updateRegression();
      });
    this.legend.append("rect")
      .attr("width",opts.rectSize)
      .attr("height",opts.rectSize)
      .attr("fill",opts.colors)
      .attr("stroke",opts.colors);

    this.legend.append("text")
      .attr("x",opts.rectSize + opts.spacing)
      .attr("y",opts.rectSize - opts.spacing)
      .text(d => d);
  }

  addShapeLegend(opts) {
    d3.select(opts.element)
      .append("g")
      .attr("class","legend-title")
      .append("text")
      .attr("x",this.width)
      .attr("y",this.height - 10)
      .text("Buffer Size");

    this.legend = d3.select(opts.element)
      .selectAll(".legend")
      .data(opts.shapes.domain().reverse())
      .enter()
      .append("g")
      .attr("class","legend-data")
      .attr("transform",(d,i) =>
        "translate(" + opts.width + "," + ((12+i) * (opts.rectSize + opts.spacing)) + ")")
      .style("cursor","default");

    this.legend.append("path")
      .attr("d",d3.symbol().size([90]).type(d => opts.shapes(d)))
      .attr("transform","translate(10,10)");

    this.legend.append("text")
      .attr("x",opts.rectSize + opts.spacing)
      .attr("y",opts.rectSize - opts.spacing)
      .text(d => d);
  }

  calculateRegression(x1,x2,x,y) {
    let { min, pow, sqrt } = Math;
    let add = (a,b) => a + b;
    let n = min(x.length, y.length);
    if (n === 0) {
     return;
    }
    [x,y] = [x.slice(0,n),y.slice(0,n)];
    let [sumX,sumY] = [x,y].map(l => l.reduce(add));
    let [sumX2,sumY2] = [x,y].map(l => l.reduce((a, b) => a + pow(b,2),0));
    let sumXY = x.map((n,i) => n * y[i]).reduce(add);
    let m = (n * sumXY - sumX * sumY) / (n * sumX2 - pow(sumX,2));
    let b = (sumY - m * sumX) / n;
    let r = (n * sumXY - sumX * sumY) / sqrt((n * sumX2 - pow(sumX,2)) * (n * sumY2 - pow(sumY,2)));
    let r2 = pow(r,2);

    x1 = x1 || x.reduce((n1,n2) => n1 < n2 ? n1 : n2, x[0]);
    x2 = x2 || x.reduce((n1,n2) => n1 > n2 ? n1 : n2, x[0]);
    let y1 = m * x1 + b;
    let y2 = m * x2 + b;
    return [x1,x2,y1,y2,r,r2];
  }

  updateRegression() {
    d3.selectAll("#task3 g.plot").nodes().forEach(g => {
      let x = [], y = [];
      let yScale = d3.scaleLinear()
        .domain(d3.select(g).select("line").attr("y-domain").split(",").map(Number))
        .range(d3.select(g).select("line").attr("y-range").split(",").map(Number));
      d3.select(g).selectAll("path.data:not(.disabled)").each(d =>
        {
          x.push(d.inefficiency);
          y.push(d.quality);
        }
      );
      let [x1,x2,y1,y2,r,r2] = this.calculateRegression(0.05,0.95,x,y);
      d3.select(g).select("line").attr("y1",yScale(y1)).attr("y2",yScale(y2));
      d3.select(g).select("text.r")
        .attr("y",yScale(y2))
        .text("r = " + r.toFixed(3));
      d3.select(g).select("text.r2")
        .attr("y",yScale(y2) + 15)
        .text("r\u00B2 = " + r2.toFixed(3));
    });
  }

  showTooltip(x,y,content) {
    this.tooltip = d3.select("body")
      .append("div")
      .attr("class","tooltip")
      .style("left",x + 10 + "px")
      .style("top",y - 80 + "px")
      .style("display","inline-block")
      .html(content);
  }
}
