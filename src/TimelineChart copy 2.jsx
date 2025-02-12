import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./index.css";

const TimelineChart = ({ csvFile }) => {
  const [data, setData] = useState([]);
  const svgRef = useRef();
  const containerRef = useRef(null);
  const eraPositions = useRef({}); // Store positions for each era
  const colors = ["#BB5223", "#018079", "#1963BE", "#D2AB6A"];

  useEffect(() => {
    // Load and parse the CSV file
    d3.csv(csvFile).then((csvData) => {
      const parsedData = csvData.map((d) => {
        const [start, end] = d.Period_Timeline.split("-").map(Number);
        return {
          composer: d.Composure,
          period_timeline: d.Period_Timeline,
          period: d.Period,
          start: new Date(start, 0, 1),
          end: new Date(end, 11, 31),
          photo: d.Photo_Url, // Dynamically load the photo
          funFact: d.Fun_Fact,
        };
      });
      setData(parsedData);
    });
  }, [csvFile]);

  const handleNavigation = (era) => {
    console.log("Navigating to:", era);
    console.log("X Position:", eraPositions.current[era]);
    console.log("containerRef:", containerRef.current);

    if (containerRef.current) {
      console.log("dd");

      containerRef.current.scrollTo ({
        left: eraPositions.current[era]
      });
    }
    
  };

  useEffect(() => {
    window.handleNavigation = handleNavigation;
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const periods = Array.from(new Set(data.map((d) => d.period))); // Unique periods
    const width = window.innerWidth - 200; // Each section has 100vw
    const height = window.innerHeight;
    const margin = { top: 150, right: 50, bottom: 250, left: 150 };

    const svg = d3.select(containerRef.current);
    svg.selectAll("*").remove(); // Clear previous SVG

    const chartHeight = height - margin.top - margin.bottom;
    let currentXOffset = 0;

    periods.forEach((period, i) => {
      const periodData = data.filter((d) => d.period === period);

      const xScale = d3
        .scaleTime()
        .domain([d3.min(periodData, (d) => d.start), d3.max(periodData, (d) => d.end)])
        .range([0, width - margin.left - margin.right]);

      const yScale = d3
        .scaleBand()
        .domain(periodData.map((d) => d.composer))
        .range([0, chartHeight])
        .padding(0.3);

        // Save position for navigation
      eraPositions.current[period] = currentXOffset;

      const periodGroup = svg
        .append("g")
        .attr("transform", `translate(${currentXOffset + margin.left}, ${margin.top})`);

      // X-Axis with Gridlines
      const xAxis = d3
      .axisTop(xScale)
      .ticks(7) // Number of ticks
      .tickPadding(30)
      .tickSize(chartHeight) // Extend gridlines across the chart height
      .tickFormat(d3.timeFormat("%Y")); // Format x-axis ticks


    periodGroup
      .append("g")
      .attr("class", "x-axis-grid") // Add a class for styling
      .attr("transform", `translate(0, ${chartHeight})`) // Position the x-axis
      .call(xAxis)
      .selectAll("line") // Select the gridlines
      .style("stroke", "#CEC6C5") // Gridline color
      .style("stroke-width", "2px"); // Gridline thickness


      periodGroup
      .selectAll(".bar-group")
      .data(periodData)
      .enter()
      .append("g") // Group for the bar and text
      .attr("class", "bar-group")
      .each(function (d, index) {
        const group = d3.select(this);
    
        // Draw the bar with rounded corners
        group
          .append("rect")
          .attr("class", "bar")
          .attr("x", (d) => xScale(d.start))
          .attr(
            "y",
            (d) => yScale(d.composer) + (yScale.bandwidth() - yScale.bandwidth() * 0.8) / 2
          )
          .attr("width", (d) => xScale(d.end) - xScale(d.start))
          .attr("height", yScale.bandwidth() * 0.8)
          .attr("rx", 10) // Rounded corners
          .attr("ry", 10)
          .attr("fill", colors[index % colors.length]); 

        // Add composer name inside the bar
        group
          .append("text")
          .attr("class", "composer-name")
          .attr("x", (d) => xScale(d.start) + 20) // Add some padding inside the bar
          .attr("y", (d) => yScale(d.composer) + yScale.bandwidth() / 2)
          .attr("dy", ".35em") // Center the text vertically
          .text(d.composer)
          .style("font-size", "30px")
          .style("font-style", "italic")
          .style("font-weight", "bold")
          .style("fill", "black") // Text color
          .style("font-family", "basic-sans");

          // Add fun fact and timeline above the bar
          group
          .append("text")
          .attr("class", "fun-fact")
          .attr("x", (d) => xScale(d.start))
          .attr("y", (d) => yScale(d.composer) - 5)
          .text(`${d.period_timeline} - ${d.funFact}`)
          .style("font-size", "20px")
          .style("fill", "black")
          .style("font-family", "basic-sans");

        // Add the composer's image to the left
        group
        .append("foreignObject")
        .attr("x", (d) => xScale(d.start) - 100)
        .attr("y", (d) => yScale(d.composer) - 10)
        .attr("width", 80)
        .attr("height", yScale.bandwidth())
        .append("xhtml:img")
        .attr("src", (d) => d.photo)
        .style("width", "100%")
        .style("height", "100%")
        .style("object-fit", "cover"); // Adjust how the image fits
            

      });


      // Add period label
      periodGroup
        .append("text")
        .attr("x", 0)
        .attr("y", height / 2 + 150)
        .text(period)
        .style("font-size", "48px")
        .style("font-family", "molto")
        .style("font-weight", "bold");

        
        currentXOffset += width;
    });

    const totalWidth = periods.length * width; // Calculate total width of the timeline

    // Update SVG width and height
    svg.attr("width", totalWidth).attr("height", height);
    
    // ✅ Ensure the scroll container has enough width to scroll
    if (containerRef.current) {
      containerRef.current.style.width = `${totalWidth}px`; 
    }
    
  }, [data]);


  return (
    <>
      {/* Navigation Menu */}
      <div style={{ position: "fixed", top: 10, left: 10, zIndex: 10 }}>
        {["Baroque", "Classical", "Romantic", "Modern"].map((era) => (
          <button
            key={era}
            onClick={() => handleNavigation(era)}
            style={{
              margin: "5px",
              padding: "10px",
              cursor: "pointer",
              border: "1px solid #ccc",
              borderRadius: "5px",
              background: "#f0f0f0",
              fontWeight: "bold",
            }}
          >
            {era}
          </button>
        ))}
      </div>

    <div ref={containerRef} style={{
      height: "100vh",
      display: "flex",
      overflowX: "auto", // Allow horizontal scrolling
      scrollBehavior: "smooth",
      whiteSpace: "nowrap", // Prevent wrapping of content
      scrollSnapType: "x mandatory", // Snap to sections (optional)
    }}>
      <svg></svg>
    </div>
    </>
  );
};

export default TimelineChart;

