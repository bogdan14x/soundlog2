import { mount, VueWrapper } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import FeaturedRelease from '@/app/components/artist/FeaturedRelease.vue'

describe('FeaturedRelease', () => {
  it('renders release title and date', () => {
    const wrapper: VueWrapper = mount(FeaturedRelease, {
      props: {
        title: 'Test Album',
        date: '2023-01-01',
        coverImage: '/images/cover.jpg',
        platformLinks: {
          spotify: 'https://open.spotify.com/album/123',
          appleMusic: 'https://music.apple.com/album/123'
        }
      }
    })

    expect(wrapper.text()).toContain('Test Album')
    expect(wrapper.text()).toContain('2023-01-01')
  })

  it('renders cover image', () => {
    const wrapper: VueWrapper = mount(FeaturedRelease, {
      props: {
        title: 'Test Album',
        date: '2023-01-01',
        coverImage: '/images/cover.jpg',
        platformLinks: {}
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/images/cover.jpg')
  })

  it('renders platform link buttons', () => {
    const wrapper: VueWrapper = mount(FeaturedRelease, {
      props: {
        title: 'Test Album',
        date: '2023-01-01',
        coverImage: '/images/cover.jpg',
        platformLinks: {
          spotify: 'https://open.spotify.com/album/123',
          appleMusic: 'https://music.apple.com/album/123'
        }
      }
    })

    const links = wrapper.findAll('a')
    expect(links.length).toBe(2)
    expect(links[0].attributes('href')).toBe('https://open.spotify.com/album/123')
    expect(links[1].attributes('href')).toBe('https://music.apple.com/album/123')
  })

  it('renders Listen Now text on buttons', () => {
    const wrapper: VueWrapper = mount(FeaturedRelease, {
      props: {
        title: 'Test Album',
        date: '2023-01-01',
        coverImage: '/images/cover.jpg',
        platformLinks: {
          spotify: 'https://open.spotify.com/album/123'
        }
      }
    })

    expect(wrapper.text()).toContain('Listen Now')
  })
})
