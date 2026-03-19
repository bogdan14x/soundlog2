import { mount, VueWrapper } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import HeroSection from '../../../app/components/artist/HeroSection.vue'

describe('HeroSection', () => {
  it('renders artist name, bio, and hero image', () => {
    const name = 'Artist Name'
    const bio = 'Artist biography text.'
    const heroImage = '/images/hero.jpg'

    const wrapper: VueWrapper = mount(HeroSection, {
      props: {
        name,
        bio,
        heroImage,
      },
    })

    expect(wrapper.text()).toContain(name)
    expect(wrapper.text()).toContain(bio)
    expect(wrapper.text()).toContain('Your music. One link. Always up to date.')
    expect(wrapper.find('img').attributes('src')).toBe(heroImage)
  })
})
