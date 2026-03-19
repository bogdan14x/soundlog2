import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SocialLinksForm from '../../../app/components/dashboard/SocialLinksForm.vue'

describe('SocialLinksForm', () => {
  it('renders social link inputs', () => {
    const wrapper = mount(SocialLinksForm, {
      props: {
        links: {
          instagram: 'https://instagram.com/test',
          twitter: 'https://twitter.com/test'
        }
      }
    })
    expect(wrapper.find('input[name="instagram"]').exists()).toBe(true)
    expect(wrapper.find('input[name="twitter"]').exists()).toBe(true)
  })
})
