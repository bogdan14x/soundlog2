import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IndexPage from '@/app/pages/index.vue'

describe('IndexPage', () => {
  it('renders public homepage copy', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('Public homepage')
    expect(wrapper.text()).toContain('Browse the app homepage without authentication.')
  })

  it('includes sign-in and dashboard actions', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('Sign in to manage your page')
    expect(wrapper.text()).toContain('Go to dashboard')
  })
})
