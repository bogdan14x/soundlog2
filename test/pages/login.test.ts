import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginPage from '../../app/pages/login.vue'
import AuthLayout from '../../app/components/AuthLayout.vue'

describe('LoginPage', () => {
  it('renders login form', () => {
    const wrapper = mount(LoginPage, {
      global: {
        components: {
          AuthLayout
        },
        stubs: {
          Auth: {
            template: '<div class="auth-mock">Auth Component</div>'
          }
        }
      }
    })
    expect(wrapper.text()).toContain('Sign in to SoundLog')
  })

  it('has Spotify OAuth button', () => {
    const wrapper = mount(LoginPage, {
      global: {
        components: {
          AuthLayout
        },
        stubs: {
          Auth: {
            template: '<div class="auth-mock">Auth Component</div>'
          }
        }
      }
    })
    expect(wrapper.text()).toContain('Continue with Spotify')
  })
})
