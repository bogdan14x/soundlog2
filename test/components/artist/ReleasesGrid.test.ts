import { mount, VueWrapper } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ReleasesGrid from '../../../app/components/artist/ReleasesGrid.vue'

describe('ReleasesGrid', () => {
  it('renders grid of releases', () => {
    const releases = [
      { title: 'Release 1', date: '2026-01-01', coverImage: 'https://example.com/cover1.jpg', platformLinks: { spotify: 'https://...' } },
      { title: 'Release 2', date: '2026-02-01', coverImage: 'https://example.com/cover2.jpg', platformLinks: { spotify: 'https://...' } }
    ]
    const wrapper: VueWrapper = mount(ReleasesGrid, { props: { releases } })
    expect(wrapper.text()).toContain('Release 1')
    expect(wrapper.text()).toContain('Release 2')
  })

  it('renders album covers in a grid', () => {
    const releases = [
      { title: 'Album 1', date: '2026-01-01', coverImage: 'https://example.com/cover1.jpg', platformLinks: {} },
      { title: 'Album 2', date: '2026-02-01', coverImage: 'https://example.com/cover2.jpg', platformLinks: {} }
    ]
    const wrapper: VueWrapper = mount(ReleasesGrid, { props: { releases } })
    const images = wrapper.findAll('img')
    expect(images.length).toBe(2)
    expect(images[0].attributes('src')).toBe('https://example.com/cover1.jpg')
    expect(images[1].attributes('src')).toBe('https://example.com/cover2.jpg')
  })

  it('renders correct number of releases', () => {
    const releases = [
      { title: 'Release 1', date: '2026-01-01', coverImage: 'https://example.com/cover1.jpg', platformLinks: {} },
      { title: 'Release 2', date: '2026-02-01', coverImage: 'https://example.com/cover2.jpg', platformLinks: {} },
      { title: 'Release 3', date: '2026-03-01', coverImage: 'https://example.com/cover3.jpg', platformLinks: {} },
      { title: 'Release 4', date: '2026-04-01', coverImage: 'https://example.com/cover4.jpg', platformLinks: {} }
    ]
    const wrapper: VueWrapper = mount(ReleasesGrid, { props: { releases } })
    const releaseItems = wrapper.findAll('[data-testid="release-item"]')
    expect(releaseItems.length).toBe(4)
  })

  it('handles empty releases array', () => {
    const releases: Array<{ title: string; date: string; coverImage: string; platformLinks: Record<string, string> }> = []
    const wrapper: VueWrapper = mount(ReleasesGrid, { props: { releases } })
    expect(wrapper.find('[data-testid="release-item"]').exists()).toBe(false)
  })
})
