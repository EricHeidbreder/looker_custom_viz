/**
 * Welcome to the Looker Visualization Builder! Please refer to the following resources 
 * to help you write your visualization:
 *  - API Documentation - https://github.com/looker/custom_visualizations_v2/blob/master/docs/api_reference.md
 *  - Example Visualizations - https://github.com/looker/custom_visualizations_v2/tree/master/src/examples
 **/

 function ColorLuminance(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}

 const visObject = {
    /**
     * Configuration options for your visualization. In Looker, these show up in the vis editor
     * panel but here, you can just manually set your default values in the code.
     **/
     options: {
        id: 'lollipop',
        label: 'Lollipop Chart',
        point_color: {
           type: "string",
           display: "color",
           label: "Point Color",
           default: "#69b3a2"
        }
     },
    
    /**
     * The create function gets called when the visualization is mounted but before any
     * data is passed to it.
     **/
       create: function(element, config){
           	element.style.margin = "10px"
           	element.style.width = "100%"
         	element.style.height = "100%"
         	element.style.display = "flex"
       },
   
    /**
     * UpdateAsync is the function that gets called (potentially) multiple times. It receives
     * the data and should update the visualization with the new data.
     **/
   
       updateAsync: function(data, element, config, queryResponse, details, doneRendering){
         // set the dimensions and margins of the graph
         var margin = {top: 10, right: 30, bottom: 60, left: 40},
             width = window.innerWidth,
             height = window.innerHeight;

         // append the svg object to the body of the page
         // append a 'group' element to 'svg'
         // moves the 'group' element to the top left margin

         // Note that d3.select() needs to reference '#vis' because that's what Looker is going to call the div that contains the visualization
         element.innerHTML = ""
          var svg = d3.select("#vis").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", 
                "translate(" + margin.left + "," + margin.top + ")");

          formattedData = []

          // format the data
          data.forEach(function(d) {
              formattedData.push({
              firstDim: d[queryResponse.fields.dimensions[0].name]['value'],
              firstMeas: d[queryResponse.fields.measures[0].name]['value']
              });
          });

          // X axis
          var x = d3.scaleBand()
              .range([ 0, width ])
              .domain(formattedData.map(function(d) { return d.firstDim; }))
              .padding(1);
          svg.append("g")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(x))
              .selectAll("text")
              .attr("transform", "translate(-10,0)rotate(-45)")
              .style("text-anchor", "end");

          // Add Y axis
          var y = d3.scaleLinear()
              .domain([0, d3.max(formattedData.map(function(d) { return d.firstMeas }))])           .range([ height, 0]);
          svg.append("g")
              .call(d3.axisLeft(y));

          // Lines
          svg.selectAll("myline")
              .data(formattedData)
              .enter()
              .append("line")
              .attr("x1", function(d) { return x(d.firstDim); })
              .attr("x2", function(d) { return x(d.firstDim); })
              .attr("y1", function(d) { return y(d.firstMeas); })
              .attr("y2", y(0))
              .attr("stroke", "grey")

          // Circles
          svg.selectAll("mycircle")
              .data(formattedData)
              .enter()
              .append("circle")
              .attr("cx", function(d) { return x(d.firstDim); })
              .attr("cy", function(d) { return y(d.firstMeas); })
              .attr("r", "5")
              .style("fill", config.point_color)
              .style("stroke", ColorLuminance(config.point_color, -0.2))
              .style("stroke-width", 2)

             doneRendering()
       }
   };

looker.plugins.visualizations.add(visObject);