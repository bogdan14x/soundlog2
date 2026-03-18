import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusPage from '../../../app/pages/dashboard/status.vue'

describe('StatusPage', () => {
  beforeEach(() => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({
      success: true,
      data: [
        { platform: 'spotify', status: 'resolved' },
        { platform: 'appleMusic', status: 'resolved' },
        { platform: 'youtube', status: 'resolved' },
        { platform: 'tidal', status: 'pending' },
        { platform: 'deezer', status: 'failed' }
      ]
    }))
  })

  it('renders link resolution status', async () => {
    const wrapper = mount(StatusPage)
    // Wait for onMounted to complete
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Link Resolution Status')
  })
})
