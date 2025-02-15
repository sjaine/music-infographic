import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const Maps = ({ eraFilter }) => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    d3.csv(`data/dynamic_data_modes_P1.csv`).then((csvData) => {
      const filteredData = csvData.filter(row => row.Period === eraFilter);
      const countryCounts = {};
      filteredData.forEach((row) => {
        const countries = row.Country.split('; ');
        countries.forEach((country) => {
          countryCounts[country] = (countryCounts[country] || 0) + 1;
        });
      });

      const formattedData = Object.entries(countryCounts).map(([country, count]) => ({
        Country: country,
        ComposerCount: count,
      }));

      setData(formattedData);
    });
  }, [eraFilter]);

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 500;

    const projection = d3.geoMercator()
      .scale(120)
      .translate([width / 2, height / 1.5]);

    const pathGenerator = d3.geoPath().projection(projection);

    svg.selectAll('*').remove(); // Clear previous render

    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then((geoData) => {
        const countryDataMap = new Map(data.map(d => [d.Country, d.ComposerCount]));

        svg.selectAll('path')
          .data(geoData.features)
          .enter()
          .append('path')
          .attr('d', pathGenerator)
          .attr('fill', (d) => {
            const count = countryDataMap.get(d.properties.name) || 0;
            return count > 0 ? d3.interpolateBlues(count / 10) : '#e0e0e0';
          })
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 0.5);

        svg.selectAll('path')
          .on('mouseover', (event, d) => {
            const count = countryDataMap.get(d.properties.name) || 0;
            d3.select(event.target).attr('fill', 'orange');
            console.log(`${d.properties.name}: ${count} composers`);
          })
          .on('mouseout', (event, d) => {
            const count = countryDataMap.get(d.properties.name) || 0;
            d3.select(event.target).attr('fill', count > 0 ? d3.interpolateBlues(count / 10) : '#e0e0e0');
          });

        // Add labels only for highlighted countries
        svg.selectAll('text')
          .data(geoData.features.filter(d => countryDataMap.has(d.properties.name)))
          .enter()
          .append('text')
          .attr('x', d => {
            const centroid = pathGenerator.centroid(d);
            return centroid[0];
          })
          .attr('y', d => {
            const centroid = pathGenerator.centroid(d);
            return centroid[1];
          })
          .text(d => d.properties.name)
          .attr('font-size', '8px')
          .attr('fill', 'black')
          .attr('text-anchor', 'middle');
      });
  }, [data]);

  return (
    <div className="regionBox">
        <svg ref={svgRef} width={800} height={500}></svg>
    </div>
  )
};

export default Maps;
