import * as d3 from 'd3'

const BLOCK_SIZE = { width: 200, height: 50 }

export function createNode (rootNode, data) {
  const nodes = rootNode
    .selectAll('node')
    .data(data.descendants())
    .enter()
    .append('g')
    .attr('class', 'node')

  nodes
    .append('rect')
    .attr('class', 'block text-gray-600')
    .attr('fill', 'currentColor')
    .attr('transform', function (d) {
      return (
        'translate(' +
        (d.x - BLOCK_SIZE.width / 2) +
        ',' +
        (d.y - BLOCK_SIZE.height / 2) +
        ')'
      )
    })
    .attr('width', BLOCK_SIZE.width)
    .attr('height', BLOCK_SIZE.height)
    .attr('rx', 6)

  nodes
    .append('text')
    .attr('class', 'labels text-xs uppercase font-semibold')
    .attr('transform', function (d) {
      return 'translate(' + d.y + ',' + (d.x + 3) + ')'
    })
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .text(function (d) {
      return d.data.name
    })
    .on('click', (d) => {
      console.log('f', d.data)
    })
}

export function createLink (rootNode, data) {
  rootNode
    .selectAll('.link')
    .data(data.descendants().slice(1))
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('stroke-dasharray', '2')
    .attr('stroke', 'gray')
    .attr('fill', 'none')
    .attr('d', function diagonal (d) {
      if (d.parent === data.descendants[0]) {
        return 'M' + d.y + ',' + d.x + ' ' + d.parent.y + ',' + d.parent.x
      } else {
        return (
          'M' +
          d.y +
          ',' +
          d.x +
          'C' +
          d.parent.y +
          ',' +
          d.x +
          ' ' +
          d.y +
          ',' +
          d.parent.x +
          ' ' +
          d.parent.y +
          ',' +
          d.parent.y
        )
      }
    })
}

export function zoomScale (svgEl, rootNode, size) {
  svgEl.call(
    d3
      .zoom()
      .extent([
        [0, 0],
        [size.width, size.height]
      ])
      .scaleExtent([0.5, 2])
      .on('zoom', zoomed)
      .on('zoom.wheel', zoomed)
  )

  function zoomed (e) {
    e.sourceEvent.preventDefault()
    rootNode.attr('transform', e.transform)
  }
}
