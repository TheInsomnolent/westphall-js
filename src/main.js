import * as d3 from 'd3'
import './style.css'
import { shows } from './data/shows'
import { findPathAStar } from './graph/pathfinding'

const links = shows.flatMap((show) =>
  show.links
    .filter((target) => show.id < target)
    .map((target) => ({ source: show.id, target }))
)

const nodes = shows.map((show) => ({ ...show }))

document.querySelector('#app').innerHTML = `
  <main>
    <h1>Tommy Westphall Universe Mapper</h1>
    <p class="subtitle">Force-directed graph with A* shortest path selection.</p>

    <section class="controls">
      <label>From <select id="start-node"></select></label>
      <label>To <select id="end-node"></select></label>
      <button id="path-button" type="button">Find Minimal Linked Path</button>
    </section>

    <p id="path-output">No path selected.</p>
    <svg id="graph" viewBox="0 0 1000 700" aria-label="Westphall network graph"></svg>
  </main>
`

const startSelect = document.querySelector('#start-node')
const endSelect = document.querySelector('#end-node')
const pathOutput = document.querySelector('#path-output')
const graph = document.querySelector('#graph')

const selectMarkup = nodes
  .map((node) => `<option value="${node.id}">${node.label}</option>`)
  .join('')

startSelect.innerHTML = selectMarkup
endSelect.innerHTML = selectMarkup
endSelect.selectedIndex = Math.min(1, nodes.length - 1)

const svg = d3.select(graph)
const width = 1000
const height = 700

const simulation = d3
  .forceSimulation(nodes)
  .force('link', d3.forceLink(links).id((d) => d.id).distance(100))
  .force('charge', d3.forceManyBody().strength(-85))
  .force('center', d3.forceCenter(width / 2, height / 2))

const link = svg
  .append('g')
  .attr('stroke', '#64748b')
  .attr('stroke-opacity', 0.6)
  .selectAll('line')
  .data(links)
  .join('line')

const node = svg
  .append('g')
  .selectAll('circle')
  .data(nodes)
  .join('circle')
  .attr('r', 7)
  .attr('fill', '#1d4ed8')
  .call(
    d3
      .drag()
      .on('start', (event) => {
        if (!event.active) {
          simulation.alphaTarget(0.3).restart()
        }
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      })
      .on('drag', (event) => {
        event.subject.fx = event.x
        event.subject.fy = event.y
      })
      .on('end', (event) => {
        if (!event.active) {
          simulation.alphaTarget(0)
        }
        event.subject.fx = null
        event.subject.fy = null
      })
  )

const labels = svg
  .append('g')
  .selectAll('text')
  .data(nodes)
  .join('text')
  .attr('font-size', 9)
  .attr('dx', 9)
  .attr('dy', 3)
  .text((d) => d.label)

simulation.on('tick', () => {
  link
    .attr('x1', (d) => d.source.x)
    .attr('y1', (d) => d.source.y)
    .attr('x2', (d) => d.target.x)
    .attr('y2', (d) => d.target.y)

  node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
  labels.attr('x', (d) => d.x).attr('y', (d) => d.y)
})

function renderPath(path) {
  const highlighted = new Set(path)

  node.attr('fill', (d) => (highlighted.has(d.id) ? '#dc2626' : '#1d4ed8'))

  link.attr('stroke', (d) => {
    const sourceId = typeof d.source === 'object' ? d.source.id : d.source
    const targetId = typeof d.target === 'object' ? d.target.id : d.target
    const isOnPath =
      highlighted.has(sourceId) &&
      highlighted.has(targetId) &&
      Math.abs(path.indexOf(sourceId) - path.indexOf(targetId)) === 1

    return isOnPath ? '#dc2626' : '#64748b'
  })
}

document.querySelector('#path-button').addEventListener('click', () => {
  const path = findPathAStar(shows, startSelect.value, endSelect.value)

  if (path.length === 0) {
    pathOutput.textContent = 'No linked path found with current dataset.'
    renderPath([])
    return
  }

  pathOutput.textContent = path
    .map((id) => nodes.find((node) => node.id === id)?.label ?? id)
    .join(' → ')
  renderPath(path)
})
