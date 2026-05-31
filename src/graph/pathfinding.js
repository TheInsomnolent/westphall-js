export function buildAdjacencyList(shows) {
  const adjacency = new Map(shows.map((show) => [show.id, new Set(show.links)]))

  shows.forEach((show) => {
    show.links.forEach((linkedShowId) => {
      if (!adjacency.has(linkedShowId)) {
        adjacency.set(linkedShowId, new Set())
      }
      adjacency.get(linkedShowId).add(show.id)
    })
  })

  return adjacency
}

export function findPathAStar(shows, startId, goalId) {
  if (!startId || !goalId) {
    return []
  }

  if (startId === goalId) {
    return [startId]
  }

  const adjacency = buildAdjacencyList(shows)
  const openSet = new Set([startId])
  const cameFrom = new Map()
  const gScore = new Map([[startId, 0]])

  while (openSet.size > 0) {
    const current = [...openSet].reduce((bestNode, node) => {
      const nodeScore = gScore.get(node) ?? Infinity
      const bestScore = gScore.get(bestNode) ?? Infinity
      return nodeScore < bestScore ? node : bestNode
    })

    if (current === goalId) {
      const path = [goalId]
      let cursor = goalId

      while (cameFrom.has(cursor)) {
        cursor = cameFrom.get(cursor)
        path.push(cursor)
      }

      return path.reverse()
    }

    openSet.delete(current)

    const neighbors = adjacency.get(current) ?? new Set()
    neighbors.forEach((neighbor) => {
      const tentativeGScore = (gScore.get(current) ?? Infinity) + 1
      if (tentativeGScore < (gScore.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, current)
        gScore.set(neighbor, tentativeGScore)
        openSet.add(neighbor)
      }
    })
  }

  return []
}
