import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdditionalSettings from '../../../app/components/dashboard/AdditionalSettings.vue'

describe('AdditionalSettings', () => {
  it('renders newsletter and upgrade prompt settings', () => {
    const wrapper = mount(AdditionalSettings, {
      props: {
        newsletterUrl: 'https://newsletter.example.com',
        upgradePrompt: true
      }
    })
    expect(wrapper.find('input[name="newsletterUrl"]').exists()).toBe(true)
    expect(wrapper.find('input[name="upgradePrompt"]').exists()).toBe(true)
  })
})
