import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileForm from '../../../app/components/dashboard/ProfileForm.vue'

describe('ProfileForm', () => {
  it('renders form fields', () => {
    const wrapper = mount(ProfileForm, {
      props: {
        artist: {
          name: 'Test Artist',
          bio: 'Test bio',
          heroImage: 'https://example.com/image.jpg'
        }
      }
    })
    expect(wrapper.find('input[name="name"]').exists()).toBe(true)
    expect(wrapper.find('textarea[name="bio"]').exists()).toBe(true)
    expect(wrapper.find('input[name="heroImage"]').exists()).toBe(true)
  })
})
