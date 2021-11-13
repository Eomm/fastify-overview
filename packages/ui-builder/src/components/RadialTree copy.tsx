import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useWindowSize } from '../hooks/useWindowSize';
import { ChartNode, DataNode, DECORATOR, HOOK, ROUTE } from '../types';
import { zoomScale } from '../utils/d3';
import { selectOverview } from '../store/overviewSlice';
import { compact } from '../utils/strings';
import { colors, getColor } from '../utils/theme';
import useGraphData from '../hooks/useGraphData';
import PlotterFilterButton from './PlotterFilterButton';

export default function RadialTree({ className }) {
  const svgRef = useRef(null);
  const [currentNode, setCurrentNode] = useState('ciao');
  const data: DataNode = useSelector(selectOverview);
  const { chartData, filters, setFilters } = useGraphData(data);

  const size = useWindowSize();
  console.log('boom');

  useEffect(() => {
    if (!chartData) {
      return;
    }
    const svgEl = d3.select(svgRef.current);
    let { width: w, height: h } = svgEl.node().getBoundingClientRect();
    w *= 1.4;
    h *= 1.4;

    const width = Math.min(w, h);
    const height = Math.min(w, h);

    const main = svgEl
      .append('g')
      .attr('class', 'main')
      .attr('width', Math.min(width, height))
      .attr('height', Math.min(width, height));

    const content = main
      .append('g')
      .attr('class', 'content')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', `scale(.7) translate(${w / 2}, ${h / 2})`);

    const radius = width / 2;
    const tree = d3
      .tree()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);
    const dataTree = d3.hierarchy(chartData, function (d) {
      return d.children;
    });
    console.log(dataTree);
    const root = tree(dataTree);
    console.log(root);

    content
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('strokeOpacity', 0.4)
      .attr('strokeWidth', 1.5)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr(
        'd',
        d3
          .linkRadial()
          .angle((d) => d.x)
          .radius((d) => d.y),
      );

    content
      .append('g')
      .selectAll('circle')
      .data(root.descendants())
      .join('circle')
      .attr(
        'transform',
        (d) => `
          rotate(${(d.x * 180) / Math.PI - 90})
          translate(${d.y},0)
        `,
      )
      // .attr('fill', (d) => (d.children ? '#555' : '#999'))
      .attr('fill', (d) => {
        return getColor(d.data as ChartNode);
      })

      .attr('r', 2.5);

    content
      .append('g')
      .attr('font-family', 'monospace')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .attr('strokeLinejoin', 'round')
      .attr('strokeWidth', 3)
      .attr('class', 'label')
      .selectAll('text')
      .data(root.descendants())

      .join('text')
      .attr(
        'transform',
        (d) => `
          rotate(${(d.x * 180) / Math.PI - 90}) 
          translate(${d.y},0) 
          rotate(${d.x >= Math.PI ? 180 : 0})
        `,
      )
      .attr('dy', '0.31em')
      .attr('x', (d) => (d.x < Math.PI === !d.children ? 6 : -6))
      .attr('text-anchor', (d) => (d.x < Math.PI === !d.children ? 'start' : 'end'))
      .attr('fill', (d) => {
        return getColor(d.data as ChartNode);
      })
      .style('cursor', 'pointer')
      .text((d) =>
        d.data.name === 'Anonymous function'
          ? 'λ'
          : d.data.children.length
          ? compact(d.data.name, 14)
          : d.data.name,
      )
      .on('mouseleave', function () {
        setCurrentNode('');
      })
      // .on('click', function (e, d) {
      //   console.log(d.data);
      // })
      .on('mouseover', function (e, d) {
        setCurrentNode(d.data);
      })
      .clone(true)
      .lower()
      .attr('stroke', 'white')
      .attr('stroke-width', 3);

    zoomScale(svgEl, main, { width: w, height: h });

    return () => {
      const svgEl = d3.select(svgRef.current);
      svgEl.select('.main').remove();
    };
  }, [chartData, size]);

  return (
    <>
      <div className={'flex flex-col ' + className}>
        <svg ref={svgRef} className={'flex-grow bg-gray-50'} />
        <div
          className={
            'bg-gray-100 shadow-inner z-10 p-1 text-xs text-gray-900 font-mono flex justify-between items-center'
          }
        >
          <div>
            {currentNode?.name} {JSON.stringify(currentNode.type)}
          </div>
          <div className="inline-flex">
            <PlotterFilterButton
              text="Routes"
              active={filters.showRoutes}
              onClick={() => setFilters({ ...filters, showRoutes: !filters.showRoutes })}
              kind="first"
              activeColor={colors[ROUTE]}
              inactiveColor=""
            />
            <PlotterFilterButton
              text="Decorators"
              active={filters.showDecorators}
              onClick={() =>
                setFilters({ ...filters, showDecorators: !filters.showDecorators })
              }
              kind="middle"
              activeColor={colors[DECORATOR]}
              inactiveColor=""
            />
            <PlotterFilterButton
              text="Hooks"
              active={filters.showHooks}
              onClick={() => setFilters({ ...filters, showHooks: !filters.showHooks })}
              kind="last"
              activeColor={colors[HOOK]}
              inactiveColor=""
            />
          </div>
        </div>
      </div>
    </>
  );
}
