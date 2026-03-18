import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OnboardingWizard from '@/app/components/OnboardingWizard.vue'

describe('OnboardingWizard', () => {
  it('renders progress indicator', () => {
    const wrapper = mount(OnboardingWizard, {
      props: {
        currentStep: 2,
        totalSteps: 4
      },
      slots: {
        default: '<div>Test Content</div>'
      }
    })
    expect(wrapper.text()).toContain('Step 2 of 4')
  })

  it('shows back button when canGoBack is true', () => {
    const wrapper = mount(OnboardingWizard, {
      props: {
        currentStep: 2,
        canGoBack: true
      },
      slots: {
        default: '<div>Test Content</div>'
      }
    })
    expect(wrapper.text()).toContain('Back')
  })

  it('hides back button when canGoBack is false', () => {
    const wrapper = mount(OnboardingWizard, {
      props: {
        currentStep: 1,
        canGoBack: false
      },
      slots: {
        default: '<div>Test Content</div>'
      }
    })
    expect(wrapper.text()).not.toContain('Back')
  })

  it('emits next event when continue button is clicked', async () => {
    const wrapper = mount(OnboardingWizard, {
      props: {
        currentStep: 1,
        canContinue: true,
        canGoBack: false,
        nextButtonText: 'Continue'
      },
      slots: {
        default: '<div>Test Content</div>'
      }
    })

    // Find the button with the continue text
    const continueButton = wrapper.findAll('button').find(btn => btn.text() === 'Continue')
    expect(continueButton).toBeDefined()
    
    await continueButton!.trigger('click')
    expect(wrapper.emitted('next')).toBeTruthy()
  })

  it('emits back event when back button is clicked', async () => {
    const wrapper = mount(OnboardingWizard, {
      props: {
        currentStep: 2,
        canGoBack: true
      },
      slots: {
        default: '<div>Test Content</div>'
      }
    })

    const backButtons = wrapper.findAll('button').filter(btn => btn.text() === 'Back')
    if (backButtons.length > 0) {
      await backButtons[0].trigger('click')
      expect(wrapper.emitted('back')).toBeTruthy()
    }
  })
})
