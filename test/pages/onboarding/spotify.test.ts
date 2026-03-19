import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OnboardingSpotifyPage from '../../../app/pages/onboarding/spotify.vue'
import OnboardingWizard from '../../../app/components/OnboardingWizard.vue'

describe('OnboardingSpotifyPage', () => {
  it('renders Spotify connection header', () => {
    const wrapper = mount(OnboardingSpotifyPage, {
      global: {
        stubs: {
          OnboardingWizard: {
            template: `
              <div>
                <div>Step {{ currentStep }} of 4</div>
                <slot />
                <button>{{ nextButtonText }}</button>
              </div>
            `,
            props: ['currentStep', 'totalSteps', 'nextButtonText', 'canContinue'],
            emits: ['back', 'next']
          }
        }
      }
    })
    expect(wrapper.text()).toContain('Connect Your Spotify Account')
  })

  it('shows connect button when not connected', () => {
    const wrapper = mount(OnboardingSpotifyPage, {
      global: {
        stubs: {
          OnboardingWizard: {
            template: `
              <div>
                <div>Step {{ currentStep }} of 4</div>
                <slot />
                <button>{{ nextButtonText }}</button>
              </div>
            `,
            props: ['currentStep', 'totalSteps', 'nextButtonText', 'canContinue'],
            emits: ['back', 'next']
          }
        }
      }
    })
    expect(wrapper.text()).toContain('Connect with Spotify')
  })

  it('shows success message when connected', async () => {
    const wrapper = mount(OnboardingSpotifyPage, {
      global: {
        stubs: {
          OnboardingWizard: {
            template: `
              <div>
                <div>Step {{ currentStep }} of 4</div>
                <slot />
                <button>{{ nextButtonText }}</button>
              </div>
            `,
            props: ['currentStep', 'totalSteps', 'nextButtonText', 'canContinue'],
            emits: ['back', 'next']
          }
        }
      }
    })

    // Simulate connecting Spotify
    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.text()).toContain('Spotify Connected!')
  })
})
