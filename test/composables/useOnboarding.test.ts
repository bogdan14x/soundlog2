import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOnboarding } from '../../app/composables/useOnboarding'

describe('useOnboarding', () => {
  beforeEach(() => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({
      success: true,
      data: { onboardingCompleted: false }
    }))
  })

  it('returns isCompleted ref', () => {
    const { isCompleted } = useOnboarding()
    expect(isCompleted).toBeDefined()
    expect(isCompleted.value).toBeTypeOf('boolean')
  })

  it('returns checkCompletion function', () => {
    const { checkCompletion } = useOnboarding()
    expect(checkCompletion).toBeDefined()
    expect(checkCompletion).toBeTypeOf('function')
  })

  it('returns completeOnboarding function', () => {
    const { completeOnboarding } = useOnboarding()
    expect(completeOnboarding).toBeDefined()
    expect(completeOnboarding).toBeTypeOf('function')
  })
})
