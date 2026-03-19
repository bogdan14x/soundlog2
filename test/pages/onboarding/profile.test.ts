import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OnboardingProfilePage from '../../../app/pages/onboarding/profile.vue'
import OnboardingWizard from '../../../app/components/OnboardingWizard.vue'

describe('OnboardingProfilePage', () => {
  it('renders profile setup header', () => {
    const wrapper = mount(OnboardingProfilePage, {
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
    expect(wrapper.text()).toContain('Set Up Your Profile')
  })

  it('has form fields for profile details', () => {
    const wrapper = mount(OnboardingProfilePage, {
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
    expect(wrapper.text()).toContain('Artist Name')
    expect(wrapper.text()).toContain('Bio')
    expect(wrapper.text()).toContain('Primary Genre')
    expect(wrapper.text()).toContain('Location')
  })

  it('has a profile image section', () => {
    const wrapper = mount(OnboardingProfilePage, {
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
    expect(wrapper.text()).toContain('Profile Image')
    expect(wrapper.text()).toContain('Change Image')
  })
})
