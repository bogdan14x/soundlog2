import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OnboardingIndexPage from '@/app/pages/onboarding/index.vue'

describe('OnboardingIndexPage', () => {
  it('renders welcome message', () => {
    const wrapper = mount(OnboardingIndexPage, {
      global: {
        stubs: {
          OnboardingWizard: {
            template: `
              <div>
                <div>Step {{ currentStep }} of {{ totalSteps }}</div>
                <slot />
                <button>{{ nextButtonText }}</button>
              </div>
            `,
            props: ['currentStep', 'totalSteps', 'nextButtonText'],
            emits: ['next']
          }
        }
      }
    })
    expect(wrapper.text()).toContain('Welcome to SoundLog')
  })

  it('shows step 1 in progress', () => {
    const wrapper = mount(OnboardingIndexPage, {
      global: {
        stubs: {
          OnboardingWizard: {
            template: `
              <div>
                <div>Step {{ currentStep }} of {{ totalSteps }}</div>
                <slot />
                <button>{{ nextButtonText }}</button>
              </div>
            `,
            props: ['currentStep', 'totalSteps', 'nextButtonText'],
            emits: ['next']
          }
        }
      }
    })
    expect(wrapper.text()).toContain('Step 1 of 4')
  })

  it('has get started button', () => {
    const wrapper = mount(OnboardingIndexPage, {
      global: {
        stubs: {
          OnboardingWizard: {
            template: `
              <div>
                <div>Step {{ currentStep }} of {{ totalSteps }}</div>
                <slot />
                <button>{{ nextButtonText }}</button>
              </div>
            `,
            props: ['currentStep', 'totalSteps', 'nextButtonText'],
            emits: ['next']
          }
        }
      }
    })
    expect(wrapper.text()).toContain('Get Started')
  })
})
