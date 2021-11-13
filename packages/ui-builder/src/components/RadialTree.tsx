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
import {
  attachZoom,
  drawLabels,
  drawLines,
  drawNodes,
  getTree,
  parseData,
  shutdown,
  updateSizes,
} from '../plotter/radialTree';

const LINK_SIZE = 500;
const TEXT_SIZE = 24;

export default function RadialTree({ className }) {
  const svgRef = useRef(null);
  const [currentNode, setCurrentNode] = useState('');
  const data: DataNode = useSelector(selectOverview);
  const { chartData, filters, setFilters } = useGraphData(data);
  const size = useWindowSize();

  useEffect(() => {
    if (!svgRef.current || !size.height) {
      return;
    }
    console.log('render', [svgRef.current, chartData, size]);
    const svgEl = d3.select<HTMLElement, unknown>(svgRef.current);
    const main = svgEl.select<SVGGElement>('g.main');
    const canvas = svgEl.select<SVGGElement>('g.canvas');

    const hierarchy = parseData(chartData);
    const { radius } = updateSizes(svgEl, main, canvas, LINK_SIZE, hierarchy);

    const tree = getTree(hierarchy, radius);
    drawLines(tree, canvas);
    drawNodes(tree, canvas);
    drawLabels(tree, canvas, TEXT_SIZE, setCurrentNode);
    attachZoom(svgEl, main);

    return () => {
      shutdown(svgRef);
    };
  }, [svgRef.current, chartData, size]);

  return (
    <>
      <div className={'flex flex-col ' + className}>
        <div
          className={
            'bg-gray-100 shadow-inner z-10 p-1 text-xs text-gray-900 font-mono flex justify-between items-center'
          }>
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
        <svg ref={svgRef} className={'flex-grow bg-gray-50'}>
          <g className="main">
            <g className="canvas"></g>
          </g>
        </svg>
      </div>
    </>
  );
}
