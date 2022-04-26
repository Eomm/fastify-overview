import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import useGraphData from '../hooks/useGraphData';
import { useWindowSize } from '../hooks/useWindowSize';
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
import { selectOverview } from '../store/overviewSlice';
import { ChartNode, DataNode, DECORATOR, HOOK, ROUTE } from '../types';
import { zoomScale } from '../utils/d3';
import { compact } from '../utils/strings';
import { colors, getColor } from '../utils/theme';
import PlotterFilterButton from './PlotterFilterButton';

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
      <div className={'flex flex-col inner-shadow bg-gray-800 ' + className}>
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
        <svg ref={svgRef} className={'flex-grow bg-gray-50 '}>
          <defs>
            <filter id="whiteOutlineEffect" colorInterpolationFilters="sRGB">
              <feMorphology
                in="SourceAlpha"
                result="MORPH"
                operator="dilate"
                radius="2"
              />
              <feColorMatrix
                in="MORPH"
                result="WHITENED"
                type="matrix"
                values="-1 0 0 0 1, 0 -1 0 0 1, 0 0 -1 0 1, 0 0 0 1 0"
              />
              <feMerge>
                <feMergeNode in="WHITENED" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient
              id="bg"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(919.5 925) rotate(-90.031) scale(925 919.5)">
              <stop stopColor="#E3E3E3" />
              <stop offset="1" stopColor="white" />
            </radialGradient>
          </defs>

          <g className="main">
            <g className="canvas">
              <rect fill="bg"></rect>
            </g>
          </g>
        </svg>
      </div>
    </>
  );
}
