import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { useWindowSize } from '../hooks/useWindowSize';
import { DataNode } from '../types';
import { createLink, createNode, zoomScale } from '../utils/d3';

interface FastifyIconProps {
  className: string;
  data: DataNode;
}

export default function Plotter({ data, className }: FastifyIconProps) {
  const svgRef = useRef(null);
  const size = useWindowSize();

  useEffect(() => {
    const svgEl = d3.select(svgRef.current);
    const main = svgEl
      .append('g')
      .attr('class', 'main')
      .attr('transform', 'translate(' + 50 + ',' + 50 + ')');

    const { width, height } = svgEl.node().getBoundingClientRect();

    const cluster = d3.tree().nodeSize([200, 200]);
    const dataTree = d3.hierarchy(data, function (d) {
      return d.children;
    });
    cluster(dataTree);

    createLink(main, dataTree);
    createNode(main, dataTree);
    zoomScale(svgEl, main, { width, height });

    return () => {
      const svgEl = d3.select(svgRef.current);
      svgEl.select('.main').remove();
    };
  }, [data, size]);

  return (
    <>
      <div className={'flex flex-col' + className}>
        <svg ref={svgRef} className={'flex-grow'} />
        <div>asdasd</div>
      </div>
    </>
  );
}
