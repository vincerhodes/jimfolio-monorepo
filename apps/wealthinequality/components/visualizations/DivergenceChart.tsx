'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';

interface DataPoint {
  year: number;
  productivity: number;
  wages: number;
}

interface DivergenceChartProps {
  data: DataPoint[];
}

export default function DivergenceChart({ data }: DivergenceChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !isVisible || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 120, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.year) as [number, number])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => Math.max(d.productivity, d.wages))! * 1.1])
      .range([height, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => '')
      );

    // Axes
    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .style('color', '#9CA3AF');

    const yAxis = g
      .append('g')
      .call(d3.axisLeft(yScale))
      .style('color', '#9CA3AF');

    // Axis labels
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 45)
      .attr('text-anchor', 'middle')
      .style('fill', '#9CA3AF')
      .style('font-size', '14px')
      .text('Year');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .style('fill', '#9CA3AF')
      .style('font-size', '14px')
      .text('Index (1945 = 100)');

    // Line generators
    const productivityLine = d3
      .line<DataPoint>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.productivity))
      .curve(d3.curveMonotoneX);

    const wagesLine = d3
      .line<DataPoint>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.wages))
      .curve(d3.curveMonotoneX);

    // Draw lines with animation
    const productivityPath = g
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#059669')
      .attr('stroke-width', 3)
      .attr('d', productivityLine);

    const wagesPath = g
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#DC2626')
      .attr('stroke-width', 3)
      .attr('d', wagesLine);

    // Animate lines
    const productivityLength = productivityPath.node()!.getTotalLength();
    const wagesLength = wagesPath.node()!.getTotalLength();

    productivityPath
      .attr('stroke-dasharray', productivityLength)
      .attr('stroke-dashoffset', productivityLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    wagesPath
      .attr('stroke-dasharray', wagesLength)
      .attr('stroke-dashoffset', wagesLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    // 1971 annotation line
    g.append('line')
      .attr('x1', xScale(1971))
      .attr('x2', xScale(1971))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#F59E0B')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0)
      .transition()
      .delay(1500)
      .duration(500)
      .attr('opacity', 0.6);

    // 1971 annotation text
    g.append('text')
      .attr('x', xScale(1971))
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('fill', '#F59E0B')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .attr('opacity', 0)
      .text('1971: The Divergence Begins')
      .transition()
      .delay(1500)
      .duration(500)
      .attr('opacity', 1);

    // Legend
    const legend = g.append('g').attr('transform', `translate(${width + 10}, 20)`);

    legend
      .append('line')
      .attr('x1', 0)
      .attr('x2', 30)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', '#059669')
      .attr('stroke-width', 3);

    legend
      .append('text')
      .attr('x', 35)
      .attr('y', 5)
      .style('fill', '#059669')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Productivity');

    legend
      .append('line')
      .attr('x1', 0)
      .attr('x2', 30)
      .attr('y1', 30)
      .attr('y2', 30)
      .attr('stroke', '#DC2626')
      .attr('stroke-width', 3);

    legend
      .append('text')
      .attr('x', 35)
      .attr('y', 35)
      .style('fill', '#DC2626')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Wages');

  }, [data, isVisible]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      onViewportEnter={() => setIsVisible(true)}
      className="w-full flex justify-center my-12"
    >
      <svg
        ref={svgRef}
        width="800"
        height="400"
        className="max-w-full h-auto"
        style={{ overflow: 'visible' }}
      />
    </motion.div>
  );
}
