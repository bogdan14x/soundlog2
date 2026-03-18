import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SocialsPage from '../../../app/pages/dashboard/socials.vue'

describe('SocialsPage', () => {
  it('renders social links form', () => {
    const wrapper = mount(SocialsPage)
    expect(wrapper.text()).toContain('Manage Social Links')
  })
})
