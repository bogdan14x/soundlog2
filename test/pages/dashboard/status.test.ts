import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusPage from '../../../app/pages/dashboard/status.vue'

describe('StatusPage', () => {
  it('renders link resolution status', () => {
    const wrapper = mount(StatusPage)
    expect(wrapper.text()).toContain('Link Resolution Status')
  })
})
