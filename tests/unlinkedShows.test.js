import { describe, expect, jest, test } from '@jest/globals'
import { shows, warnForUnlinkedShows } from '../src/data/shows'

describe('master show linkage coverage', () => {
  test('warns for unlinked shows and currently fails until links are added', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    const unlinked = warnForUnlinkedShows(shows)

    expect(warnSpy).toHaveBeenCalledTimes(unlinked.length)
    expect(unlinked).toHaveLength(0)

    warnSpy.mockRestore()
  })
})
