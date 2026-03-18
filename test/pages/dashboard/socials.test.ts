import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SocialsPage from '../../../app/pages/dashboard/socials.vue'

describe('SocialsPage', () => {
  beforeEach(() => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({
      success: true,
      data: {
        instagram: 'https://instagram.com/testartist',
        twitter: 'https://twitter.com/testartist',
        facebook: 'https://facebook.com/testartist'
      }
    }))
  })

  it('renders social links form', async () => {
    const wrapper = mount(SocialsPage)
    // Wait for onMounted to complete
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Manage Social Links')
  })
})
