import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardIndex from '../../../app/pages/dashboard/index.vue'

describe('DashboardIndex', () => {
  it('renders dashboard heading', () => {
    const wrapper = mount(DashboardIndex)
    expect(wrapper.text()).toContain('Dashboard')
  })
})
