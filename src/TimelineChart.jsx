import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./index.css";
import Era from "./Era";

const TimelineChart = ({ csvFile, eraFile }) => {
  const popupRef = useRef(null);
  
  const [data, setData] = useState([]);

  const [currentEra, setCurrentEra] = useState("Baroque"); // Default to the first era
  const [eraInfo, setEraInfo] = useState({});

  const [hoveredComposer, setHoveredComposer] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const [selectedComposer, setSelectedComposer] = useState(null);

  const containerRef = useRef();
  const eraPositions = useRef({}); // Store positions for each era
  const colors = ["#BB5223", "#018079", "#1963BE", "#D2AB6A"];

  // Load CSV file
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
          musicStyle: d.Music_style,
          backgroundHistory: d.Background_history,
          iframe: d.Iframe,
        };
      });
      setData(parsedData);
    });

    d3.csv(eraFile).then((eraData) => {  // Convert Excel to CSV if needed
      const eraMap = {};
      eraData.forEach((d) => {
        eraMap[d.era] = {
          summary: d.era_summary,
          period: d.key_period,
          regions: d.key_regions,
          keywords: d.key_words
        };
      });
      setEraInfo(eraMap);
    });
  }, [csvFile, eraFile]);

  const handleScroll = () => {
    const scrollContainer = document.getElementById("scrollContainer");
    const scrollLeft = scrollContainer.scrollLeft;
  
    let activeEra = "Baroque"; // Default to first era
    for (const [era, position] of Object.entries(eraPositions.current)) {
      if (scrollLeft >= position) {
        activeEra = era;
      }
    }
  
    setCurrentEra(activeEra);
  };
  
  // Attach event listener
  useEffect(() => {
    const scrollContainer = document.getElementById("scrollContainer");
    scrollContainer.addEventListener("scroll", handleScroll);
  
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

// Click feature
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Prevent closing if clicking inside the selected popup or on a bar
      if (
        event.target.closest(".popup1") ||  // If clicking inside selected popup
        event.target.closest(".bar")        // If clicking on a bar
      ) {
        return; // Do nothing
      }
      setSelectedComposer(null); // Close only when clicking outside
    };
  
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  

  // Hover feature
  const updateHoverPosition = (event) => {
    requestAnimationFrame(() => {
      if (popupRef.current) {
        const popupWidth = popupRef.current.offsetWidth || 50;
        const popupHeight = popupRef.current.offsetHeight || 30;
  
        setHoverPosition({
          x: event.clientX - popupWidth / 2, // ✅ Correctly center horizontally
          y: event.clientY - popupHeight / 2, // ✅ Place above cursor, with padding
        });
      }
    });
  };
  
  

  // D3.js customization
  useEffect(() => {
    if (data.length === 0) return;

    const periods = Array.from(new Set(data.map((d) => d.period))); // Unique periods
    const width = window.innerWidth; // Each section has 100vw
    const height = window.innerHeight;
    const margin = { top: 160, right: 0, bottom: 270, left: 0 };

    const svg = d3.select(containerRef.current.querySelector("#svgContainer svg"));
    svg.selectAll("*").remove(); // Clear previous SVG

    const chartHeight = height - margin.top - margin.bottom;
    let currentXOffset = 0;

    periods.forEach((period, i) => {
      const periodData = data.filter((d) => d.period === period);

      const xPadding = 150; // Adds padding inside each chart

      const xScale = d3
        .scaleTime()
        .domain([d3.min(periodData, (d) => d.start), d3.max(periodData, (d) => d.end)])
        .range([xPadding, width - margin.left - margin.right - xPadding]); // Apply padding


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
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("fill", colors[index % colors.length])
            .on("click", (event, d) => {
              if (selectedComposer && selectedComposer.composer === d.composer) {
                setSelectedComposer(null); // Toggle off if already selected
              } else {
                setSelectedComposer(d);
                setHoveredComposer(null);
              }
            }).on("mouseenter", (event, d) => {
              setHoveredComposer(d);
              updateHoverPosition(event);
            })
            .on("mousemove", (event) => {
              updateHoverPosition(event);
            })
            .on("mouseleave", () => {
              setHoveredComposer(null); // ✅ Hide popup when leaving the bar
            });
            
                       

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
          .style("font-size", "20px")
          .style("fill", "black")
          .style("font-family", "basic-sans")
          .each(function (d) {
            const text = d3.select(this);
            
            // Append period_timeline with its own class
            text.append("tspan")
              .attr("class", "period-timeline")
              .text(d.period_timeline)
              .style("font-weight", "bold")
            
            // Append a separator (space or dash)
            text.append("tspan")
              .text(" - ");
            
            // Append funFact with its own class
            text.append("tspan")
              .attr("class", "fun-fact-content")
              .text(d.funFact)
              .style("font-style", "italic")
          });
          

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

          currentXOffset += width;
    });

    const totalWidth = periods.length * width; // Calculate total width of the timeline

    // Update SVG width and height
    svg.attr("width", totalWidth).attr("height", height);

    const svgContainer = document.getElementById("svgContainer");
    if (svgContainer) {
      svgContainer.style.width = `${totalWidth}px`; // ✅ totalWidth를 적용
    }
    
  }, [data]);

    // Navigation Feature
    const handleNavigation = (era) => {
      console.log("Navigating to:", era);
      console.log("X Position:", eraPositions.current[era]);
      console.log(document.getElementById("scrollContainer"));
  
      const scrollContainer = document.getElementById("scrollContainer");
      const scrollLocation = eraPositions.current[era]
  
      console.log(scrollContainer);
      console.log(scrollLocation);
  
      scrollContainer.scrollTo({
        left: scrollLocation,
        behavior: "smooth" 
      });
      
        
    };


  return (
    <div 
    id = "scrollContainer"
    ref={containerRef}>
      {/* Era Infos */}
      <Era currentEra={currentEra} eraInfo={eraInfo} />

      {/* Navigation Menu */}
      <div className="navigation">
        {["Baroque", "Classical", "Romantic", "Modern"].map((era) => (
          <button
            key={era}
            onClick={() => handleNavigation(era)}
            className="navigationBtn"
          >
            {era}
          </button>
        ))}
      </div>

      <div 
      id = "svgContainer"
      style={{
        height: "100vh",
        display: "flex",
        overflowX: "auto", // Allow horizontal scrolling
        scrollBehavior: "smooth",
        whiteSpace: "nowrap", // Prevent wrapping of content
        scrollSnapType: "x mandatory", // Snap to sections (optional)
      }}>
        <svg ></svg>
      </div>


      {hoveredComposer && (
        <div
          className="popup"
          ref={popupRef} // Store reference for accurate size
          style={{
            left: `${hoverPosition.x}px`,
            top: `${hoverPosition.y}px`,
          }}
        >
          Click for more info! <i className="fa-regular fa-hand-pointer"></i>
        </div>
      )}



      {selectedComposer && (
        <div className="popup1" onClick={() => setSelectedComposer(null)}>
          <div className="clickBox">
            <img
                src={selectedComposer.photo}
                alt={selectedComposer.composer}
            />
            <div className="clickBox_Info">
              <div className="composerInfo">
                <div>{selectedComposer.composer}</div>
                <div>{selectedComposer.period_timeline}</div>
              </div>
              <div><strong>Music Style:</strong> {selectedComposer.musicStyle}</div>
              <div><strong>Background History:</strong> {selectedComposer.backgroundHistory}</div>
              <div className="recommendation" dangerouslySetInnerHTML={{ __html: selectedComposer.iframe }} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TimelineChart;

