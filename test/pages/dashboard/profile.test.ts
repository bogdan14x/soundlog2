import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfilePage from '../../../app/pages/dashboard/profile.vue'

describe('ProfilePage', () => {
  it('renders profile form', () => {
    const wrapper = mount(ProfilePage)
    expect(wrapper.text()).toContain('Edit Profile')
  })
})
