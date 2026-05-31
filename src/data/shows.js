import { masterShowTitles } from './masterShows'

export const shows = masterShowTitles.map((title, index) => ({
  id: `show-${index + 1}`,
  label: title,
  links: []
}))

export const showById = new Map(shows.map((show) => [show.id, show]))

export function getUnlinkedShows(showList = shows) {
  return showList.filter((show) => show.links.length === 0)
}

export function warnForUnlinkedShows(showList = shows) {
  const unlinked = getUnlinkedShows(showList)
  unlinked.forEach((show) => {
    console.warn(`Unlinked show: ${show.label}`)
  })

  return unlinked
}
