import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OnboardingArtistPage from '@/app/pages/onboarding/artist.vue'
import OnboardingWizard from '@/app/components/OnboardingWizard.vue'

describe('OnboardingArtistPage', () => {
  it('renders artist selection header', () => {
    const wrapper = mount(OnboardingArtistPage, {
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
    expect(wrapper.text()).toContain('Select Your Artist')
  })

  it('shows list of artists', () => {
    const wrapper = mount(OnboardingArtistPage, {
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
    expect(wrapper.text()).toContain('Test Artist')
    expect(wrapper.text()).toContain('Another Project')
  })

  it('allows selecting an artist', async () => {
    const wrapper = mount(OnboardingArtistPage, {
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

    // Click on the first artist
    const artistCard = wrapper.find('.cursor-pointer')
    await artistCard.trigger('click')

    // Check if the artist is selected (ring-2 ring-blue-500 class)
    expect(artistCard.classes()).toContain('ring-2')
    expect(artistCard.classes()).toContain('ring-blue-500')
  })
})
