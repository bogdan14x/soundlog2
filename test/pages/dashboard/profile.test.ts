import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfilePage from '../../../app/pages/dashboard/profile.vue'

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({
      success: true,
      data: {
        name: 'Test Artist',
        bio: 'Test bio',
        heroImage: 'https://example.com/image.jpg'
      }
    }))
  })

  it('renders profile form', async () => {
    const wrapper = mount(ProfilePage)
    // Wait for onMounted to complete
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Edit Profile')
  })
})
