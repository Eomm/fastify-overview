import * as d3 from 'd3'

import { compact } from '../../utils/strings'
import { getColor } from '../../utils/theme'

export function shutdown (svgRef) {
  const svgEl = d3.select(svgRef.current)
  svgEl.select('.canvas').selectChildren().remove()
}

export function updateSizes (
  svgEl,
  main,
  canvas,
  linkWidth,
  data
) {
  if (!data || !svgEl) {
    return
  }

  const { width: containerWidth, height: containerHeight } = (
    svgEl.node()
  ).getBoundingClientRect()

  main.attr('width', containerWidth).attr('height', containerHeight)

  const sideSize = data.height * linkWidth // adds 1 to let enought place for labels
  const radius = sideSize / 2

  console.log(sideSize)

  const shiftHorizontal = (sideSize + (containerWidth - sideSize)) / 2 // add sideSize because the 0 is the center
  const shiftVertical = (sideSize + (containerHeight - sideSize)) / 2

  const scaleFactor =
    Math.min(containerHeight, containerWidth) / (sideSize + 200)

  canvas
    .attr('width', sideSize)
    .attr('height', sideSize)
    .attr(
      'transform',
      `translate(${shiftHorizontal}, ${shiftVertical}) scale(${scaleFactor})`
    )

  return { radius }
}

export function parseData (data) {
  return d3.hierarchy(data, function (d) {
    return d.children
  })
}

export function getTree (data, radius) {
  const tree = d3
    .tree()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)
  return tree(data)
}

export function drawLines (
  tree,
  canvas
) {
  canvas
    .append('g')
    .attr('class', 'links')
    .attr('fill', 'none')
    .attr('stroke', '#DEDEDE')
    .attr('strokeWidth', 1)
    .selectAll('path')
    .data(tree.links())
    .join('path')
    .attr('class', 'link')
    .attr(
      'd',
      d3
        .linkRadial()
        .angle((d) => d.x)
        .radius((d) => d.y)
    )
    .attr('opacity', 0)
    .transition()
    .duration(100)
    .delay(function (d, i) {
      return 100 * d.target.depth + i * 5
    })
    .attr('opacity', 1)
}

export function drawLabels (
  tree,
  canvas,
  textSize,
  setCurrentNode
) {
  canvas
    .append('g')
    .attr('filter', 'url(#whiteOutlineEffect)')
    .attr('font-family', 'monospace')
    .attr('font-size', '1em')
    .attr('font-weight', 'bold')
    // .attr("strokeLinejoin", "round")

    .attr('class', 'label')
    .selectAll('text')
    .data(tree.descendants())
    .join('text')

    .attr('text-anchor', (d) => (d.x < Math.PI ? 'start' : 'end'))
    .attr('fill', (d) => {
      return getColor(d.data)
    })
    .attr('text-rendering', 'optimizeLegibility')
    .style('cursor', 'pointer')
    .style('-webkit-font-smoothing', 'grayscale')

    .text((d) =>
      d.data.name === 'Anonymous function'
        ? 'λ'
        : d.data.children.length
          ? compact(d.data.name, textSize)
          : d.data.name
    )
    .attr(
      'transform',
      (d) => `
      rotate(${(d.x * 180) / Math.PI - 90}) 
      translate(${d.y},0) 
      rotate(${d.x >= Math.PI ? 180 : 0})
    `
    )
    .attr('dy', '0.31em')
    .attr('x', (d) => (d.x < Math.PI ? 6 : -6))
    .attr('opacity', 0)
    .on('mouseleave', function () {
      setCurrentNode('')
      d3.select(this).transition().duration(100).attr('opacity', 1)
    })
    // .on('click', function (e, d) {
    //   console.log(d.data);
    // })
    // .on("mouseover", function (this, e, d) {
    //   setCurrentNode(d.data);
    //   d3.select(this).transition().duration(200).attr("opacity", 0.5);
    // })

    .transition()
    .duration(100)

    .delay(function (d, i) {
      return 100 * d.depth + i * 5
    })
    .ease(d3.easeElasticInOut.amplitude(1).period(0.5))
    .attr('opacity', 1)
  // .clone(true)
  // .lower()
  // .attr("stroke", "white")
  // .attr("stroke-width", 3);
}

export function drawNodes (
  tree,
  canvas
) {
  canvas
    .append('g')
    .selectAll('circle')
    .data(tree.descendants())
    .join('circle')
    .attr('r', 4)
    .attr('opacity', 0)
    .transition()
    .duration(100)
    .delay(function (d, i) {
      return 100 * d.depth + i * 5
    })
    .ease(d3.easeElasticInOut.amplitude(1).period(0.5))
    .attr('opacity', 1)
    .attr(
      'transform',
      (d) => `
      rotate(${(d.x * 180) / Math.PI - 90})
      translate(${d.y},0)
    `
    )
    .attr('fill', (d) => {
      return getColor(d.data)
    })
}

export function attachZoom (
  svgEl,
  main,
  size
) {
  svgEl.call(
    d3.zoom().scaleExtent([0.5, 4]).on('zoom', zoomed).on('zoom.wheel', zoomed)
  )

  console.log(size)

  function zoomed (e) {
    e.sourceEvent.preventDefault()
    main.attr('transform', e.transform)
  }
}
