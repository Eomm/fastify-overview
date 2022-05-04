import * as d3 from 'd3'
import { useEffect, useRef } from 'react'

import { useWindowSize } from '../hooks/useWindowSize'
import {
  attachZoom,
  drawLabels,
  drawLines,
  drawNodes,
  getTree,
  parseData,
  shutdown,
  updateSizes
} from '../plotter/radialTree'

const LINK_SIZE = 500
const TEXT_SIZE = 24

export default function RadialTree ({
  className,
  chartData,
  currentNode,
  setCurrentNode
}) {
  const svgRef = useRef(null)
  const size = useWindowSize()

  useEffect(() => {
    if (!svgRef.current || !size.height) {
      return
    }
    console.log('render', [svgRef.current, chartData, size])
    const svgEl = d3.select(svgRef.current)
    const main = svgEl.select('g.main')
    const canvas = svgEl.select('g.canvas')

    const hierarchy = parseData(chartData)
    const { radius } = updateSizes(svgEl, main, canvas, LINK_SIZE, hierarchy)

    const tree = getTree(hierarchy, radius)
    drawLines(tree, canvas)
    drawNodes(tree, canvas)
    drawLabels(tree, canvas, TEXT_SIZE, setCurrentNode)
    attachZoom(svgEl, main)

    return () => {
      shutdown(svgRef)
    }
  }, [svgRef.current, chartData, size])

  return (
    <>
      <div className={'flex flex-col inner-shadow bg-gray-800 ' + className}>
        <div className='absolute bottom-0 bg-current p-1'>
          {currentNode?.name} {JSON.stringify(currentNode.type)}
        </div>
        <svg ref={svgRef} className='flex-grow bg-gray-50 '>
          <defs>
            <filter id='whiteOutlineEffect' colorInterpolationFilters='sRGB'>
              <feMorphology
                in='SourceAlpha'
                result='MORPH'
                operator='dilate'
                radius='2'
              />
              <feColorMatrix
                in='MORPH'
                result='WHITENED'
                type='matrix'
                values='-1 0 0 0 1, 0 -1 0 0 1, 0 0 -1 0 1, 0 0 0 1 0'
              />
              <feMerge>
                <feMergeNode in='WHITENED' />
                <feMergeNode in='SourceGraphic' />
              </feMerge>
            </filter>
            <radialGradient
              id='bg'
              cx='0'
              cy='0'
              r='1'
              gradientUnits='userSpaceOnUse'
              gradientTransform='translate(919.5 925) rotate(-90.031) scale(925 919.5)'
            >
              <stop stopColor='#E3E3E3' />
              <stop offset='1' stopColor='white' />
            </radialGradient>
          </defs>

          <g className='main'>
            <g className='canvas'>
              <rect fill='bg' />
            </g>
          </g>
        </svg>
      </div>
    </>
  )
}
